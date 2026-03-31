"use client";


import { useLiveKitExamPublisher } from "@/hooks/useLiveKitExamPublisher";
import { useProctor } from "@/providers/ProctorProvider";
import { useVoiceProctoring } from "@/hooks/useVoiceProctoring";
import {
  useCreateProctorLogMutation,
  useGetExamSessionForActiveExamQuery,
  useGetActiveExamTakingQuery,
  useMarkStudentExamSessionStartedMutation,
  useSubmitExamAnswersMutation,
} from "@/gql/graphql";
import { useSearchParams } from "next/navigation";
import {
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { ProctoringDashboard } from "./ProctoringDashboard";
import { ActiveExamBanners } from "./ActiveExamBanners";
import { ActiveExamHeader } from "./ActiveExamHeader";
import { ActiveExamQuestionsColumn } from "./ActiveExamQuestionsColumn";
import {
  ExamMaterialErrorScreen,
  ExamMaterialLoadingScreen,
  InvalidLinkScreen,
  SessionEndedLateScreen,
  SessionExamIdMismatchScreen,
  SessionNotFoundScreen,
  SessionNotStartedScreen,
  SessionScheduleLoadingScreen,
  SessionSubmittedThanksScreen,
  VariationPickingScreen,
} from "./ActiveExamGateScreens";
import { variationStorageKey } from "./active-exam-utils";
import { normalizeVariationLabel } from "@/app/(dashboard)/materials/_components/variation";
import { useExamIntegrity, syncOfflineAnswers } from "./useExamIntegrity";

export function ActiveExamPageContent() {
  const searchParams = useSearchParams();
  const studentId = (searchParams.get("studentId") ?? "").trim();
  const examId = (searchParams.get("examId") ?? "").trim();
  const examSessionId = (searchParams.get("examSessionId") ?? "").trim();

  const legacyLink = Boolean(studentId && examId && !examSessionId);
  const sessionLink = Boolean(studentId && examSessionId);
  const linkValid = Boolean(studentId && (examSessionId || examId));

  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
  } = useGetExamSessionForActiveExamQuery({
    variables: { id: examSessionId, studentId },
    skip: !examSessionId || !studentId,
  });

  const sessionFetchIncomplete =
    Boolean(examSessionId) && sessionLoading && sessionData === undefined;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!examSessionId) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [examSessionId]);

  const session = sessionData?.examSession ?? null;
  const sessionAlreadyFinished = Boolean(
    sessionData?.studentExamSessionStatus?.isFinished,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastFlagTime = useRef<Record<string, number>>({});
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [examMediaStream, setExamMediaStream] = useState<MediaStream | null>(
    null,
  );

  const [createProctorLogMutation, {}] = useCreateProctorLogMutation();
  const [markStudentExamSessionStartedMutation] =
    useMarkStudentExamSessionStartedMutation();
  const [submitExamAnswersMutation, { loading: submitMutationLoading }] =
    useSubmitExamAnswersMutation();

  const sessionIdForMarkStarted = session?.id;

  useEffect(() => {
    if (
      !sessionLink ||
      !examSessionId ||
      !studentId ||
      !sessionIdForMarkStarted ||
      sessionAlreadyFinished
    )
      return;
    void markStudentExamSessionStartedMutation({
      variables: { sessionId: examSessionId, studentId },
    }).catch((err) => {
      console.error("[markStudentExamSessionStarted]", err);
    });
  }, [
    sessionLink,
    examSessionId,
    studentId,
    sessionIdForMarkStarted,
    sessionAlreadyFinished,
    markStudentExamSessionStartedMutation,
  ]);

  const [choices, setChoices] = useState<Record<string, number>>({});
  const [chosenVariation, setChosenVariation] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const choicesRef = useRef(choices);
  const submittedRef = useRef(submitted);
  const submittingRef = useRef(false);
  const displayQuestionsRef = useRef<
    Array<{
      id: string;
      question: string;
      answers: Array<string>;
      variation: string;
    }>
  >([]);

  useEffect(() => {
    choicesRef.current = choices;
  }, [choices]);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  const effectiveExamId = session?.examId ?? examId;

  const sessionTimeState =
    session && examSessionId
      ? (() => {
          const start = Date.parse(session.startTime);
          const end = Date.parse(session.endTime);
          if (now < start) return "not_started" as const;
          if (now > end) return "ended" as const;
          return "active" as const;
        })()
      : null;

  const wasSessionActiveRef = useRef(false);
  useEffect(() => {
    if (sessionTimeState === "active") wasSessionActiveRef.current = true;
  }, [sessionTimeState]);

  const skipExamTakingQuery = useMemo(() => {
    if (!effectiveExamId) return true;
    if (legacyLink) return false;
    if (!sessionLink || sessionTimeState === null) return true;
    if (sessionAlreadyFinished) return true;
    if (sessionTimeState === "not_started") return true;
    if (sessionTimeState === "ended" && !wasSessionActiveRef.current)
      return true;
    return false;
  }, [
    effectiveExamId,
    legacyLink,
    sessionLink,
    sessionTimeState,
    sessionAlreadyFinished,
  ]);

  const shouldLoadExamContent = !skipExamTakingQuery;

  const {
    data: examData,
    loading: examLoading,
    error: examError,
  } = useGetActiveExamTakingQuery({
    variables: { examId: effectiveExamId },
    skip: skipExamTakingQuery || !effectiveExamId,
  });

  const allTakerQuestions = useMemo(
    () => examData?.examQuestionsForTaker ?? [],
    [examData?.examQuestionsForTaker],
  );

  useEffect(() => {
    if (!shouldLoadExamContent || examLoading || !examData?.exam) return;
    const list = examData.examQuestionsForTaker ?? [];
    if (list.length === 0) {
      setChosenVariation("");
      return;
    }
    const vars = [
      ...new Set(list.map((q) => normalizeVariationLabel(q.variation))),
    ].sort();
    const key = variationStorageKey(
      effectiveExamId,
      studentId,
      examSessionId || "legacy",
    );
    try {
      const stored = sessionStorage.getItem(key);
      if (stored && vars.includes(stored)) {
        setChosenVariation(stored);
        return;
      }
      const picked = vars[Math.floor(Math.random() * vars.length)]!;
      sessionStorage.setItem(key, picked);
      setChosenVariation(picked);
    } catch {
      const picked = vars[Math.floor(Math.random() * vars.length)]!;
      setChosenVariation(picked);
    }
  }, [
    shouldLoadExamContent,
    examLoading,
    examData,
    effectiveExamId,
    studentId,
    examSessionId,
  ]);

  const displayQuestions = useMemo(() => {
    if (chosenVariation === null || chosenVariation === "") return [];
    return allTakerQuestions
      .filter(
        (q) => normalizeVariationLabel(q.variation) === chosenVariation,
      )
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [allTakerQuestions, chosenVariation]);

  useEffect(() => {
    displayQuestionsRef.current = displayQuestions;
  }, [displayQuestions]);

  const performSubmit = useCallback(async () => {
    if (
      submittedRef.current ||
      submittingRef.current ||
      sessionAlreadyFinished
    )
      return;
    const exam = effectiveExamId;
    if (!exam || !studentId) return;
    submittingRef.current = true;
    setSubmitError(null);
    try {
      const qs = displayQuestionsRef.current;
      const payload = qs
        .map((q) => ({
          questionId: q.id,
          answerIndex: choicesRef.current[q.id],
        }))
        .filter(
          (x): x is { questionId: string; answerIndex: number } =>
            typeof x.answerIndex === "number" && x.answerIndex >= 0,
        );
      await submitExamAnswersMutation({
        variables: {
          studentId,
          examId: exam,
          sessionId: examSessionId || undefined,
          answers: payload,
        },
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setSubmitError(
        e instanceof Error
          ? e.message
          : "Илгээхэд алдаа гарлаа. Дахин оролдоно уу.",
      );
    } finally {
      submittingRef.current = false;
    }
  }, [
    effectiveExamId,
    studentId,
    examSessionId,
    sessionAlreadyFinished,
    submitExamAnswersMutation,
  ]);

  const performSubmitRef = useRef(performSubmit);
  performSubmitRef.current = performSubmit;

  useEffect(() => {
    if (!sessionLink || !session || submitted || sessionAlreadyFinished) return;
    const endMs = Date.parse(session.endTime);
    const delay = endMs - Date.now();
    if (delay <= 0) {
      void performSubmitRef.current();
      return;
    }
    const id = window.setTimeout(() => void performSubmitRef.current(), delay);
    return () => window.clearTimeout(id);
  }, [sessionLink, session, submitted, sessionAlreadyFinished]);

  useEffect(() => {
    if (!sessionLink || !session || submitted || sessionAlreadyFinished) return;
    const endMs = Date.parse(session.endTime);
    if (now < endMs) return;
    void performSubmitRef.current();
  }, [sessionLink, session, now, submitted, sessionAlreadyFinished]);

  const cameraStreamRef = useRef<MediaStream | null>(null);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (!node) {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      setExamMediaStream(null);
      setIsCameraReady(false);
      return;
    }
    if (node.srcObject) return;

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
        if (videoRef.current !== node) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        cameraStreamRef.current = stream;
        setExamMediaStream(stream);
        node.srcObject = stream;
        node.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
        void node.play().catch(() => {});
      } catch (err) {
        console.error("Camera/Mic Access Denied:", err);
        alert(
          "Please allow camera and microphone access to continue the exam.",
        );
      }
    })();
  }, []);

  const reportFlag = useCallback(
    async (type: string) => {
      const nowMs = Date.now();
      const cooldown = 2000;

      if (nowMs - (lastFlagTime.current[type] || 0) < cooldown) return;

      lastFlagTime.current[type] = nowMs;
      console.warn(`[PROCTOR ALERT] ${type}`);

      await createProctorLogMutation({
        variables: {
          eventType: type,
          studentId,
          examId: effectiveExamId || undefined,
          sessionId: examSessionId || undefined,
        },
      });
    },
    [studentId, effectiveExamId, examSessionId, createProctorLogMutation],
  );

  const examWindowActive =
    legacyLink || (sessionTimeState === "active" && !sessionAlreadyFinished);

  // ── Exam integrity: offline detection, tab-switch, copy-paste block, idle ──
  const integrityActive = examWindowActive && !submitted;
  useExamIntegrity({
    active: integrityActive,
    reportFlag,
    studentId,
    examId: effectiveExamId || undefined,
    sessionId: examSessionId || undefined,
  });

  useProctor(videoRef, reportFlag, examWindowActive);
  const { isSpeechDetected } = useVoiceProctoring({
    onFlag: reportFlag,
    enabled: examWindowActive,
  });

  useLiveKitExamPublisher({
    roomName: examSessionId || null,
    identity: studentId,
    mediaStream: examMediaStream,
    enabled:
      Boolean(examSessionId && studentId) &&
      examWindowActive &&
      Boolean(examMediaStream),
  });

  if (!linkValid) {
    return <InvalidLinkScreen />;
  }

  if (sessionLink && sessionFetchIncomplete) {
    return <SessionScheduleLoadingScreen />;
  }

  if (sessionLink && (sessionError || !session)) {
    return <SessionNotFoundScreen />;
  }

  if (sessionLink && examId && session && session.examId !== examId) {
    return <SessionExamIdMismatchScreen />;
  }

  if (sessionLink && session && sessionAlreadyFinished) {
    return <SessionSubmittedThanksScreen session={session} />;
  }

  if (sessionLink && session && sessionTimeState === "not_started") {
    return <SessionNotStartedScreen session={session} now={now} />;
  }

  if (
    sessionLink &&
    session &&
    sessionTimeState === "ended" &&
    !wasSessionActiveRef.current
  ) {
    return <SessionEndedLateScreen session={session} />;
  }

  if (sessionLink && session && sessionTimeState === "ended" && submitted) {
    return <SessionSubmittedThanksScreen session={session} />;
  }

  if (shouldLoadExamContent && examLoading) {
    return <ExamMaterialLoadingScreen />;
  }

  if (shouldLoadExamContent && (examError || !examData?.exam)) {
    return (
      <ExamMaterialErrorScreen
        message={
          examError?.message ?? "Шалгалт устгагдсан эсвэл буруу байна."
        }
      />
    );
  }

  if (
    shouldLoadExamContent &&
    examData?.exam &&
    (examData.examQuestionsForTaker?.length ?? 0) > 0 &&
    chosenVariation === null
  ) {
    return <VariationPickingScreen />;
  }

  const examName = examData?.exam?.name ?? "Шалгалт";

  const headerTitle = session?.description?.trim()
    ? session.description
    : examName;

  const timeUpAwaitingSubmit =
    sessionLink &&
    sessionTimeState === "ended" &&
    !submitted &&
    !sessionAlreadyFinished;

  const inputsDisabled =
    !isCameraReady ||
    submitted ||
    sessionAlreadyFinished ||
    submitMutationLoading ||
    Boolean(sessionLink && sessionTimeState === "ended");

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-black text-white font-sans">
      <ActiveExamHeader
        title={headerTitle}
        studentId={studentId}
        effectiveExamId={effectiveExamId}
        examSessionId={examSessionId}
        chosenVariation={chosenVariation}
        session={session}
        now={now}
        isCameraReady={isCameraReady}
      />

      <ActiveExamBanners
        timeUpAwaitingSubmit={timeUpAwaitingSubmit}
        submitted={submitted}
        submitError={submitError}
      />

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        <ActiveExamQuestionsColumn
          displayQuestions={displayQuestions}
          choices={choices}
          onChoiceChange={(questionId, answerIndex) => {
            setChoices((prev) => ({ ...prev, [questionId]: answerIndex }));
          }}
          inputsDisabled={inputsDisabled}
          submitted={submitted}
          submitMutationLoading={submitMutationLoading}
          onSubmit={() => void performSubmit()}
          sessionLink={sessionLink}
          hasSession={Boolean(session)}
        />

        <ProctoringDashboard
          videoRef={videoRefCallback}
          isReady={isCameraReady}
          isSpeechDetected={isSpeechDetected}
        />
      </main>
    </div>
  );
}
