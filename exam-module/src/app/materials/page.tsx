"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useGetExamsQuery } from "@/gql/graphql";

import { formatExamCardDate, gradientForExamId, type Material } from "./_components/mock";
import MaterialCard from "./_components/Materialcard";
import AddCard from "./_components/Addcard";

export default function MaterialsPage() {
  const router = useRouter();
  const { data, loading, error } = useGetExamsQuery({
    fetchPolicy: "cache-and-network",
  });

  const materials: Material[] = useMemo(() => {
    const exams = data?.exams ?? [];
    return exams.map((exam) => ({
      id: exam.id,
      title: exam.name,
      date: formatExamCardDate(exam.createdAt),
      gradient: gradientForExamId(exam.id),
    }));
  }, [data?.exams]);

  return (
    <div className="p-8 sm:p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Шалгалтын материал</h1>
      <p className="text-sm text-gray-500 mb-8">Шалгалтын материал үүсгэн ангиудад хуваарлах</p>

      {error && (
        <p className="text-sm text-red-600 mb-4">Алдаа: {error.message}</p>
      )}

      {loading && !data ? (
        <p className="text-sm text-gray-500 mb-4">Уншиж байна…</p>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AddCard onClick={() => router.push("/materials/create")} />
        {materials.map((m) => (
          <MaterialCard
            key={m.id}
            material={m}
            onClick={() => router.push(`/materials/${m.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
