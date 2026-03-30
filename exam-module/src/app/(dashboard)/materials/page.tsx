"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetClassesQuery, useGetExamssQueryQuery } from "@/gql/graphql";
import ExamVariationsHubPage from "./[examId]/page";
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

  const { data, loading, error } = useGetExamssQueryQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: classData } = useGetClassesQuery();
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
  return (
    <div className="p-8 sm:p-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Шалгалтын материал
          </h1>
          <p className="text-sm text-gray-500">
            Шалгалтын материал үүсгэн ангиудад хуваарлах
          </p>
        </div>

        <div className="flex gap-6 border-b border-gray-100 pb-1 relative">
          <button
            onClick={() => {
              setActiveTab("mine");
              setSelectedExamId(null);
            }}
            className={`text-sm font-medium transition-colors pb-2 ${
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
            className={`text-sm font-medium transition-colors pb-2 ${
              activeTab === "bank" ? "text-[#5136a8]" : "text-gray-400"
            }`}
          >
            Шалгалтын сан
          </button>

          <div
            className={`absolute bottom-0 h-0.5 bg-[#5136a8] transition-all duration-300 ${
              activeTab === "mine"
                ? "left-0 w-[120px]"
                : "left-[145px] w-[100px]"
            }`}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">Алдаа: {error.message}</p>
      )}

      {loading && !data ? (
        <p className="text-sm text-gray-500 mb-4">Уншиж байна…</p>
      ) : null}

      <div className="flex flex-wrap gap-10  mt-10">
        {activeTab === "mine" ? (
          <>
            <AddCard onClick={() => router.push("/materials/create")} />
            {materials.map((m) => (
              <MaterialCard 
                key={m.id}
                material={m}
                onClick={() => router.push(`/materials/${m.id}`)}
              />
            ))}
          </>
      <div className="mt-10">
        {selectedExamId ? (
          <div>
            <button
              onClick={() => setSelectedExamId(null)}
              className="mb-6 text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              ← Буцах
            </button>
            <ExamVariationsHubPage examId={selectedExamId} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-10">
            {activeTab === "mine" ? (
              <>
                <AddCard onClick={() => router.push("/materials/create")} />
                {materials.map((m) => (
                  <MaterialCard
                    key={m.id}
                    material={m}
                    onClick={() => setSelectedExamId(m.id)}
                  />
                ))}
              </>
            ) : (
              <>
                {bankMaterials.map((m) => (
                  <MaterialCard
                    key={m.id}
                    material={m}
                    onClick={() => setSelectedExamId(m.id)}
                  />
                ))}
                {!loading && bankMaterials.length === 0 && (
                  <p className="text-gray-400 text-sm">public exam baihgui </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
