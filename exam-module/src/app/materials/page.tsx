"use client";

import { useRouter } from "next/navigation";
import { mockMaterials } from "./_components/mock";
import MaterialCard from "./_components/Materialcard";
import AddCard from "./_components/Addcard";

export default function MaterialsPage() {
  const router = useRouter();

  return (
    <div className="p-8 sm:p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Шалгалтын материал</h1>
      <p className="text-sm text-gray-500 mb-8">Шалгалтын материал үүсгэн ангиудад хуваарлах</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AddCard onClick={() => router.push("/materials/create")} />
        {mockMaterials.map((m) => (
         <MaterialCard key={m.id} material={m} onClick={() => router.push(`/create/${m.id}`)} />
        ))}
      </div>
    </div>
  );
}
