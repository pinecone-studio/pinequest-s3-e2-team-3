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
  const [parsing, setParsing] = useState(false);
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
    setParsing(true);
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
        setError("Word файлаас текст олдсонгүй.");
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
        setError("Файлаас асуулт олдсонгүй.");
        return;
      }

      setQuestions(parsed);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Word файл боловсруулахад алдаа гарлаа.",
      );
    } finally {
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
    try {
      const examRes = await createExam({
        variables: { name, creatorId, subjectId, topicId, isPublic },
      });
      const examId = examRes.data?.createExam.id;
      if (!examId) {
        throw new Error("Шалгалт үүсгэгдсэнгүй.");
      }

      const attachmentKeys = await mapWithConcurrency(
        questions,
        async (q) => {
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
        },
      );

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

      router.push(`/materials/${examId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 sm:p-10">
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
