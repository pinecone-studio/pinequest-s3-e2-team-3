"use client";

export const runtime = "edge";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";




import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useGetExamForEditQuery,
} from "@/gql/graphql";
import { gradientForExamId } from "../_components/mock";
import VariationHubCard from "../_components/VariationHubCard";
import { nextBatchVariationLabel, normalizeVariationLabel } from "../_components/variation";

function sortVariationLabels(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const A = normalizeVariationLabel(a);
    const B = normalizeVariationLabel(b);
    const la = A.length === 1 && A >= "A" && A <= "Z";
    const lb = B.length === 1 && B >= "A" && B <= "Z";
    if (la && lb) return A.localeCompare(B);
    if (la && !lb) return -1;
    if (!la && lb) return 1;
    return A.localeCompare(B);
  });
}

export default function ExamVariationsHubPage() {
  const params = useParams();
  const router = useRouter();
  const examId = typeof params.examId === "string" ? params.examId : "";

  const { data, loading, error, refetch } = useGetExamForEditQuery({
    variables: { examId },
    skip: !examId,
    fetchPolicy: "cache-and-network",
  });

  const [createQuestion] = useCreateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [dupLoadingLabel, setDupLoadingLabel] = useState<string | null>(null);
  const [deleteLoadingLabel, setDeleteLoadingLabel] = useState<string | null>(null);
  const [hubError, setHubError] = useState<string | null>(null);
  const [duplicateSourceLabel, setDuplicateSourceLabel] = useState<string>("");

  const questions = data?.questions ?? [];

  const grouped = useMemo(() => {
    const m = new Map<string, typeof questions>();
    for (const q of questions) {
      const k = normalizeVariationLabel(q.variation);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(q);
    }
    return m;
  }, [questions]);

  const labels = useMemo(() => sortVariationLabels(Array.from(grouped.keys())), [grouped]);

  useEffect(() => {
    if (labels.length === 0) {
      setDuplicateSourceLabel("");
      return;
    }
    setDuplicateSourceLabel((prev) =>
      prev && labels.includes(prev) ? prev : labels[0]!,
    );
  }, [labels]);

  const duplicateAllForLabel = async (label: string) => {
    setHubError(null);
    const rows = grouped.get(label) ?? [];
    if (rows.length === 0) return;

    const target = nextBatchVariationLabel(questions.map((q) => q.variation));
    setDupLoadingLabel(label);
    try {
      for (const row of rows) {
        const res = await createQuestion({
          variables: {
            examId,
            question: row.question,
            answers: row.answers,
            correctIndex: row.correctIndex,
            variation: target,
          },
        });
        if (!res.data?.createQuestion?.id) {
          throw new Error("Асуулт хуулагдсангүй.");
        }
      }
      await refetch();
    } catch (e) {
      setHubError(e instanceof Error ? e.message : "Хуулахад алдаа гарлаа.");
    } finally {
      setDupLoadingLabel(null);
    }
  };

  const deleteVariationForLabel = async (label: string) => {
    setHubError(null);
    const rows = grouped.get(label) ?? [];
    if (rows.length === 0) return;

    const ok = window.confirm(
      `«${label}» хувилбарын ${rows.length} асуултыг бүгдийг нь устгах уу? Энэ үйлдлийг буцаах боломжгүй.`,
    );
    if (!ok) return;

    setDeleteLoadingLabel(label);
    try {
      for (const row of rows) {
        const res = await deleteQuestion({ variables: { id: row.id } });
        if (!res.data?.deleteQuestion) {
          throw new Error("Асуулт устгагдсангүй.");
        }
      }
      await refetch();
    } catch (e) {
      setHubError(e instanceof Error ? e.message : "Устгахад алдаа гарлаа.");
    } finally {
      setDeleteLoadingLabel(null);
    }
  };

  if (!examId) {
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

  const examName = data?.exam?.name ?? "";

  return (
    <div className="p-8 sm:p-10 max-w-5xl">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push("/materials")}
          className="text-sm text-gray-500 hover:text-gray-800 mb-2"
        >
          ← Буцах
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{examName}</h1>
        <p className="text-sm text-gray-500 mt-1">Хувилбар сонгоно уу — эхний хувилбар нь үндсэн асуултууд</p>
      </div>

      {hubError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {hubError}
        </div>
      )}

      {labels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center">
          <p className="text-gray-600 text-sm mb-4">Энэ шалгалтод асуулт байхгүй байна.</p>
          <Link
            href={`/materials/${examId}/variations/A/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Хувилбар A-аас эхлүүлэх
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-4">
            <div className="flex-1 min-w-0">
              <label
                htmlFor="duplicate-variation-source"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Хуулах хувилбар
              </label>
              <select
                id="duplicate-variation-source"
                value={duplicateSourceLabel}
                onChange={(e) => setDuplicateSourceLabel(e.target.value)}
                disabled={dupLoadingLabel !== null}
                className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                {labels.map((label) => (
                  <option key={label} value={label}>
                    Хувилбар {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={
                dupLoadingLabel !== null ||
                !duplicateSourceLabel ||
                (grouped.get(duplicateSourceLabel)?.length ?? 0) === 0
              }
              onClick={() => duplicateAllForLabel(duplicateSourceLabel)}
              className="shrink-0 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 hover:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none"
            >
              {dupLoadingLabel === duplicateSourceLabel
                ? "Хуулж байна…"
                : "Бүх асуултыг дараагийн хувилбарт хуулах"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {labels.map((label) => {
              const rows = grouped.get(label) ?? [];
              const count = rows.length;
              const gradient = gradientForExamId(`${examId}-${label}`);
              return (
                <VariationHubCard
                  key={label}
                  label={label}
                  questionCount={count}
                  gradient={gradient}
                  onOpen={() =>
                    router.push(
                      `/materials/${examId}/variations/${encodeURIComponent(label)}/edit`,
                    )
                  }
                  onDeleteVariation={() => deleteVariationForLabel(label)}
                  deleteDisabled={count === 0}
                  deleteLoading={deleteLoadingLabel === label}
                  duplicateBusy={dupLoadingLabel === label}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
