// 1. Define the query.
"use client";

import { useGetExamsQuery } from "@/gql/graphql";

export default function ExamsPage() {
  const { data, loading, error } = useGetExamsQuery();
  const exams = data?.exams || [];
  console.log("exams", exams);
  if (loading) {
    return "...loading";
  }
  if (error) return <p>Алдаа гарлаа: {error.message}</p>;
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Pinequest <span className="text-blue-600">Exams</span>
            </h1>
            <p className="text-slate-500 font-medium">
              System Architecture Module
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            v1.0.2-stable
          </div>
        </header>

        <div className="grid gap-4">
          {exams.length > 0 ? (
            exams?.map((exam) => (
              <div
                key={exam.id}
                className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-lg transition-all flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {exam.title}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {exam.durationMinutes} Minutes Duration
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-200">
                    Edit
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
                    Launch
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
              <p className="text-slate-400">No exams found in D1 Database.</p>
              <code className="text-xs bg-slate-100 p-1 rounded mt-2 inline-block">
                Check GraphQL Playground to add data
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
