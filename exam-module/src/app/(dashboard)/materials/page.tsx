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
import { formatExamCardDate, gradientForExamId } from "./_components/mock";
import MaterialCard from "./_components/Materialcard";
import AddCard from "./_components/Addcard";
import { Search } from "lucide-react";


export default function MaterialsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"mine" | "bank">("mine");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const [materialSearch, setMaterialSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [classId, setClassId] = useState("");

  const { data: classesData } = useGetClassesQuery();

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

  const showFilters = activeTab === "bank";

  const filteredMaterials = useMemo(() => {
    const exams = data?.exams ?? [];
    const q = materialSearch.trim().toLowerCase();

    return exams
      .filter((exam) => {
        if (activeTab === "bank" && !exam.isPublic) return false;

        if (q && !exam.name.toLowerCase().includes(q)) return false;

        if (showFilters) {
          if (subjectId && exam.subjectId !== subjectId) return false;
          if (topicId && exam.topicId !== topicId) return false;
          
        }

        return true;
      })
      .map((exam) => ({
        id: exam.id,
        title: exam.name,
        date: formatExamCardDate(exam.createdAt),
        gradient: gradientForExamId(exam.id),
      }));
  }, [data?.exams, activeTab, materialSearch, subjectId, topicId, showFilters]);

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
            <div className="flex gap-8">
              <button
                onClick={() => {
                  setActiveTab("mine");
                  setSelectedExamId(null);
                }}
                className={`pb-2 text-sm font-semibold relative ${
                  activeTab === "mine" ? "text-[#5136a8]" : "text-gray-400"
                }`}
              >
                Миний материалууд
              </button>

              <button
                onClick={() => {
                  setActiveTab("bank");
                  setSelectedExamId(null);
                }}
                className={`pb-2 text-sm font-semibold relative ${
                  activeTab === "bank" ? "text-[#5136a8]" : "text-gray-400"
                }`}
              >
                Шалгалтын сан
              </button>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="search"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Материалын нэрээр хайх..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:bg-white"
              />
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="relative w-full sm:w-64">
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setTopicId("");
                  }}
                  className="w-full h-11 px-4 border rounded-xl text-sm"
                >
                  <option value="">Бүх хичээл</option>
                  {optionsData?.subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={!subjectId}
                  className="w-full h-11 px-4 border rounded-xl text-sm"
                >
                  <option value="">
                    {subjectId ? "Бүх сэдэв" : "Эхлээд хичээл сонгоно"}
                  </option>
                  {topicsData?.topics?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div>
          {selectedExamId ? (
            <ExamVariationsHub
              examId={selectedExamId}
              materialsTab={activeTab}
              onMaterialsTabChange={setActiveTab}
            />
          ) : (
            <div className="grid grid-cols-5 gap-10">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
