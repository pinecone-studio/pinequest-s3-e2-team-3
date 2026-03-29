"use client";

export const runtime = "edge";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** @deprecated Use `/materials/[examId]` (variation hub). */
export default function LegacyMaterialsEditRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params.id;
    if (typeof id === "string") {
      router.replace(`/materials/${id}`);
    }
  }, [params.id, router]);

  return <p className="p-8 text-sm text-gray-500">Шилжиж байна…</p>;
}
