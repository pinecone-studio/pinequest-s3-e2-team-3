
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useGetExamsQuery, useGetClassesQuery } from "@/gql/graphql";

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

  const { data, loading, error } = useGetExamsQuery({
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

  const classMaterials: Material[] = useMemo(() => {
    const classes = classData?.getClasses ?? [];
    return classes.map((cls) => ({
      id: cls.id,
      title: cls.name,
      date: "3",
      gradient: "linear-gradient(135deg, #E0E7FF 0%, #EEF2FF 100%)",
    }));
  }, [classData?.getClasses]);

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
            onClick={() => setActiveTab("mine")}
            className={`text-sm font-medium transition-colors pb-2 ${
              activeTab === "mine" ? "text-[#5136a8]" : "text-gray-400"
            }`}
          >
            Миний материалууд
          </button>
          <button
            onClick={() => setActiveTab("bank")}
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
        <p className="text-sm text-gray-500 mb-4">Уншиж байнаw…</p>
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
        ) : (
          <>
            {classMaterials.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onClick={() => router.push(`/materials/${m.id}`)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
