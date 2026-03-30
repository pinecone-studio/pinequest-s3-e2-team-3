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
import {
  nextBatchVariationLabel,
  normalizeVariationLabel,
} from "../_components/variation";

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
}

export default function ExamVariationsHubPage({ examId }: Props) {
  const router = useRouter();
  const urlParams = useParams();

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

  const labels = useMemo(
    () => sortVariationLabels(Array.from(grouped.keys())),
    [grouped],
  );

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
            ...(row.attachmentKey
              ? { attachmentKey: row.attachmentKey }
              : {}),
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

  function FileSheet({ className }: { className?: string }) {
    return (
      <div
        className={`absolute w-[40%] aspect-[3/4] bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 p-[4%] flex flex-col gap-[10%] transition-transform duration-300 ${className}`}
      >
        <div className="h-[4%] w-full bg-gray-300 rounded-full" />
        <div className="h-[4%] w-full bg-gray-300 rounded-full" />
        <div className="h-[4%] w-full bg-gray-300 rounded-full" />
        <div className="h-[4%] w-full bg-gray-300 rounded-full opacity-50" />
        <div className="h-[4%] w-full bg-gray-300 rounded-full opacity-50" />
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-10 ">
      <div className="mb-8">
        <div className="group relative w-[320px] h-[183px]  flex flex-col justify-end">
          <div className="absolute inset-0 flex justify-center items-start pt-4">
            <FileSheet className="-rotate-15 -translate-x-15 -translate-y-2 opacity-80" />

            <FileSheet className="rotate-15 translate-x-15 -translate-y-2 opacity-80" />

            <FileSheet className="z-10 -translate-y-5 shadow-md border-gray-200/50" />
          </div>

          <div className="relative h-[130px] w-full z-20">
            <div
              className="absolute inset-0 bg-[#E8EFFF]/60 backdrop-blur-[2px] border border-blue-400 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              style={{
                clipPath:
                  "polygon(0% 0%, 28% 0%, 38% 18%, 100% 18%, 100% 100%, 0% 100%)",
              }}
            />
            <div className="absolute bottom-4 inset-x-3 h-[28px] bg-white/80 backdrop-blur-md rounded-lg flex items-center justify-between px-3 border border-[#A2BBFF]/30 shadow-sm transition-all group-hover:bg-white">
              <span className="text-[13px] font-bold text-gray-800 truncate pr-2 tracking-tight">
                {examName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {hubError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {hubError}
        </div>
      )}

      {labels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Энэ шалгалтод асуулт байхгүй байна.
          </p>
          <Link
            href={`/materials/${examId}/variations/A/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Хувилбар A-аас эхлүүлэх
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex px-4 py-4">
            {/* <div className="flex-1 min-w-0">
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
            </div>{" "} */}
            <button
              type="button"
              disabled={
                dupLoadingLabel !== null ||
                !duplicateSourceLabel ||
                (grouped.get(duplicateSourceLabel)?.length ?? 0) === 0
              }
              onClick={() => duplicateAllForLabel(duplicateSourceLabel)}
              className="group relative w-full max-w-[320px] aspect-[1.5/1] cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-transform active:scale-[0.98]"
            >
              <div
                className="absolute inset-0 bg-[#F5F8FF] border border-[#A2BBFF] rounded-[20px]"
                style={{
                  clipPath:
                    "polygon(0% 0%, 38% 0%, 48% 18%, 100% 18%, 100% 100%, 0% 100%)",
                }}
              />

              <div
                className="absolute inset-0 border border-[#A2BBFF] rounded-[20px] pointer-events-none"
                style={{
                  clipPath:
                    "polygon(0% 0%, 38% 0%, 48% 18%, 100% 18%, 100% 100%, 0% 100%)",
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center pb-4">
                <div className="w-12 h-6 rounded-full border border-[#A2BBFF] bg-white flex items-center justify-center">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A2BBFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-4 inset-x-4 h-10 bg-white border border-[#A2BBFF] rounded-xl flex items-center justify-center px-4 shadow-sm">
                <span className="text-[14px] font-medium text-black truncate">
                  {dupLoadingLabel === duplicateSourceLabel
                    ? "Хуулж байна…"
                    : "Бүх асуултыг дараагийн хувилбарт хуулах"}
                </span>
              </div>
            </button>
          </div>
          <div className="flex flex-wrap gap-6">
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
