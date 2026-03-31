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

  if (loading) return <p className="p-8">Уншиж байна…</p>;
  if (error) return <p className="p-8 text-red-500">Алдаа гарлаа</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/materials")}
        className="text-sm text-gray-500 mb-4"
      >
        ← Буцах
      </button>

      <h1 className="text-2xl font-bold mb-6">{data?.exam?.name} (Preview)</h1>

      {aQuestions.length === 0 ? (
        <p>Асуулт алга</p>
      ) : (
        <div className="space-y-4">
          {aQuestions.map((q, i) => (
            <div key={q.id} className="p-4 border rounded-xl bg-white">
              <p className="font-semibold">
                {i + 1}. {q.question}
              </p>

              <div className="mt-2 space-y-1">
                {q.answers.map((a, idx) => (
                  <div
                    key={idx}
                    className={`text-sm px-2 py-1 rounded ${
                      idx === q.correctIndex
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {a}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
