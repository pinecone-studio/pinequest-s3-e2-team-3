"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useCreateExamMaterialMutation,
  useCreateQuestionMutation,
  useGetExamCreateOptionsQuery,
  useTopicsBySubjectQuery,
} from "@/gql/graphql";
import { buildQuestionPayload } from "../_components/buildQuestionPayload";
import QuestionForm from "../_components/questionForm";
import { Question } from "../_components/mock";

const CONCURRENCY = 5;

async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIdx = 0;

  async function worker() {
    while (nextIdx < items.length) {
      const i = nextIdx++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => worker()),
  );
  return results;
}

export default function CreateMaterialPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creatorId] = useState<string>(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const user = JSON.parse(raw) as { id?: string };
      return user.id ?? "";
    } catch {
      return "";
    }
  });
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "", answers: ["", "", ""], score: 2, correctIndex: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "success2" | "error"
  >("idle");
  const [savePhase, setSavePhase] = useState<1 | 2>(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [parseStatus, setParseStatus] = useState<
    "idle" | "loading" | "processing" | "success" | "success2" | "error"
  >("idle");
  const [demoPhaseIdx, setDemoPhaseIdx] = useState(0);
  const demoPhases: Array<
    "loading" | "processing" | "success" | "success2" | "error"
  > = ["loading", "processing", "success", "success2", "error"];
  const parsing = parseStatus === "loading" || parseStatus === "processing";
  const [parseError, setParseError] = useState<string | null>(null);
  const parseStepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const mammothRef = useRef<typeof import("mammoth") | null>(null);

  const { data: optionsData, loading: optionsLoading } =
    useGetExamCreateOptionsQuery();
  const { data: topicsData, loading: topicsLoading } = useTopicsBySubjectQuery({
    variables: { subjectId },
    skip: !subjectId,
  });

  const [createExam] = useCreateExamMaterialMutation();
  const [createQuestion] = useCreateQuestionMutation();

  useEffect(() => {
    const subjects = optionsData?.subjects ?? [];
    if (!subjectId && subjects[0]) setSubjectId(subjects[0].id);
  }, [optionsData, subjectId]);

  useEffect(() => {
    const list = topicsData?.topics ?? [];
    if (list.length === 0) {
      setTopicId("");
      return;
    }
    if (!list.some((t) => t.id === topicId)) {
      setTopicId(list[0]!.id);
    }
  }, [topicsData, topicId]);

  useEffect(() => {
    import("mammoth").then((m) => {
      mammothRef.current = m;
    });
  }, []);

  const fillDemoMathExam = () => {
    setError(null);
    const t = Date.now();
    setTitle("Demo — Математик шалгалт");
    setQuestions([
      {
        id: t,
        text: "2 + 3 = ?",
        answers: ["4", "5", "6", "7"],
        score: 2,
        correctIndex: 1,
      },
      {
        id: t + 1,
        text: "7 × 8 = ?",
        answers: ["54", "56", "63", "64"],
        score: 2,
        correctIndex: 1,
      },
      {
        id: t + 2,
        text: "√16 = ?",
        answers: ["2", "4", "8", "16"],
        score: 2,
        correctIndex: 1,
      },
    ]);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "",
        answers: ["", "", ""],
        score: 2,
        correctIndex: 0,
      },
    ]);
  };

  const updateQuestion = (id: number, updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const deleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDocxUpload = useCallback(async (file: File) => {
    setError(null);
    setParseError(null);
    setParseStatus("loading");
    // After 1.2s switch to "processing"
    parseStepTimersRef.current.forEach(clearTimeout);
    parseStepTimersRef.current = [];
    const phaseTimer = setTimeout(() => setParseStatus("processing"), 1200);
    parseStepTimersRef.current.push(phaseTimer);
    try {
      const mammoth = mammothRef.current ?? (await import("mammoth"));
      const arrayBuffer = await file.arrayBuffer();

      const extractedImages: File[] = [];

      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement(
            async (image: {
              read: (enc: string) => Promise<string>;
              contentType?: string;
            }) => {
              const base64 = await image.read("base64");
              const contentType = image.contentType ?? "image/png";
              const resp = await fetch(`data:${contentType};base64,${base64}`);
              const bytes = new Uint8Array(await resp.arrayBuffer());
              const ext =
                contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
              const idx = extractedImages.length + 1;
              extractedImages.push(
                new File([bytes], `image-${idx}.${ext}`, {
                  type: contentType,
                }),
              );
              return { src: `__IMAGE_MARKER_${idx}__` };
            },
          ),
        },
      );

      let html = result.value;
      html = html.replace(
        /<img[^>]*src="__IMAGE_MARKER_(\d+)__"[^>]*>/g,
        (_match: string, idx: string) => `[IMAGE_${idx}]`,
      );
      const text = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<\/tr>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (!text) {
        const msg = "Word файлаас текст олдсонгүй.";
        setError(msg);
        setParseError(msg);
        setParseStatus("error");
        return;
      }

      const res = await fetch("/api/parse-exam-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body = (await res.json().catch(() => null)) as {
        questions?: Array<{
          question: string;
          answers: string[];
          imageMarker: string | null;
        }>;
        error?: string;
      } | null;

      if (!res.ok || !body?.questions) {
        throw new Error(body?.error ?? "Асуултуудыг задлахад алдаа гарлаа.");
      }

      const now = Date.now();
      const parsed: Question[] = body.questions.map((q, i) => {
        let attachmentFile: File | null = null;
        if (q.imageMarker) {
          const match = q.imageMarker.match(/\d+/);
          if (match) {
            const imgIdx = parseInt(match[0], 10) - 1;
            if (imgIdx >= 0 && imgIdx < extractedImages.length) {
              attachmentFile = extractedImages[imgIdx];
            }
          }
        }
        return {
          id: now + i,
          text: q.question,
          answers: q.answers.length >= 2 ? q.answers : ["", "", ""],
          score: 2,
          correctIndex: 0,
          attachmentFile,
        };
      });

      if (parsed.length === 0) {
        const msg = "Файлаас асуулт олдсонгүй.";
        setError(msg);
        setParseError(msg);
        setParseStatus("error");
        return;
      }

      setQuestions(parsed);
      // Show success screens
      setParseStatus("success");
      setTimeout(() => {
        setParseStatus("success2");
        setTimeout(() => setParseStatus("idle"), 2000);
      }, 1800);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Word файл боловсруулахад алдаа гарлаа.";
      setError(msg);
      setParseError(msg);
      setParseStatus("error");
    } finally {
      parseStepTimersRef.current.forEach(clearTimeout);
      parseStepTimersRef.current = [];
    }
  }, []);

  const handleSave = async () => {
    setError(null);

    const name = title.trim();
    if (!name) {
      setError("Шалгалтын нэр оруулна уу.");
      return;
    }
    if (!creatorId || !subjectId || !topicId) {
      setError("Багш, хичээлийн чиглэл, сэдэв сонгоно уу.");
      return;
    }

    const payloads: NonNullable<ReturnType<typeof buildQuestionPayload>>[] = [];
    for (let i = 0; i < questions.length; i++) {
      const p = buildQuestionPayload(questions[i]);
      if (!p) {
        setError(
          `${i + 1}-р асуулт: асуулт болон хоёр ба түүнээс дээш бөглөгдсөн хариулт, мөн зөв хариултыг сонгоно уу.`,
        );
        return;
      }
      payloads.push(p);
    }

    setSaving(true);
    setSavePhase(1);
    setSaveStatus("saving");
    setSaveError(null);
    // After 1.2s switch to phase 2 "Боловсруулж байна..."
    const phaseTimer = setTimeout(() => setSavePhase(2), 1200);
    try {
      const examRes = await createExam({
        variables: { name, creatorId, subjectId, topicId, isPublic },
      });
      const examId = examRes.data?.createExam.id;
      if (!examId) {
        throw new Error("Шалгалт үүсгэгдсэнгүй.");
      }

      const attachmentKeys = await mapWithConcurrency(questions, async (q) => {
        if (!q.attachmentFile) return undefined;
        const fd = new FormData();
        fd.append("examId", examId);
        fd.append("file", q.attachmentFile);
        const up = await fetch("/api/upload/question-attachment", {
          method: "POST",
          body: fd,
        });
        const body = (await up.json().catch(() => null)) as {
          error?: string;
          key?: string;
        } | null;
        if (!up.ok) {
          throw new Error(
            body?.error ?? "Файл оруулахад алдаа гарлаа. Дахин оролдоно уу.",
          );
        }
        if (!body?.key) {
          throw new Error("Файл оруулахад алдаа гарлаа.");
        }
        return body.key;
      });

      await mapWithConcurrency(payloads, async (p, i) => {
        const qRes = await createQuestion({
          variables: {
            examId,
            question: p.question,
            answers: p.answers,
            correctIndex: p.correctIndex,
            variation: "A",
            attachmentKey: attachmentKeys[i],
          },
        });
        if (!qRes.data?.createQuestion?.id) {
          throw new Error("Асуулт хадгалагдсангүй.");
        }
      });

      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("success2");
        setTimeout(() => {
          router.push(`/materials/${examId}`);
        }, 2200);
      }, 1800);
    } catch (e) {
      clearTimeout(phaseTimer);
      const msg = e instanceof Error ? e.message : "Алдаа гарлаа.";
      setError(msg);
      setSaveError(msg);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 sm:p-10">
      {/* ── Overlays ─────────────────────────────────────────────────────── */}

      {/* DOCX Parse Overlay — all 4 phases in one modal */}
      {parseStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl px-10 pt-10 pb-9 flex flex-col items-center gap-5">
            {(parseStatus === "success" ||
              parseStatus === "success2" ||
              parseStatus === "error") && (
              <button
                type="button"
                onClick={() => {
                  setParseStatus("idle");
                  setParseError(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl font-light"
              >
                ✕
              </button>
            )}

            {/* Phase 1 & 2 — step-based loading UI */}
            {(parseStatus === "loading" || parseStatus === "processing") && (
              <>
                {/* Spiky star spinner */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-1">
                  <svg
                    width="44"
                    height="46"
                    viewBox="0 0 44 46"
                    fill="none"
                    className="animate-spin"
                    style={{ animationDuration: "1.4s" }}
                  >
                    <path
                      d="M19.9577 1.1197C20.8976 -0.373232 23.1024 -0.373235 24.0423 1.1197L26.2952 4.69831C26.9131 5.67983 28.1596 6.07887 29.2451 5.64264L33.2027 4.05214C34.8538 3.38861 36.6375 4.66539 36.5072 6.41747L36.1948 10.6173C36.1091 11.7692 36.8796 12.8139 38.018 13.0896L42.1687 14.0947C43.9003 14.514 44.5816 16.5799 43.4309 17.9219L40.6725 21.1387C39.916 22.021 39.916 23.3123 40.6725 24.1946L43.4309 27.4114C44.5816 28.7535 43.9003 30.8193 42.1687 31.2386L38.018 32.2438C36.8796 32.5194 36.1091 33.5642 36.1948 34.716L36.5072 38.9159C36.6375 40.668 34.8538 41.9447 33.2027 41.2812L29.2451 39.6907C28.1596 39.2545 26.9131 39.6535 26.2952 40.635L24.0423 44.2136C23.1024 45.7066 20.8976 45.7066 19.9577 44.2136L17.7048 40.635C17.0869 39.6535 15.8404 39.2545 14.7549 39.6907L10.7973 41.2812C9.14619 41.9447 7.36249 40.668 7.49281 38.9159L7.80517 34.716C7.89085 33.5642 7.12044 32.5194 5.98202 32.2438L1.83131 31.2386C0.0997135 30.8193 -0.581601 28.7535 0.569126 27.4114L3.32746 24.1946C4.08399 23.3123 4.08399 22.021 3.32746 21.1387L0.569128 17.9219C-0.581599 16.5799 0.0997107 14.514 1.83131 14.0947L5.98201 13.0896C7.12044 12.8139 7.89085 11.7692 7.80517 10.6173L7.49281 6.41748C7.36249 4.66539 9.14619 3.38861 10.7972 4.05214L14.7549 5.64264C15.8404 6.07887 17.0869 5.67983 17.7048 4.69831L19.9577 1.1197Z"
                      fill="#6750A4"
                    />
                  </svg>
                </div>

                <p className="text-[19px] font-bold text-gray-900 tracking-tight text-center">
                  {parseStatus === "loading" ? "Ачаалж байна..." : "Боловсруулж байна..."}
                </p>
                <p className="text-sm text-gray-400 -mt-3 text-center">
                  Хэсэг хугацаа хүлээнэ үү
                </p>

                {/* Step list */}
                <div className="w-full flex flex-col gap-3 mt-1">
                  {/* Step 1 — always done */}
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-indigo-700">Файл уншиж байна</span>
                  </div>

                  {/* Step 2 — done on processing, pending on loading */}
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${parseStatus === "processing" ? "bg-indigo-700" : "border-2 border-gray-300"}`}>
                      {parseStatus === "processing" ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">2</span>
                      )}
                    </span>
                    <span className={`text-sm font-medium ${parseStatus === "processing" ? "text-indigo-700" : "text-gray-400"}`}>
                      Текст задлаж байна
                    </span>
                  </div>

                  {/* Step 3 — always pending */}
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-gray-400">3</span>
                    </span>
                    <span className="text-sm font-medium text-gray-400">
                      AI-аар асуулт боловсруулж байна
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: parseStatus === "processing" ? "66%" : "33%" }}
                  />
                </div>
              </>
            )}

            {/* Phase 3 — flying ghost success */}
            {parseStatus === "success" && (
              <>
                <div className="relative w-56 h-48 flex items-center justify-center mb-1">
                  <svg
                    className="absolute left-0 top-10 w-16 opacity-90"
                    viewBox="0 0 70 38"
                    fill="none"
                  >
                    <ellipse cx="35" cy="26" rx="32" ry="14" fill="#C3B1F5" />
                    <ellipse cx="22" cy="20" rx="18" ry="12" fill="#C3B1F5" />
                    <ellipse cx="42" cy="18" rx="16" ry="11" fill="#D4C5F9" />
                  </svg>
                  <svg
                    className="absolute right-0 bottom-4 w-14 opacity-80"
                    viewBox="0 0 60 35"
                    fill="none"
                  >
                    <ellipse cx="30" cy="22" rx="28" ry="13" fill="#C3B1F5" />
                    <ellipse cx="18" cy="17" rx="15" ry="10" fill="#D4C5F9" />
                  </svg>
                  <svg
                    className="absolute left-10 top-2 w-7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2l1.6 5H19l-4.2 3 1.6 5L12 12l-4.4 3 1.6-5L5 7h5.4z"
                      fill="#F9C23C"
                    />
                  </svg>
                  <svg
                    className="absolute right-2 top-10 w-10"
                    viewBox="0 0 40 40"
                    fill="none"
                  >
                    <circle cx="20" cy="20" r="10" fill="#6DBF8A" />
                    <ellipse
                      cx="20"
                      cy="20"
                      rx="19"
                      ry="6"
                      stroke="#4EA870"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  <svg
                    className="relative z-10 drop-shadow-lg"
                    style={{
                      filter: "drop-shadow(0 6px 20px #a29bfe44)",
                      width: 120,
                    }}
                    viewBox="0 0 140 130"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="parse-fly-ghost"
                        x1="70"
                        y1="0"
                        x2="70"
                        y2="130"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#C4B5FD" />
                        <stop offset="100%" stopColor="#7C6FE0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M30 65 Q28 30 65 20 Q105 22 115 55 Q122 80 108 100 Q92 118 65 112 Q38 106 25 88 Q18 78 30 65Z"
                      fill="url(#parse-fly-ghost)"
                    />
                    <line
                      x1="65"
                      y1="20"
                      x2="78"
                      y2="4"
                      stroke="#A29BFE"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="79" cy="3" r="5" fill="#7C6FE0" />
                    <circle cx="72" cy="62" r="9" fill="#fff" />
                    <circle cx="98" cy="58" r="8" fill="#fff" />
                    <circle cx="74" cy="64" r="4.5" fill="#3B1F8C" />
                    <circle cx="100" cy="60" r="4" fill="#3B1F8C" />
                    <circle cx="76" cy="62" r="1.8" fill="#fff" />
                    <circle cx="102" cy="58" r="1.5" fill="#fff" />
                    <path
                      d="M70 80 Q84 92 96 80"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <ellipse
                      cx="63"
                      cy="74"
                      rx="7"
                      ry="4"
                      fill="#E9D5FF"
                      opacity="0.6"
                    />
                    <ellipse
                      cx="106"
                      cy="70"
                      rx="6"
                      ry="3.5"
                      fill="#E9D5FF"
                      opacity="0.6"
                    />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight text-center">
                  Амжилттай уншлаа
                </p>
              </>
            )}

            {/* Phase 4 — round ghost with sparkles */}
            {parseStatus === "success2" && (
              <>
                <div className="relative w-52 h-44 flex items-center justify-center mb-1">
                  {[
                    { top: "4px", left: "10px", size: 22 },
                    { top: "0px", right: "18px", size: 26 },
                    { top: "30px", right: "4px", size: 18 },
                    { bottom: "8px", right: "12px", size: 20 },
                    { bottom: "4px", left: "16px", size: 18 },
                    { top: "50%", left: "2px", size: 16 },
                  ].map((s, i) => (
                    <svg
                      key={i}
                      className="absolute"
                      style={{
                        top: s.top,
                        left: s.left,
                        right: (s as Record<string, unknown>).right as
                          | string
                          | undefined,
                        bottom: (s as Record<string, unknown>).bottom as
                          | string
                          | undefined,
                        width: s.size,
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z"
                        fill="#F9C23C"
                      />
                    </svg>
                  ))}
                  <svg
                    className="relative z-10 drop-shadow-lg"
                    style={{ width: 110 }}
                    viewBox="0 0 120 150"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="parse-round-ghost"
                        x1="60"
                        y1="10"
                        x2="60"
                        y2="150"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#D0C4F7" />
                        <stop offset="100%" stopColor="#9B8EE8" />
                      </linearGradient>
                    </defs>
                    <ellipse
                      cx="60"
                      cy="72"
                      rx="42"
                      ry="44"
                      fill="url(#parse-round-ghost)"
                    />
                    <path
                      d="M18 100 Q18 130 30 130 Q38 130 38 120 Q38 132 50 132 Q60 132 60 122 Q60 132 70 132 Q82 132 82 120 Q82 130 90 130 Q102 130 102 100"
                      fill="url(#parse-round-ghost)"
                    />
                    <circle cx="47" cy="68" r="7" fill="#fff" />
                    <circle cx="73" cy="68" r="7" fill="#fff" />
                    <circle cx="49" cy="70" r="3.5" fill="#3B1F8C" />
                    <circle cx="75" cy="70" r="3.5" fill="#3B1F8C" />
                    <circle cx="50" cy="68" r="1.5" fill="#fff" />
                    <circle cx="76" cy="68" r="1.5" fill="#fff" />
                    <path
                      d="M50 84 Q60 93 70 84"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <ellipse
                      cx="40"
                      cy="78"
                      rx="7"
                      ry="4"
                      fill="#E9D5FF"
                      opacity="0.55"
                    />
                    <ellipse
                      cx="80"
                      cy="78"
                      rx="7"
                      ry="4"
                      fill="#E9D5FF"
                      opacity="0.55"
                    />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight text-center">
                  Файл амжилттай уншлаа
                </p>
                <p className="text-sm text-gray-400 -mt-2 text-center">
                  Асуултуудыг доор шалгаарай
                </p>
              </>
            )}

            {/* Error */}
            {parseStatus === "error" && (
              <>
                <div className="relative w-52 h-44 flex items-center justify-center mb-1">
                  <svg
                    className="absolute left-0 top-4 w-16"
                    viewBox="0 0 70 60"
                    fill="none"
                  >
                    <ellipse cx="35" cy="25" rx="32" ry="16" fill="#6A5FA6" />
                    <ellipse cx="22" cy="20" rx="18" ry="13" fill="#7B72B8" />
                    <line
                      x1="22"
                      y1="42"
                      x2="18"
                      y2="56"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="32"
                      y1="44"
                      x2="28"
                      y2="58"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="42"
                      y1="42"
                      x2="38"
                      y2="56"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg
                    className="absolute right-0 top-0 w-20"
                    viewBox="0 0 80 65"
                    fill="none"
                  >
                    <ellipse cx="40" cy="28" rx="36" ry="18" fill="#5A5299" />
                    <ellipse cx="26" cy="22" rx="20" ry="15" fill="#6A62AA" />
                    <line
                      x1="25"
                      y1="46"
                      x2="21"
                      y2="60"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="37"
                      y1="48"
                      x2="33"
                      y2="62"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="49"
                      y1="46"
                      x2="45"
                      y2="60"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg
                    className="relative z-10 w-24 drop-shadow-lg"
                    viewBox="0 0 120 160"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="parse-sad-ghost"
                        x1="60"
                        y1="20"
                        x2="60"
                        y2="160"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#B8B0F0" />
                        <stop offset="100%" stopColor="#8B82D4" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 80 Q20 30 60 20 Q100 30 100 80 L100 140 Q85 128 70 140 Q60 150 50 140 Q35 128 20 140 Z"
                      fill="url(#parse-sad-ghost)"
                    />
                    <circle cx="44" cy="78" r="7" fill="#fff" />
                    <circle cx="76" cy="78" r="7" fill="#fff" />
                    <circle cx="46" cy="80" r="3.5" fill="#555" />
                    <circle cx="78" cy="80" r="3.5" fill="#555" />
                    <path
                      d="M48 106 Q60 96 72 106"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M38 68 Q44 63 50 68"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M70 68 Q76 63 82 68"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight">
                  Файл боловсруулж чадсангүй
                </p>
                <p className="text-sm text-gray-400 -mt-2 text-center">
                  {parseError}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save overlay — loading/success/success2/error */}
      {saveStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl px-10 pt-10 pb-9 flex flex-col items-center gap-5">
            {(saveStatus === "success" ||
              saveStatus === "success2" ||
              saveStatus === "error") && (
              <button
                type="button"
                onClick={() => setSaveStatus("idle")}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl font-light"
              >
                ✕
              </button>
            )}

            {/* Phase 1 — Ачаалж байна... */}
            {saveStatus === "saving" && savePhase === 1 && (
              <>
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-1">
                  <svg
                    width="44" height="46" viewBox="0 0 44 46" fill="none"
                    className="animate-spin"
                    style={{ animationDuration: "1.4s" }}
                  >
                    <path d="M19.9577 1.1197C20.8976 -0.373232 23.1024 -0.373235 24.0423 1.1197L26.2952 4.69831C26.9131 5.67983 28.1596 6.07887 29.2451 5.64264L33.2027 4.05214C34.8538 3.38861 36.6375 4.66539 36.5072 6.41747L36.1948 10.6173C36.1091 11.7692 36.8796 12.8139 38.018 13.0896L42.1687 14.0947C43.9003 14.514 44.5816 16.5799 43.4309 17.9219L40.6725 21.1387C39.916 22.021 39.916 23.3123 40.6725 24.1946L43.4309 27.4114C44.5816 28.7535 43.9003 30.8193 42.1687 31.2386L38.018 32.2438C36.8796 32.5194 36.1091 33.5642 36.1948 34.716L36.5072 38.9159C36.6375 40.668 34.8538 41.9447 33.2027 41.2812L29.2451 39.6907C28.1596 39.2545 26.9131 39.6535 26.2952 40.635L24.0423 44.2136C23.1024 45.7066 20.8976 45.7066 19.9577 44.2136L17.7048 40.635C17.0869 39.6535 15.8404 39.2545 14.7549 39.6907L10.7973 41.2812C9.14619 41.9447 7.36249 40.668 7.49281 38.9159L7.80517 34.716C7.89085 33.5642 7.12044 32.5194 5.98202 32.2438L1.83131 31.2386C0.0997135 30.8193 -0.581601 28.7535 0.569126 27.4114L3.32746 24.1946C4.08399 23.3123 4.08399 22.021 3.32746 21.1387L0.569128 17.9219C-0.581599 16.5799 0.0997107 14.514 1.83131 14.0947L5.98201 13.0896C7.12044 12.8139 7.89085 11.7692 7.80517 10.6173L7.49281 6.41748C7.36249 4.66539 9.14619 3.38861 10.7972 4.05214L14.7549 5.64264C15.8404 6.07887 17.0869 5.67983 17.7048 4.69831L19.9577 1.1197Z" fill="#6750A4"/>
                  </svg>
                </div>
                <p className="text-[20px] font-bold text-gray-900 tracking-tight">
                  Ачаалж байна...
                </p>
              </>
            )}

            {/* Phase 2 — Боловсруулж байна... */}
            {saveStatus === "saving" && savePhase === 2 && (
              <>
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-1">
                  <svg
                    width="44" height="46" viewBox="0 0 44 46" fill="none"
                    className="animate-spin"
                    style={{ animationDuration: "1.4s" }}
                  >
                    <path d="M19.9577 1.1197C20.8976 -0.373232 23.1024 -0.373235 24.0423 1.1197L26.2952 4.69831C26.9131 5.67983 28.1596 6.07887 29.2451 5.64264L33.2027 4.05214C34.8538 3.38861 36.6375 4.66539 36.5072 6.41747L36.1948 10.6173C36.1091 11.7692 36.8796 12.8139 38.018 13.0896L42.1687 14.0947C43.9003 14.514 44.5816 16.5799 43.4309 17.9219L40.6725 21.1387C39.916 22.021 39.916 23.3123 40.6725 24.1946L43.4309 27.4114C44.5816 28.7535 43.9003 30.8193 42.1687 31.2386L38.018 32.2438C36.8796 32.5194 36.1091 33.5642 36.1948 34.716L36.5072 38.9159C36.6375 40.668 34.8538 41.9447 33.2027 41.2812L29.2451 39.6907C28.1596 39.2545 26.9131 39.6535 26.2952 40.635L24.0423 44.2136C23.1024 45.7066 20.8976 45.7066 19.9577 44.2136L17.7048 40.635C17.0869 39.6535 15.8404 39.2545 14.7549 39.6907L10.7973 41.2812C9.14619 41.9447 7.36249 40.668 7.49281 38.9159L7.80517 34.716C7.89085 33.5642 7.12044 32.5194 5.98202 32.2438L1.83131 31.2386C0.0997135 30.8193 -0.581601 28.7535 0.569126 27.4114L3.32746 24.1946C4.08399 23.3123 4.08399 22.021 3.32746 21.1387L0.569128 17.9219C-0.581599 16.5799 0.0997107 14.514 1.83131 14.0947L5.98201 13.0896C7.12044 12.8139 7.89085 11.7692 7.80517 10.6173L7.49281 6.41748C7.36249 4.66539 9.14619 3.38861 10.7972 4.05214L14.7549 5.64264C15.8404 6.07887 17.0869 5.67983 17.7048 4.69831L19.9577 1.1197Z" fill="#6750A4"/>
                  </svg>
                </div>
                <p className="text-[20px] font-bold text-gray-900 tracking-tight">
                  Боловсруулж байна...
                </p>
              </>
            )}

            {/* Success — flying ghost with clouds/star/planet */}
            {saveStatus === "success" && (
              <>
                <div className="relative w-56 h-48 flex items-center justify-center mb-1">
                  {/* clouds */}
                  <svg
                    className="absolute left-0 top-10 w-16 opacity-90"
                    viewBox="0 0 70 38"
                    fill="none"
                  >
                    <ellipse cx="35" cy="26" rx="32" ry="14" fill="#C3B1F5" />
                    <ellipse cx="22" cy="20" rx="18" ry="12" fill="#C3B1F5" />
                    <ellipse cx="42" cy="18" rx="16" ry="11" fill="#D4C5F9" />
                  </svg>
                  <svg
                    className="absolute right-0 bottom-4 w-14 opacity-80"
                    viewBox="0 0 60 35"
                    fill="none"
                  >
                    <ellipse cx="30" cy="22" rx="28" ry="13" fill="#C3B1F5" />
                    <ellipse cx="18" cy="17" rx="15" ry="10" fill="#D4C5F9" />
                  </svg>
                  {/* gold star */}
                  <svg
                    className="absolute left-10 top-2 w-7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2l1.6 5H19l-4.2 3 1.6 5L12 12l-4.4 3 1.6-5L5 7h5.4z"
                      fill="#F9C23C"
                    />
                  </svg>
                  {/* planet */}
                  <svg
                    className="absolute right-2 top-10 w-10"
                    viewBox="0 0 40 40"
                    fill="none"
                  >
                    <circle cx="20" cy="20" r="10" fill="#6DBF8A" />
                    <ellipse
                      cx="20"
                      cy="20"
                      rx="19"
                      ry="6"
                      stroke="#4EA870"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  {/* flying ghost */}
                  <svg
                    className="relative z-10 drop-shadow-lg"
                    style={{
                      filter: "drop-shadow(0 6px 20px #a29bfe44)",
                      width: 120,
                    }}
                    viewBox="0 0 140 130"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="fly-ghost-grad"
                        x1="70"
                        y1="0"
                        x2="70"
                        y2="130"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#C4B5FD" />
                        <stop offset="100%" stopColor="#7C6FE0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M30 65 Q28 30 65 20 Q105 22 115 55 Q122 80 108 100 Q92 118 65 112 Q38 106 25 88 Q18 78 30 65Z"
                      fill="url(#fly-ghost-grad)"
                    />
                    <line
                      x1="65"
                      y1="20"
                      x2="78"
                      y2="4"
                      stroke="#A29BFE"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="79" cy="3" r="5" fill="#7C6FE0" />
                    <circle cx="72" cy="62" r="9" fill="#fff" />
                    <circle cx="98" cy="58" r="8" fill="#fff" />
                    <circle cx="74" cy="64" r="4.5" fill="#3B1F8C" />
                    <circle cx="100" cy="60" r="4" fill="#3B1F8C" />
                    <circle cx="76" cy="62" r="1.8" fill="#fff" />
                    <circle cx="102" cy="58" r="1.5" fill="#fff" />
                    <path
                      d="M70 80 Q84 92 96 80"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <ellipse
                      cx="63"
                      cy="74"
                      rx="7"
                      ry="4"
                      fill="#E9D5FF"
                      opacity="0.6"
                    />
                    <ellipse
                      cx="106"
                      cy="70"
                      rx="6"
                      ry="3.5"
                      fill="#E9D5FF"
                      opacity="0.6"
                    />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight text-center">
                  Амжилттай хадгалагдлаа
                </p>
              </>
            )}

            {/* Success2 — round ghost with sparkles */}
            {saveStatus === "success2" && (
              <>
                <div className="relative w-52 h-44 flex items-center justify-center mb-1">
                  {/* sparkles */}
                  {[
                    { top: "4px", left: "10px", size: 22 },
                    { top: "0px", right: "18px", size: 26 },
                    { top: "30px", right: "4px", size: 18 },
                    { bottom: "8px", right: "12px", size: 20 },
                    { bottom: "4px", left: "16px", size: 18 },
                    { top: "50%", left: "2px", size: 16 },
                  ].map((s, i) => (
                    <svg
                      key={i}
                      className="absolute"
                      style={{
                        top: s.top,
                        left: s.left,
                        right: (s as Record<string, unknown>).right as
                          | string
                          | undefined,
                        bottom: (s as Record<string, unknown>).bottom as
                          | string
                          | undefined,
                        width: s.size,
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z"
                        fill="#F9C23C"
                      />
                    </svg>
                  ))}
                  {/* round ghost */}
                  <svg
                    className="relative z-10 drop-shadow-lg"
                    style={{ width: 110 }}
                    viewBox="0 0 120 150"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="round-ghost-grad"
                        x1="60"
                        y1="10"
                        x2="60"
                        y2="150"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#D0C4F7" />
                        <stop offset="100%" stopColor="#9B8EE8" />
                      </linearGradient>
                    </defs>
                    {/* round body */}
                    <ellipse
                      cx="60"
                      cy="72"
                      rx="42"
                      ry="44"
                      fill="url(#round-ghost-grad)"
                    />
                    {/* wavy bottom */}
                    <path
                      d="M18 100 Q18 130 30 130 Q38 130 38 120 Q38 132 50 132 Q60 132 60 122 Q60 132 70 132 Q82 132 82 120 Q82 130 90 130 Q102 130 102 100"
                      fill="url(#round-ghost-grad)"
                    />
                    {/* eyes */}
                    <circle cx="47" cy="68" r="7" fill="#fff" />
                    <circle cx="73" cy="68" r="7" fill="#fff" />
                    <circle cx="49" cy="70" r="3.5" fill="#3B1F8C" />
                    <circle cx="75" cy="70" r="3.5" fill="#3B1F8C" />
                    <circle cx="50" cy="68" r="1.5" fill="#fff" />
                    <circle cx="76" cy="68" r="1.5" fill="#fff" />
                    {/* smile */}
                    <path
                      d="M50 84 Q60 93 70 84"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* cheeks */}
                    <ellipse
                      cx="40"
                      cy="78"
                      rx="7"
                      ry="4"
                      fill="#E9D5FF"
                      opacity="0.55"
                    />
                    <ellipse
                      cx="80"
                      cy="78"
                      rx="7"
                      ry="4"
                      fill="#E9D5FF"
                      opacity="0.55"
                    />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight text-center">
                  Материал амжилттай оруулаа
                </p>
                <p className="text-sm text-gray-400 -mt-2 text-center">
                  Та материалаа дахин засварлах боломжтой шүү
                </p>
              </>
            )}

            {/* Error */}
            {saveStatus === "error" && (
              <>
                <div className="relative w-52 h-44 flex items-center justify-center mb-1">
                  <svg
                    className="absolute left-0 top-4 w-16"
                    viewBox="0 0 70 60"
                    fill="none"
                  >
                    <ellipse cx="35" cy="25" rx="32" ry="16" fill="#6A5FA6" />
                    <ellipse cx="22" cy="20" rx="18" ry="13" fill="#7B72B8" />
                    <line
                      x1="22"
                      y1="42"
                      x2="18"
                      y2="56"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="32"
                      y1="44"
                      x2="28"
                      y2="58"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="42"
                      y1="42"
                      x2="38"
                      y2="56"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg
                    className="absolute right-0 top-0 w-20"
                    viewBox="0 0 80 65"
                    fill="none"
                  >
                    <ellipse cx="40" cy="28" rx="36" ry="18" fill="#5A5299" />
                    <ellipse cx="26" cy="22" rx="20" ry="15" fill="#6A62AA" />
                    <line
                      x1="25"
                      y1="46"
                      x2="21"
                      y2="60"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="37"
                      y1="48"
                      x2="33"
                      y2="62"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="49"
                      y1="46"
                      x2="45"
                      y2="60"
                      stroke="#5B9BD5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg
                    className="relative z-10 w-24 drop-shadow-lg"
                    viewBox="0 0 120 160"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="sad-ghost-grad"
                        x1="60"
                        y1="20"
                        x2="60"
                        y2="160"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#B8B0F0" />
                        <stop offset="100%" stopColor="#8B82D4" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 80 Q20 30 60 20 Q100 30 100 80 L100 140 Q85 128 70 140 Q60 150 50 140 Q35 128 20 140 Z"
                      fill="url(#sad-ghost-grad)"
                    />
                    <circle cx="44" cy="78" r="7" fill="#fff" />
                    <circle cx="76" cy="78" r="7" fill="#fff" />
                    <circle cx="46" cy="80" r="3.5" fill="#555" />
                    <circle cx="78" cy="80" r="3.5" fill="#555" />
                    <path
                      d="M48 106 Q60 96 72 106"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M38 68 Q44 63 50 68"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M70 68 Q76 63 82 68"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight">
                  Амжилтгүй боллоо
                </p>
                <p className="text-sm text-gray-400 -mt-2 text-center">
                  {saveError ??
                    "Сервер ачаалалтай байгаа тул дахин оролдоно уу"}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Шалгалтын материал үүсгэх
          </h1>
          <p className="text-sm text-gray-500">
            Шалгалтын материал болон вариант үүсгэх
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Demo button — click to cycle overlay phases */}
          <button
            type="button"
            onClick={() => {
              const nextIdx = (demoPhaseIdx + 1) % demoPhases.length;
              setDemoPhaseIdx(nextIdx);
              setParseStatus(demoPhases[nextIdx]);
              setParseError("Тест алдааны мессеж");
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-indigo-400 bg-indigo-50 text-sm text-indigo-700 font-semibold hover:bg-indigo-100"
          >
            👻 Overlay харах ({demoPhases[demoPhaseIdx]})
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-indigo-900 text-sm text-white font-medium hover:bg-indigo-800 disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? "Хадгалж байна…" : "Хадгалах"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Form card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-gray-600 font-medium">Материалын нэр*</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ нь: Геометр"
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 bg-white"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-gray-600 font-medium">Хичээл*</span>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
              disabled={optionsLoading || !optionsData?.subjects?.length}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white disabled:opacity-50"
            >
              <option value="">
                {optionsLoading ? "Уншиж байна…" : "Сонгох"}
              </option>
              {(optionsData?.subjects ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-gray-600 font-medium">Анги*</span>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={
                !subjectId || topicsLoading || !topicsData?.topics?.length
              }
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white disabled:opacity-50"
            >
              <option value="">
                {!subjectId
                  ? "Эхлээд хичээл сонгоно уу"
                  : topicsLoading
                    ? "Уншиж байна…"
                    : "Сонгох"}
              </option>
              {(topicsData?.topics ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.grade != null ? ` (${t.grade}-р анги)` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic((v) => !v)}
          className="flex items-center gap-3"
        >
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${isPublic ? "bg-indigo-900" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`}
            />
          </span>
          <span className="text-sm font-medium text-gray-700">Public</span>
        </button>
      </div>

      {/* Questions + sidebar */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {questions.map((q, i) => (
            <QuestionForm
              key={q.id}
              index={i + 1}
              question={q}
              onChange={(updated) => updateQuestion(q.id, updated)}
              onDelete={() => deleteQuestion(q.id)}
              addQuestion={addQuestion}
            />
          ))}
        </div>

        <div className="w-44 shrink-0">
          <div className="flex flex-col gap-2 sticky top-8">
            <input
              ref={docxInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleDocxUpload(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={parsing}
              onClick={() => docxInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {parsing ? "Боловсруулж…" : "Файлаар оруулах"}
            </button>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Асуулт нэмэх
            </button>
            <button
              type="button"
              onClick={fillDemoMathExam}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 12h8M12 8v8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Зураг оруулах
            </button>
            <button
              type="button"
              onClick={() =>
                questions.length > 1 &&
                deleteQuestion(questions[questions.length - 1].id)
              }
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Асуултыг устгах
            </button>
            {/* ── Demo: cycle through all overlay phases ── */}
            <button
              type="button"
              onClick={() => {
                const nextIdx = (demoPhaseIdx + 1) % demoPhases.length;
                setDemoPhaseIdx(nextIdx);
                setParseStatus(demoPhases[nextIdx]);
                setParseError("Тест алдааны мессеж");
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-indigo-300 rounded-lg bg-indigo-50 text-sm text-indigo-700 hover:bg-indigo-100 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8v4l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Overlay харах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
