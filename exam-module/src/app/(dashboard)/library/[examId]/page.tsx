"use client";

export const runtime = "edge";
import { useParams, useRouter } from "next/navigation";
import { useGetExamForEditQuery } from "@/gql/graphql";
import { useMemo } from "react";

function normalize(v?: string) {
  return (v || "").trim().toUpperCase();
}

export default function ExamPreviewPage() {
  const { examId } = useParams();
  const router = useRouter();

  const { data, loading, error } = useGetExamForEditQuery({
    variables: { examId: examId as string },
    skip: !examId,
  });

  const questions = data?.questions ?? [];

  const aQuestions = useMemo(() => {
    const A = questions.filter((q) => normalize(q.variation) === "A");
    if (A.length > 0) return A;
    const firstVar = questions[0]?.variation;
    return questions.filter((q) => q.variation === firstVar);
  }, [questions]);

  if (loading) return <div className="flex justify-center p-20 text-gray-500">Уншиж байна…</div>;
  if (error) return <div className="p-8 text-red-500 text-center">Алдаа гарлаа</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <span>←</span> Буцах
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-8 px-2">
          {data?.exam?.name} <span className="font-light text-gray-400">(Preview)</span>
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
                          ${isCorrect 
                            ? "border-purple-300 bg-purple-50 ring-1 ring-purple-100" 
                            : "border-gray-200 bg-white hover:border-gray-300"}
                        `}
                      >
                        <span className={`text-sm ${isCorrect ? "text-purple-900 font-semibold" : "text-gray-700"}`}>
                          <span className="mr-2 text-gray-400 font-normal">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {a}
                        </span>
                        
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${isCorrect ? "border-purple-900 bg-purple-900" : "border-gray-300"}
                        `}>
                          {isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
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