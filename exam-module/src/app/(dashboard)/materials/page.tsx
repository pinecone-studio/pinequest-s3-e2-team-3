"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetClassesQuery, useGetExamssQueryQuery } from "@/gql/graphql";
import ExamVariationsHub from "./_components/ExamVariationsHub";
import {
  formatExamCardDate,
  gradientForExamId,
  type Material,
} from "./_components/mock";
import MaterialCard from "./_components/Materialcard";
import AddCard from "./_components/Addcard";

export default function MaterialsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"mine" | "bank">("mine");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");

  const { data, loading, error } = useGetExamssQueryQuery({
    fetchPolicy: "cache-and-network",
  });

  useGetClassesQuery();
  const materials: Material[] = useMemo(() => {
    const exams = data?.exams ?? [];
    return exams.map((exam) => ({
      id: exam.id,
      title: exam.name,
      date: formatExamCardDate(exam.createdAt),
      gradient: gradientForExamId(exam.id),
    }));
  }, [data?.exams]);

  const bankMaterials = useMemo(() => {
    const exams = data?.exams ?? [];
    return exams
      .filter((exam) => exam.isPublic === true)
      .map((exam) => ({
        id: exam.id,
        title: exam.name,
        date: formatExamCardDate(exam.createdAt),
        gradient: gradientForExamId(exam.id),
      }));
  }, [data?.exams]);

  const filteredMine = useMemo(() => {
    const q = materialSearch.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter((m) => m.title.toLowerCase().includes(q));
  }, [materials, materialSearch]);

  const filteredBank = useMemo(() => {
    const q = materialSearch.trim().toLowerCase();
    if (!q) return bankMaterials;
    return bankMaterials.filter((m) => m.title.toLowerCase().includes(q));
  }, [bankMaterials, materialSearch]);

  return (
    <div className="bg-white p-8 sm:p-10">
      {!selectedExamId && (
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Шалгалтын материал
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Шалгалтын материал үүсгэн ангиудад хуваарлах
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative flex gap-8 border-b border-gray-100 pb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mine");
                  setSelectedExamId(null);
                }}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === "mine" ? "text-[#5136a8]" : "text-gray-400"
                }`}
              >
                Миний материалууд
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("bank");
                  setSelectedExamId(null);
                }}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeTab === "bank" ? "text-[#5136a8]" : "text-gray-400"
                }`}
              >
                Шалгалтын сан
              </button>
              <div
                className={`absolute bottom-0 h-0.5 rounded-full bg-[#5D3FD3] transition-all duration-300 ${
                  activeTab === "mine"
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
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Материалын нэрээр хайх"
                className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-shadow focus:border-[#C7D2FE] focus:ring-2 focus:ring-[#E0E7FF]"
              />
            </label>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">Алдаа: {error.message}</p>
      )}

      {loading && !data ? (
        <p className="mb-4 text-sm text-gray-500">Уншиж байна…</p>
      ) : null}

      <div className={selectedExamId ? "" : "mt-2"}>
        {selectedExamId ? (
          <div>
            <button
              type="button"
              onClick={() => setSelectedExamId(null)}
              className="mb-6 flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-700"
            >
              ← Буцах
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
        ) : activeTab === "mine" ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AddCard onClick={() => router.push("/materials/create")} />
            {filteredMine.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onClick={() => setSelectedExamId(m.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBank.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onClick={() => setSelectedExamId(m.id)}
              />
            ))}
            {!loading && bankMaterials.length === 0 && (
              <p className="col-span-full text-sm text-gray-400">
                Олон нийтийн шалгалтод харагдах материал алга.
              </p>
            )}
            {!loading &&
              bankMaterials.length > 0 &&
              filteredBank.length === 0 &&
              materialSearch.trim() !== "" && (
                <p className="col-span-full text-center text-sm text-gray-500">
                  Хайлтанд тохирох материал олдсонгүй.
                </p>
              )}
          </div>
        )}
      </div>

      {!selectedExamId &&
        activeTab === "mine" &&
        !loading &&
        materials.length > 0 &&
        filteredMine.length === 0 &&
        materialSearch.trim() !== "" && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Хайлтанд тохирох материал олдсонгүй.
          </p>
        )}
    </div>
  );
}
