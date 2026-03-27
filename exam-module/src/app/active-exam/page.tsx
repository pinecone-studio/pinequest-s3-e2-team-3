"use client";

export const runtime = "edge";

import { normalizeVariationLabel } from "@/app/materials/_components/variation";
import { useProctor } from "@/providers/ProctorProvider";
import { useAudioProctor } from "@/providers/SpeechRecognizeProvider";

import {
  useRef,
  useCallback,
  useEffect,
  useState,
  use,
  useMemo,
} from "react";
import { ProctoringDashboard } from "./_components/ProctoringDashboard";
import {
  useCreateProctorLogMutation,
  useGetExamSessionForActiveExamQuery,
  useGetActiveExamTakingQuery,
  useSubmitExamAnswersMutation,
} from "@/gql/graphql";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function variationStorageKey(
  examId: string,
  studentId: string,
  sessionId: string,
) {
  return `pq-exam-variation:${examId}:${studentId}:${sessionId}`;
}

export default function ExamPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = use(searchParams);
  const studentId =
    typeof resolved.studentId === "string" ? resolved.studentId : "";
  const examId = typeof resolved.examId === "string" ? resolved.examId : "";
  const examSessionId =
    typeof resolved.examSessionId === "string" ? resolved.examSessionId : "";

  const legacyLink = Boolean(studentId && examId && !examSessionId);
  const sessionLink = Boolean(studentId && examSessionId);
  const linkValid = Boolean(studentId && (examSessionId || examId));

  const {
    data: sessionData,
    loading: sessionLoading,
    error: sessionError,
  } = useGetExamSessionForActiveExamQuery({
    variables: { id: examSessionId },
    skip: !examSessionId,
  });

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!examSessionId) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [examSessionId]);

  const session = sessionData?.examSession ?? null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastFlagTime = useRef<Record<string, number>>({});
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [createProctorLogMutation, {}] = useCreateProctorLogMutation();
  const [submitExamAnswersMutation, { loading: submitMutationLoading }] =
    useSubmitExamAnswersMutation();

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

  /** True once the timed session has been in the active window (so we keep exam data after end for submit). */
  const wasSessionActiveRef = useRef(false);
  useEffect(() => {
    if (sessionTimeState === "active") wasSessionActiveRef.current = true;
  }, [sessionTimeState]);

  /** Skip exam fetch before start, or if the session already ended before the student ever joined (late). */
  const skipExamTakingQuery = useMemo(() => {
    if (!effectiveExamId) return true;
    if (legacyLink) return false;
    if (!sessionLink || sessionTimeState === null) return true;
    if (sessionTimeState === "not_started") return true;
    if (sessionTimeState === "ended" && !wasSessionActiveRef.current) return true;
    return false;
  }, [effectiveExamId, legacyLink, sessionLink, sessionTimeState]);

  const shouldLoadExamContent = !skipExamTakingQuery;

  const {
    data: examData,
    loading: examLoading,
    error: examError,
  } = useGetActiveExamTakingQuery({
    variables: { examId: effectiveExamId },
    skip: skipExamTakingQuery || !effectiveExamId,
  });

  const allTakerQuestions = examData?.examQuestionsForTaker ?? [];

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
    if (submittedRef.current || submittingRef.current) return;
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
          answers: payload,
        },
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setSubmitError(
        e instanceof Error ? e.message : "Илгээхэд алдаа гарлаа. Дахин оролдоно уу.",
      );
    } finally {
      submittingRef.current = false;
    }
  }, [effectiveExamId, studentId, submitExamAnswersMutation]);

  const performSubmitRef = useRef(performSubmit);
  performSubmitRef.current = performSubmit;

  useEffect(() => {
    if (!sessionLink || !session || submitted) return;
    const endMs = Date.parse(session.endTime);
    const delay = endMs - Date.now();
    if (delay <= 0) {
      void performSubmitRef.current();
      return;
    }
    const id = window.setTimeout(() => void performSubmitRef.current(), delay);
    return () => window.clearTimeout(id);
  }, [sessionLink, session, submitted]);

  useEffect(() => {
    if (!sessionLink || !session || submitted) return;
    const endMs = Date.parse(session.endTime);
    if (now < endMs) return;
    void performSubmitRef.current();
  }, [sessionLink, session, now, submitted]);

  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Camera/mic: attach only when <video> mounts. An effect on [] ran while loading
  // spinners were shown, so videoRef was null and the stream was never bound.
  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (!node) {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
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
        },
      });
    },
    [studentId, effectiveExamId, createProctorLogMutation],
  );

  const examWindowActive = legacyLink || sessionTimeState === "active";

  useProctor(videoRef, examWindowActive ? reportFlag : () => {});
  useAudioProctor(examWindowActive ? reportFlag : () => {}, audioCanvasRef);

  if (!linkValid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалтын холбоос буруу байна.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          И-мэйлээр ирсэн холбоосоор орно уу (studentId болон examId эсвэл
          examSessionId заавал байх ёстой).
        </p>
      </div>
    );
  }

  if (sessionLink && sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-400">
          Шалгалтын хуваарь ачаалж байна…
        </p>
      </div>
    );
  }

  if (sessionLink && (sessionError || !session)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалтын сесс олдсонгүй.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Холбоос хүчингүй эсвэл хугацаа дууссан байж магадгүй. Багшид хандана
          уу.
        </p>
      </div>
    );
  }

  if (sessionLink && examId && session && session.examId !== examId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">
          Холбоосын өгөгдөл таарахгүй байна.
        </p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          examId болон examSessionId зөрчилтэй байна.
        </p>
      </div>
    );
  }

  if (sessionLink && session && sessionTimeState === "not_started") {
    const startMs = Date.parse(session.startTime);
    const untilStart = startMs - now;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалт одоогоор эхлээгүй байна.</p>
        <p className="mt-4 text-3xl font-mono tabular-nums text-blue-400">
          {formatCountdown(untilStart)}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Эхлэх цаг: {new Date(session.startTime).toLocaleString()}
        </p>
        <p className="mt-4 max-w-md text-xs text-slate-500">
          Шалгалтын асуултууд эхлэх цагт л харагдана.
        </p>
      </div>
    );
  }

  if (
    sessionLink &&
    session &&
    sessionTimeState === "ended" &&
    !wasSessionActiveRef.current
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалтын хугацаа дууссан.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Та шалгалтын цонхонд оролцоогүй тул асуулт харуулахгүй.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Дууссан: {new Date(session.endTime).toLocaleString()}
        </p>
      </div>
    );
  }

  if (sessionLink && session && sessionTimeState === "ended" && submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium text-green-400">Баярлалаа!</p>
        <p className="mt-2 max-w-md text-sm text-slate-300">
          Таны хариу амжилттай хадгалагдсан.
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Дууссан: {new Date(session.endTime).toLocaleString()}
        </p>
      </div>
    );
  }

  if (shouldLoadExamContent && examLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-400">
          Шалгалтын материал ачаалж байна…
        </p>
      </div>
    );
  }

  if (shouldLoadExamContent && (examError || !examData?.exam)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалтын материал олдсонгүй.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          {examError?.message ?? "Шалгалт устгагдсан эсвэл буруу байна."}
        </p>
      </div>
    );
  }

  if (
    shouldLoadExamContent &&
    examData?.exam &&
    (examData.examQuestionsForTaker?.length ?? 0) > 0 &&
    chosenVariation === null
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-400">Хувилбар сонгож байна…</p>
      </div>
    );
  }

  const examName = examData?.exam?.name ?? "Шалгалт";

  const headerTitle = session?.description?.trim()
    ? session.description
    : examName;

  const timeUpAwaitingSubmit =
    sessionLink && sessionTimeState === "ended" && !submitted;

  const inputsDisabled =
    !isCameraReady ||
    submitted ||
    submitMutationLoading ||
    Boolean(sessionLink && sessionTimeState === "ended");

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-black text-white font-sans">
      <header className="w-full max-w-7xl flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            {headerTitle}
          </h1>
          <p className="text-xs text-slate-400">
            Сурагч: {studentId} · Шалгалт: {effectiveExamId}
            {examSessionId ? ` · Сесс: ${examSessionId}` : null}
          </p>
          {chosenVariation ? (
            <p className="text-xs text-slate-500 mt-1">
              Хувилбар:{" "}
              <span className="text-slate-300 font-medium">
                {chosenVariation}
              </span>
            </p>
          ) : null}
          {session && (
            <>
              <p className="text-xs text-slate-500 mt-1">
                Эхэлсэн: {new Date(session.startTime).toLocaleString()} —
                Дуусах: {new Date(session.endTime).toLocaleString()}
              </p>
              <p className="text-xs text-amber-400/90 mt-1 font-medium tabular-nums">
                Үлдсэн хугацаа:{" "}
                {formatCountdown(
                  Math.max(0, Date.parse(session.endTime) - now),
                )}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isCameraReady && (
            <span className="text-xs text-yellow-500 animate-pulse">
              Initializing AI Sensors...
            </span>
          )}
          <div
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
              isCameraReady
                ? "bg-red-900/20 border-red-500 text-red-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-500"
            }`}
          >
            {isCameraReady ? "● LIVE MONITORING" : "OFFLINE"}
          </div>
        </div>
      </header>

      {timeUpAwaitingSubmit ? (
        <div className="w-full max-w-7xl mb-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          Шалгалтын цаг дууссан. Таны хариу автоматаар хадгалагдаж байна…
        </div>
      ) : null}
      {submitted ? (
        <div className="w-full max-w-7xl mb-4 rounded-2xl border border-green-500/40 bg-green-950/30 px-4 py-3 text-sm text-green-200">
          Хариу амжилттай илгээгдлээ.
        </div>
      ) : null}
      {submitError ? (
        <div className="w-full max-w-7xl mb-4 rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {submitError}
        </div>
      ) : null}

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        <div className="lg:col-span-3 space-y-6">
          {displayQuestions.length === 0 ? (
            <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 text-center text-slate-400">
              Энэ шалгалтад сонгогдох асуулт байхгүй байна.
            </div>
          ) : (
            displayQuestions.map((q, i) => (
              <div
                key={q.id}
                className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm"
              >
                <div className="flex items-baseline justify-between gap-4 mb-4">
                  <label className="block text-slate-400 text-sm uppercase tracking-widest font-semibold">
                    Асуулт {i + 1}
                  </label>
                </div>
                <p className="text-lg leading-relaxed mb-6 whitespace-pre-wrap text-slate-100">
                  {q.question}
                </p>
                <ul className="space-y-3">
                  {q.answers.map((label, idx) => {
                    const selected = choices[q.id] === idx;
                    return (
                      <li key={`${q.id}-${idx}`}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                            selected
                              ? "border-blue-500 bg-blue-950/40"
                              : "border-slate-700 bg-slate-800/40 hover:border-slate-500"
                          } ${inputsDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="mt-1"
                            checked={selected}
                            disabled={inputsDisabled}
                            onChange={() =>
                              setChoices((prev) => ({
                                ...prev,
                                [q.id]: idx,
                              }))
                            }
                          />
                          <span className="text-slate-200">{label}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}

          {displayQuestions.length > 0 && !submitted ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={inputsDisabled}
                onClick={() => void performSubmit()}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitMutationLoading ? "Илгээж байна…" : "Хариу илгээх"}
              </button>
              {sessionLink && session ? (
                <p className="text-xs text-slate-500 self-center">
                  Хугацаа дуусахад хариу автоматаар илгээгдэнэ.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <ProctoringDashboard
          videoRef={videoRefCallback}
          audioCanvasRef={audioCanvasRef}
          isReady={isCameraReady}
        />
      </main>
    </div>
  );
}
