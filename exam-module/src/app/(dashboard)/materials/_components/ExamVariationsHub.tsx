"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useGetExamForEditQuery,
} from "@/gql/graphql";
import VariationHubCard from "./VariationHubCard";
import { nextBatchVariationLabel, normalizeVariationLabel } from "./variation";

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

interface Props {
  examId: string;
  materialsTab?: "mine" | "bank";
  onMaterialsTabChange?: (tab: "mine" | "bank") => void;
}

export default function ExamVariationsHub({
  examId,
  materialsTab = "mine",
  onMaterialsTabChange,
}: Props) {
  const router = useRouter();

  const { data, loading, error, refetch } = useGetExamForEditQuery({
    variables: { examId },
    skip: !examId,
    fetchPolicy: "cache-and-network",
  });

  const [createQuestion] = useCreateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [dupLoadingLabel, setDupLoadingLabel] = useState<string | null>(null);
  const [deleteLoadingLabel, setDeleteLoadingLabel] = useState<string | null>(
    null,
  );
  const [hubError, setHubError] = useState<string | null>(null);
  const [duplicateSourceLabel, setDuplicateSourceLabel] = useState<string>("");
  const [variantSearch, setVariantSearch] = useState("");

  const questions = useMemo(() => data?.questions ?? [], [data?.questions]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof questions>();
    for (const q of questions) {
      const k = normalizeVariationLabel(q.variation);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(q);
    }
    return m;
  }, [questions]);

  const labels = useMemo(
    () => sortVariationLabels(Array.from(grouped.keys())),
    [grouped],
  );

  const filteredLabels = useMemo(() => {
    const q = variantSearch.trim().toLowerCase();
    if (!q) return labels;
    return labels.filter((label) => {
      const n = normalizeVariationLabel(label).toLowerCase();
      return (
        n.includes(q) ||
        `вариант ${n}`.includes(q) ||
        `хувилбар ${n}`.includes(q)
      );
    });
  }, [labels, variantSearch]);

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
            ...(row.attachmentKey ? { attachmentKey: row.attachmentKey } : {}),
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

  const folderTabClip =
    "polygon(0% 0%, 28% 0%, 38% 18%, 100% 18%, 100% 100%, 0% 100%)";
  const folderClipCreate =
    "polygon(0% 0%, 38% 0%, 48% 16%, 100% 16%, 100% 100%, 0% 100%)";

  function FileSheet({ className }: { className?: string }) {
    return (
      <div
        className={`absolute w-[40%] aspect-[3/4] bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100 p-[4%] flex flex-col gap-[10%] transition-transform duration-300 ${className}`}
      >
        <div className="h-[4%] w-full bg-gray-200 rounded-full" />
        <div className="h-[4%] w-full bg-gray-200 rounded-full" />
        <div className="h-[4%] w-full bg-gray-200 rounded-full" />
        <div className="h-[4%] w-full bg-gray-200/70 rounded-full" />
        <div className="h-[4%] w-full bg-gray-200/70 rounded-full" />
      </div>
    );
  }

  const duplicateDisabled =
    dupLoadingLabel !== null ||
    !duplicateSourceLabel ||
    (grouped.get(duplicateSourceLabel)?.length ?? 0) === 0;

  return (
    <div className="bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Шалгалтын материал
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Шалгалтын материал үүсгэн ангиудад хуваарлах
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative flex gap-8 border-b border-gray-100 pb-1">
            <button
              type="button"
              onClick={() => onMaterialsTabChange?.("mine")}
              className={`text-sm font-medium transition-colors pb-2 ${
                materialsTab === "mine" ? "text-[#5136a8]" : "text-gray-400"
              }`}
            >
              Миний материалууд
            </button>
            <button
              type="button"
              onClick={() => onMaterialsTabChange?.("bank")}
              className={`text-sm font-medium transition-colors pb-2 ${
                materialsTab === "bank" ? "text-[#5136a8]" : "text-gray-400"
              }`}
            >
              Шалгалтын сан
            </button>
            <div
              className={`absolute bottom-0 h-0.5 rounded-full bg-[#5D3FD3] transition-all duration-300 ${
                materialsTab === "mine"
                  ? "left-0 w-[120px]"
                  : "left-[152px] w-[100px]"
              }`}
            />
          </div>

          <label className="relative block w-full min-w-0 sm:max-w-md sm:flex-1 sm:shrink-0">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="search"
              value={variantSearch}
              onChange={(e) => setVariantSearch(e.target.value)}
              placeholder="Материалын нэрээр хайх"
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-shadow focus:border-[#C7D2FE] focus:ring-2 focus:ring-[#E0E7FF]"
            />
          </label>
        </div>
      </div>

      {hubError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {hubError}
        </div>
      )}

      <div className="mb-8">
        <div className="group relative mx-auto w-full max-w-[283px] h-[173px] flex flex-col justify-end sm:mx-0">
          <div className="absolute inset-0 flex justify-center items-start pt-4">
            <FileSheet className="-rotate-15 -translate-x-[52%] -translate-y-2 opacity-90" />
            <FileSheet className="rotate-15 translate-x-[52%] -translate-y-2 opacity-90" />
            <FileSheet className="z-10 -translate-y-4 shadow-md border-gray-200/60" />
          </div>
          <div className="relative z-20 h-[120px] w-full">
            <div
              className="absolute inset-0 rounded-xl border border-[#B0C4DE] bg-[#E0E7FF] shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
              style={{ clipPath: folderTabClip }}
            />
            <div className="absolute bottom-4 inset-x-3 flex justify-center">
              <div className="max-w-[calc(100%-8px)] rounded-lg border border-[#B0C4DE] bg-white px-3 py-1.5 shadow-sm">
                <span className="text-[13px] font-semibold text-gray-900 truncate block text-center">
                  {examName || "Шалгалт"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {labels.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link
            href={`/materials/${examId}/variations/A/edit`}
            className="group relative mx-auto block aspect-[1.45/1] w-full max-w-[280px] rounded-[20px] border border-[#B0C4DE] bg-[#E0E7FF] shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-transform active:scale-[0.99] sm:mx-0"
          >
            <div
              className="absolute inset-0 rounded-[20px] bg-[#E0E7FF]"
              style={{ clipPath: folderClipCreate }}
            />
            <div className="relative flex h-full flex-col items-center justify-center pb-10 pt-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#93C5FD] bg-[#C7D2FE] text-[#2563EB] shadow-sm">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-4 inset-x-4 rounded-lg border border-[#B0C4DE] bg-white px-3 py-2 text-center shadow-sm">
              <span className="text-sm font-medium text-gray-900">
                Вариант үүсгэх
              </span>
            </div>
          </Link>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-6 text-sm text-gray-600 sm:col-span-2 lg:col-span-3">
            <p className="mb-2">Энэ шалгалтод асуулт байхгүй байна.</p>
            <p className="text-gray-500">
              Зүүн талын хавтсаар хувилбар үүсгэн эхлүүлнэ үү.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <button
              type="button"
              disabled={duplicateDisabled}
              onClick={() => duplicateAllForLabel(duplicateSourceLabel)}
              className="group relative mx-auto aspect-[1.45/1] w-full max-w-[280px] cursor-pointer rounded-[20px] border border-[#B0C4DE] bg-[#E0E7FF] shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-transform active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 sm:mx-0"
            >
              <div
                className="absolute inset-0 rounded-[20px] bg-[#E0E7FF]"
                style={{ clipPath: folderClipCreate }}
              />
              <div className="relative flex h-full flex-col items-center justify-center pb-10 pt-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#93C5FD] bg-[#C7D2FE] text-[#2563EB] shadow-sm">
                  {dupLoadingLabel === duplicateSourceLabel ? (
                    <div className="h-6 w-6 border-2 border-[#2563EB] border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="absolute bottom-4 inset-x-4 rounded-lg border border-[#B0C4DE] bg-white px-3 py-2 text-center shadow-sm">
                <span className="text-sm font-medium text-gray-900">
                  {dupLoadingLabel === duplicateSourceLabel
                    ? "Хуулж байна…"
                    : "Вариант үүсгэх"}
                </span>
              </div>
            </button>

            {filteredLabels.map((label) => {
              const rows = grouped.get(label) ?? [];
              const count = rows.length;
              return (
                <VariationHubCard
                  key={label}
                  label={label}
                  questionCount={count}
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

          {filteredLabels.length === 0 && variantSearch.trim() !== "" && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Хайлтанд тохирох хувилбар олдсонгүй.
            </p>
          )}
        </>
      )}
    </div>
  );
}
