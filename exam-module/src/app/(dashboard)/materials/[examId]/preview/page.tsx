"use client";

export const runtime = "edge";
import { useParams, useRouter } from "next/navigation";
import {
  useGetExamForEditQuery,
  useCloneExamMutation,
  GetExamssQueryDocument,
} from "@/gql/graphql";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function normalize(v?: string) {
  return (v || "").trim().toUpperCase();
}

export default function ExamPreviewPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [currentUserId] = useState<string>(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const user = JSON.parse(raw) as { id?: string };
      return user.id ?? "";
    } catch {
      return "";
    }
  });

  const { data, loading, error } = useGetExamForEditQuery({
    variables: { examId: examId as string },
    skip: !examId,
  });

  const [cloneExam, { loading: cloning }] = useCloneExamMutation({
    refetchQueries: [{ query: GetExamssQueryDocument }],
  });

  const handleClone = async () => {
    if (!examId || !currentUserId) return;
    try {
      await cloneExam({
        variables: { examId: examId as string, teacherId: currentUserId },
      });
      toast.success("Материал амжилттай хуулагдлаа");
      router.push("/materials");
    } catch {
      toast.error("Хуулахад алдаа гарлаа. Дахин оролдоно уу.");
    }
  };

  const questions = data?.questions ?? [];

  const aQuestions = useMemo(() => {
    const A = questions.filter((q) => normalize(q.variation) === "A");
    if (A.length > 0) return A;
    const firstVar = questions[0]?.variation;
    return questions.filter((q) => q.variation === firstVar);
  }, [questions]);

  if (loading)
    return (
      <div className="flex justify-center p-20 text-gray-500">Уншиж байна…</div>
    );
  if (error)
    return <div className="p-8 text-red-500 text-center">Алдаа гарлаа</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <span>←</span> Буцах
          </button>

          <button
            onClick={handleClone}
            disabled={cloning || !currentUserId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#21005D] text-white text-sm font-medium hover:bg-[#21005D]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {cloning ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
            {cloning ? "Хуулж байна…" : "Хуулах"}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-8 px-2">
          {data?.exam?.name}{" "}
          <span className="font-light text-gray-400">(Preview)</span>
        </h1>

        {aQuestions.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Асуулт алга</p>
        ) : (
          <div className="space-y-6">
            {aQuestions.map((q, i) => (
              <div
                key={q.id}
                className="relative bg-white border border-gray-100 rounded-[24px] p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute top-6 right-8 text-sm font-medium text-gray-600">
                  Оноо : 2
                </div>

                <div className="text-lg text-gray-800 font-medium mb-8 pr-16">
                  {i + 1}. {q.question}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {q.answers.map((a, idx) => {
                    const isCorrect = idx === q.correctIndex;
                    return (
                      <div
                        key={idx}
                        className={`
                          relative flex items-center justify-between px-5 py-3 rounded-full border transition-all
                          ${
                            isCorrect
                              ? "border-purple-300 bg-purple-50 ring-1 ring-purple-100"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }
                        `}
                      >
                        <span
                          className={`text-sm ${isCorrect ? "text-purple-900 font-semibold" : "text-gray-700"}`}
                        >
                          <span className="mr-2 text-gray-400 font-normal">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {a}
                        </span>

                        <div
                          className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${isCorrect ? "border-purple-900 bg-purple-900" : "border-gray-300"}
                        `}
                        >
                          {isCorrect && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
