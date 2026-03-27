"use client";

import { useEffect, useState } from "react";

type Answer = {
  id: number;
  studentName: string;
  answer: string;
};

export default function TeacherPage() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnswers() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/submit-answer", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("API error");

        const data = (await res.json()) as { answers?: Answer[] };
        setAnswers(data.answers ?? []);
      } catch {
        setError("Алдаа: өгөгдөл уншиж чадсангүй");
      } finally {
        setLoading(false);
      }
    }

    fetchAnswers();
    const interval = setInterval(fetchAnswers, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👨‍🏫 Багшийн хянах самбар</h1>

      {loading && <p className="mb-4 text-sm text-gray-500">Уншиж байна...</p>}
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-bold">Сурагч</th>
              <th className="p-4 text-sm font-bold">Хариулт</th>
              <th className="p-4 text-sm font-bold">Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((ans) => (
              <tr
                key={ans.id}
                className="border-b hover:bg-gray-50 transition-all"
              >
                <td className="p-4 text-sm font-medium">{ans.studentName}</td>
                <td className="p-4 text-sm text-gray-600">{ans.answer}</td>
                <td className="p-4 text-sm">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">
                    ИРСЭН
                  </span>
                </td>
              </tr>
            ))}

            {!loading && answers.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-10 text-center text-gray-400 text-sm"
                >
                  Одоогоор ирсэн хариулт алга...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
