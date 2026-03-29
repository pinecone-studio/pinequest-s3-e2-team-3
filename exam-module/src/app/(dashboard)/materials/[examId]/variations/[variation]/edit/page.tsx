"use client";

export const runtime = "edge";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useGetExamForEditQuery,
  useUpdateExamMutation,
  useUpdateQuestionMutation,
} from "@/gql/graphql";
import { buildQuestionPayload } from "@/app/(dashboard)/materials/_components/buildQuestionPayload";
import { Question } from "@/app/(dashboard)/materials/_components/mock";
import QuestionForm from "@/app/(dashboard)/materials/_components/questionForm";
import {
  firstUnusedVariation,
  normalizeVariationLabel,
} from "@/app/(dashboard)/materials/_components/variation";

function mapRowsToQuestions(
  rows: Array<{
    id: string;
    question: string;
    answers: string[];
    correctIndex: number;
    variation: string;
  }>,
): Question[] {
  return rows.map((q, i) => ({
    id: 10_000 + i,
    dbId: q.id,
    text: q.question,
    answers: [...q.answers],
    correctIndex: q.correctIndex,
    score: 2,
    variation: q.variation,
  }));
}

function emptyRow(
  fixedVariation: string,
  otherVariations: (string | undefined)[],
): Question {
  return {
    id: Date.now(),
    text: "",
    answers: ["", "", ""],
    score: 2,
    correctIndex: 0,
    variation: fixedVariation || firstUnusedVariation(otherVariations),
  };
}

export default function EditVariationPage() {
  const params = useParams();
  const router = useRouter();
  const examId = typeof params.examId === "string" ? params.examId : "";
  const variationParamRaw =
    typeof params.variation === "string" ? params.variation : "";
  const variationLabel = useMemo(
    () => normalizeVariationLabel(decodeURIComponent(variationParamRaw || "A")),
    [variationParamRaw],
  );

  const { data, loading, error, refetch } = useGetExamForEditQuery({
    variables: { examId },
    skip: !examId,
    fetchPolicy: "cache-and-network",
  });

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [updateExam] = useUpdateExamMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [createQuestion] = useCreateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  useEffect(() => {
    setLoaded(false);
  }, [examId, variationLabel]);

  useEffect(() => {
    if (!data?.exam || loaded) return;
    const rows = (data.questions ?? []).filter(
      (r) => normalizeVariationLabel(r.variation) === variationLabel,
    );
    setTitle(data.exam.name);
    if (rows.length === 0) {
      setQuestions([emptyRow(variationLabel, [])]);
    } else {
      setQuestions(mapRowsToQuestions(rows));
    }
    setLoaded(true);
  }, [data, loaded, variationLabel]);

  const updateQuestionInState = useCallback((id: number, updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }, []);

  const removeQuestion = useCallback(
    async (q: Question) => {
      setSaveError(null);
      if (q.dbId) {
        try {
          await deleteQuestion({ variables: { id: q.dbId } });
        } catch (e) {
          setSaveError(
            e instanceof Error ? e.message : "Устгахад алдаа гарлаа.",
          );
          return;
        }
      }
      setQuestions((prev) => {
        const next = prev.filter((x) => x.id !== q.id);
        if (next.length === 0) return [emptyRow(variationLabel, [])];
        return next;
      });
    },
    [deleteQuestion, variationLabel],
  );

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      emptyRow(
        variationLabel,
        prev.map((q) => q.variation),
      ),
    ]);
  };

  const handleSave = async () => {
    setSaveError(null);
    const name = title.trim();
    if (!name) {
      setSaveError("Шалгалтын нэр оруулна уу.");
      return;
    }

    if (questions.length === 0) {
      setSaving(true);
      try {
        await updateExam({ variables: { id: examId, name } });
        router.push(`/materials/${examId}`);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Алдаа гарлаа.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const payloads: {
      index: number;
      payload: NonNullable<ReturnType<typeof buildQuestionPayload>>;
    }[] = [];
    for (let i = 0; i < questions.length; i++) {
      const p = buildQuestionPayload(questions[i]);
      if (!p) {
        setSaveError(
          `${i + 1}-р асуулт: асуулт болон хоёр ба түүнээс дээш бөглөгдсөн хариулт, мөн зөв хариултыг сонгоно уу.`,
        );
        return;
      }
      payloads.push({ index: i, payload: p });
    }

    setSaving(true);
    try {
      await updateExam({ variables: { id: examId, name } });

      for (const { index, payload } of payloads) {
        const q = questions[index];
        if (
          normalizeVariationLabel(q.variation ?? variationLabel) !==
          variationLabel
        ) {
          setSaveError("Хувилбарын алдаа.");
          setSaving(false);
          return;
        }

        if (q.dbId) {
          await updateQuestion({
            variables: {
              id: q.dbId,
              question: payload.question,
              answers: payload.answers,
              correctIndex: payload.correctIndex,
              variation: variationLabel,
            },
          });
        } else {
          const res = await createQuestion({
            variables: {
              examId,
              question: payload.question,
              answers: payload.answers,
              correctIndex: payload.correctIndex,
              variation: variationLabel,
            },
          });
          if (!res.data?.createQuestion?.id) {
            throw new Error("Шинэ асуулт хадгалагдсангүй.");
          }
        }
      }

      await refetch();
      router.push(`/materials/${examId}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  if (!examId || !variationParamRaw) {
    return <p className="p-8 text-sm text-gray-600">Буруу холбоос.</p>;
  }

  if (error) {
    return <p className="p-8 text-sm text-red-600">Алдаа: {error.message}</p>;
  }

  if (loading && !data) {
    return <p className="p-8 text-sm text-gray-500">Уншиж байна…</p>;
  }

  if (data && !data.exam) {
    return <p className="p-8 text-sm text-gray-600">Шалгалт олдсонгүй.</p>;
  }

  return (
    <div className="p-8 sm:p-10 flex gap-6">
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={() => router.push(`/materials/${examId}`)}
          className="text-sm text-gray-500 hover:text-gray-800 mb-2"
        >
          ← Хувилбарууд
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Хувилбар {variationLabel}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Энэ хувилбарын асуултуудыг засна уу
        </p>

        {saveError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {saveError}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Шалгалтын нэр
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Жишээ нь : 12-р анги Бүлэг сэдвийн шалгалт"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-700"
          />
        </div>

        {questions.map((q) => (
          <QuestionForm
            key={q.dbId ?? q.id}
            question={{ ...q, variation: variationLabel }}
            onChange={(updated) =>
              updateQuestionInState(q.id, {
                ...updated,
                variation: variationLabel,
              })
            }
            onDelete={() => removeQuestion(q)}
            showVariation={false}
          />
        ))}
      </div>

      <div className="w-48 shrink-0">
        <div className="flex flex-col gap-2 sticky top-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !loaded}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? "Хадгалж байна…" : "Хадгалах"}
          </button>
          <button
            type="button"
            onClick={addQuestion}
            disabled={!loaded}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Асуулт нэмэх
          </button>
        </div>
      </div>
    </div>
  );
}
