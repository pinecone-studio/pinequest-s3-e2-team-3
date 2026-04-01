"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetClassesQuery,
  useGetExamssQueryQuery,
  useGetExamCreateOptionsQuery,
  useTopicsBySubjectQuery,
} from "@/gql/graphql";
import ExamVariationsHub from "./_components/ExamVariationsHub";
import {
  formatExamCardDate,
  gradientForExamId,
  type Material,
} from "./_components/mock";
import MaterialCard from "./_components/Materialcard";
import AddCard from "./_components/Addcard";
import { ChevronDown, Search } from "lucide-react";

export default function MaterialsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mine" | "bank">("mine");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");

  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");

  const { data, loading, error } = useGetExamssQueryQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: optionsData } = useGetExamCreateOptionsQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: topicsData } = useTopicsBySubjectQuery({
    variables: { subjectId },
    skip: !subjectId,
  });

  useGetClassesQuery();

  const filteredMaterials = useMemo(() => {
    const exams = data?.exams ?? [];
    const q = materialSearch.trim().toLowerCase();

    return exams
      .filter((exam) => {
        if (activeTab === "bank" && !exam.isPublic) return false;

        if (q && !exam.name.toLowerCase().includes(q)) return false;

        if (subjectId && exam.subjectId !== subjectId) return false;

        if (topicId && exam.topicId !== topicId) return false;

        return true;
      })
      .map((exam) => ({
        id: exam.id,
        title: exam.name,
        date: formatExamCardDate(exam.createdAt),
        gradient: gradientForExamId(exam.id),
      }));
  }, [data?.exams, activeTab, materialSearch, subjectId, topicId]);

  return (
    <div className="bg-white p-6 min-h-screen">
      {!selectedExamId && (
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold text-gray-900">
            Шалгалтын материал
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Шалгалтын материал үүсгэн ангиудад хуваарилах
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
            <div className="relative flex gap-8">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mine");
                  setSelectedExamId(null);
                }}
                className={`pb-2 text-sm font-semibold transition-colors relative ${
                  activeTab === "mine" ? "text-[#5136a8]" : "text-gray-400"
                }`}
              >
                Миний материалууд
                {activeTab === "mine" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5D3FD3] rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("bank");
                  setSelectedExamId(null);
                }}
                className={`pb-2 text-sm font-semibold transition-colors relative ${
                  activeTab === "bank" ? "text-[#5136a8]" : "text-gray-400"
                }`}
              >
                Шалгалтын сан
                {activeTab === "bank" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5D3FD3] rounded-full" />
                )}
              </button>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="search"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Материалын нэрээр хайх..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="relative w-full sm:w-64">
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopicId("");
                }}
                className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium cursor-pointer"
              >
                <option value="">Бүх хичээл</option>
                {optionsData?.subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-64">
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId}
                className="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer"
              >
                <option value="">
                  {subjectId ? "Бүх сэдэв" : "Эхлээд хичээл сонгоно уу"}
                </option>
                {topicsData?.topics?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          Алдаа: {error.message}
        </div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 w-full bg-gray-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className={selectedExamId ? "" : "mt-2"}>
          {selectedExamId ? (
            <div>
              <button
                type="button"
                onClick={() => setSelectedExamId(null)}
                className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Жагсаалт руу буцах
              </button>
              <ExamVariationsHub
                examId={selectedExamId}
                materialsTab={activeTab}
                onMaterialsTabChange={(tab) => {
                  setActiveTab(tab);
                  if (tab === "bank") setSelectedExamId(null);
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeTab === "mine" && !materialSearch && !subjectId && (
                <AddCard onClick={() => router.push("/materials/create")} />
              )}

              {filteredMaterials.map((m) => (
                <MaterialCard
                  key={m.id}
                  material={m}
                  onClick={() => {
                    if (activeTab === "bank") {
                      router.push(`/materials/${m.id}/preview`);
                    } else {
                      setSelectedExamId(m.id);
                    }
                  }}
                />
              ))}

              {filteredMaterials.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 text-sm font-medium">
                    Хайлтанд тохирох шалгалтын материал олдсонгүй.
                  </p>
                  <button
                    onClick={() => {
                      setMaterialSearch("");
                      setSubjectId("");
                      setTopicId("");
                    }}
                    className="mt-2 text-indigo-600 text-xs font-bold hover:underline"
                  >
                    Шүүлтүүрийг цэвэрлэх
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
