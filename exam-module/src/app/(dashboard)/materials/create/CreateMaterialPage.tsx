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
  const [creatorId, setCreatorId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "", answers: ["", "", ""], score: 2, correctIndex: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
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
    const staff = optionsData?.staffUsers ?? [];
    const subjects = optionsData?.subjects ?? [];
    if (!creatorId && staff[0]) setCreatorId(staff[0].id);
    if (!subjectId && subjects[0]) setSubjectId(subjects[0].id);
  }, [optionsData, creatorId, subjectId]);

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
    setParsing(true);
    // Clear any lingering timers
    parseStepTimersRef.current.forEach(clearTimeout);
    parseStepTimersRef.current = [];
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
        return;
      }

      setQuestions(parsed);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Word файл боловсруулахад алдаа гарлаа.";
      setError(msg);
      setParseError(msg);
    } finally {
      parseStepTimersRef.current.forEach(clearTimeout);
      parseStepTimersRef.current = [];
      setParsing(false);
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
    setSaveStatus("saving");
    setSaveError(null);
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
        router.push(`/materials/${examId}`);
      }, 1800);
    } catch (e) {
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
      {/* DOCX Parsing Overlay */}
      {parsing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-xs mx-4 bg-white rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => { setParsing(false); setParseError(null); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl font-light"
            >
              ✕
            </button>
            <div className="relative flex items-center justify-center w-20 h-20">
              {/* outer glow ring */}
              <div className="absolute w-20 h-20 rounded-full bg-[#6C5CE7]/20 animate-ping" style={{ animationDuration: "1.8s" }} />
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16 animate-spin drop-shadow-lg"
                style={{ animationDuration: "2s", filter: "drop-shadow(0 0 10px #6C5CE788)" }}
              >
                <path
                  d="M50 5 C53 5,55 8,55 11 C58 8,62 7,65 9 C68 11,68 15,66 18 C69 17,73 18,75 21 C77 24,75 28,72 30 C75 31,78 34,77 37 C76 40,72 42,69 41 C71 44,71 48,69 50 C67 52,63 52,61 50 C62 53,61 57,59 59 C57 61,53 61,51 59 C51 62,49 66,46 67 C43 68,40 66,39 63 C37 65,33 66,31 64 C29 62,29 58,31 56 C28 57,24 56,23 53 C22 50,24 46,27 45 C24 43,22 39,24 36 C26 33,30 32,33 33 C31 30,31 26,33 24 C35 22,39 22,41 24 C41 21,42 17,45 15 C47 13,50 14,51 16 C52 13,53 9,55 7 C54 6,52 5,50 5 Z"
                  fill="#6C5CE7"
                />
              </svg>
            </div>
            <p className="text-[18px] font-bold text-gray-900 tracking-tight">
              Боловсруулж байна...
            </p>
          </div>
        </div>
      )}

      {/* DOCX Parse Error Overlay — rainy ghost */}
      {parseError && !parsing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={() => setParseError(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl font-light"
            >
              ✕
            </button>
            <div className="relative w-52 h-44 flex items-center justify-center mb-1">
              {/* rain cloud left */}
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
              {/* rain cloud right */}
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
              {/* sad ghost */}
              <svg
                className="relative z-10 w-24 drop-shadow-lg"
                viewBox="0 0 120 160"
                fill="none"
              >
                <path
                  d="M20 80 Q20 30 60 20 Q100 30 100 80 L100 140 Q85 128 70 140 Q60 150 50 140 Q35 128 20 140 Z"
                  fill="url(#parse-sad-ghost-grad)"
                />
                <defs>
                  <linearGradient
                    id="parse-sad-ghost-grad"
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
          </div>
        </div>
      )}

      {/* Save overlay — loading/success/error */}
      {saveStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-5">
            {/* Close button */}
            {(saveStatus === "success" || saveStatus === "error") && (
              <button
                type="button"
                onClick={() => setSaveStatus("idle")}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 text-xl font-light"
              >
                ✕
              </button>
            )}

            {/* Saving state */}
            {saveStatus === "saving" && (
              <>
                <div className="relative flex items-center justify-center w-20 h-20 mb-1">
                  {/* outer glow ring */}
                  <div className="absolute w-20 h-20 rounded-full bg-[#6C5CE7]/20 animate-ping" style={{ animationDuration: "1.8s" }} />
                  <svg
                    viewBox="0 0 100 100"
                    className="w-16 h-16 animate-spin drop-shadow-lg"
                    style={{ animationDuration: "2s", filter: "drop-shadow(0 0 10px #6C5CE788)" }}
                  >
                    <path
                      d="M50 5 C53 5,55 8,55 11 C58 8,62 7,65 9 C68 11,68 15,66 18 C69 17,73 18,75 21 C77 24,75 28,72 30 C75 31,78 34,77 37 C76 40,72 42,69 41 C71 44,71 48,69 50 C67 52,63 52,61 50 C62 53,61 57,59 59 C57 61,53 61,51 59 C51 62,49 66,46 67 C43 68,40 66,39 63 C37 65,33 66,31 64 C29 62,29 58,31 56 C28 57,24 56,23 53 C22 50,24 46,27 45 C24 43,22 39,24 36 C26 33,30 32,33 33 C31 30,31 26,33 24 C35 22,39 22,41 24 C41 21,42 17,45 15 C47 13,50 14,51 16 C52 13,53 9,55 7 C54 6,52 5,50 5 Z"
                      fill="#6C5CE7"
                    />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight">
                  Хадгалж байна...
                </p>
              </>
            )}

            {/* Success state */}
            {saveStatus === "success" && (
              <>
                <div className="relative w-52 h-48 flex items-center justify-center mb-1">
                  {/* sparkle stars */}
                  {[
                    { cls: "absolute left-4 top-3 w-6", points: "12 2 13.8 8.2 20 8.2 14.9 11.8 16.8 18 12 14.4 7.2 18 9.1 11.8 4 8.2 10.2 8.2" },
                    { cls: "absolute right-6 top-2 w-5", points: "12 2 13.8 8.2 20 8.2 14.9 11.8 16.8 18 12 14.4 7.2 18 9.1 11.8 4 8.2 10.2 8.2" },
                    { cls: "absolute left-10 bottom-4 w-5", points: "12 2 13.8 8.2 20 8.2 14.9 11.8 16.8 18 12 14.4 7.2 18 9.1 11.8 4 8.2 10.2 8.2" },
                    { cls: "absolute right-3 bottom-8 w-6", points: "12 2 13.8 8.2 20 8.2 14.9 11.8 16.8 18 12 14.4 7.2 18 9.1 11.8 4 8.2 10.2 8.2" },
                    { cls: "absolute left-1 top-14 w-4", points: "12 2 13.8 8.2 20 8.2 14.9 11.8 16.8 18 12 14.4 7.2 18 9.1 11.8 4 8.2 10.2 8.2" },
                    { cls: "absolute right-1 top-12 w-4", points: "12 2 13.8 8.2 20 8.2 14.9 11.8 16.8 18 12 14.4 7.2 18 9.1 11.8 4 8.2 10.2 8.2" },
                  ].map((s, i) => (
                    <svg key={i} className={s.cls} viewBox="0 0 24 24" fill="#F9C23C">
                      <polygon points={s.points} />
                    </svg>
                  ))}
                  {/* ghost */}
                  <svg
                    className="relative z-10 w-32 drop-shadow-lg"
                    style={{ filter: "drop-shadow(0 8px 24px #a29bfe55)" }}
                    viewBox="0 0 120 140"
                    fill="none"
                  >
                    <defs>
                      <linearGradient id="success-ghost-grad" x1="60" y1="10" x2="60" y2="140" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#C4B5FD" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                    {/* body — round top, wavy bottom */}
                    <path
                      d="M20 70 Q20 20 60 15 Q100 20 100 70 L100 125 Q90 116 80 125 Q70 133 60 125 Q50 116 40 125 Q30 133 20 125 Z"
                      fill="url(#success-ghost-grad)"
                    />
                    {/* eyes */}
                    <circle cx="44" cy="68" r="8" fill="#fff" />
                    <circle cx="76" cy="68" r="8" fill="#fff" />
                    <circle cx="46" cy="70" r="4" fill="#4C1D95" />
                    <circle cx="78" cy="70" r="4" fill="#4C1D95" />
                    {/* eye shine */}
                    <circle cx="48" cy="68" r="1.5" fill="#fff" />
                    <circle cx="80" cy="68" r="1.5" fill="#fff" />
                    {/* smile */}
                    <path d="M47 85 Q60 96 73 85" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    {/* cheek blush */}
                    <ellipse cx="38" cy="78" rx="6" ry="3.5" fill="#E9D5FF" opacity="0.7" />
                    <ellipse cx="82" cy="78" rx="6" ry="3.5" fill="#E9D5FF" opacity="0.7" />
                  </svg>
                </div>
                <p className="text-[22px] font-bold text-gray-900 tracking-tight text-center">
                  Материал амжилттай оруулаа
                </p>
                <p className="text-sm text-gray-400 -mt-2 text-center">
                  Та материалаа дахин засварлах боломжтой шүү кк
                </p>
              </>
            )}

            {/* Error state */}
            {saveStatus === "error" && (
              <>
                <div className="relative w-52 h-44 flex items-center justify-center mb-1">
                  {/* rain cloud left */}
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
                  {/* rain cloud right */}
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
                  {/* sad ghost */}
                  <svg
                    className="relative z-10 w-24 drop-shadow-lg"
                    viewBox="0 0 120 160"
                    fill="none"
                  >
                    <path
                      d="M20 80 Q20 30 60 20 Q100 30 100 80 L100 140 Q85 128 70 140 Q60 150 50 140 Q35 128 20 140 Z"
                      fill="url(#sad-ghost-grad)"
                    />
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
                    <circle cx="44" cy="78" r="7" fill="#fff" />
                    <circle cx="76" cy="78" r="7" fill="#fff" />
                    <circle cx="46" cy="80" r="3.5" fill="#555" />
                    <circle cx="78" cy="80" r="3.5" fill="#555" />
                    {/* sad mouth */}
                    <path
                      d="M48 106 Q60 96 72 106"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* sad brows */}
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
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-indigo-900 text-sm text-white font-medium hover:bg-indigo-800 disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? "Хадгалж байна…" : "Хадгалах"}
        </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
