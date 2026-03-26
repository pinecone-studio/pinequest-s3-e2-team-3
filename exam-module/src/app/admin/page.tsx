"use client";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function TeacherPage() {
  // Зөвхөн амжилттай синк хийгдсэн хариултуудыг харна
  const syncedAnswers = useLiveQuery(() => db.answers.where("status").equals("synced").toArray());

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👨‍🏫 Багшийн хянах самбар</h1>
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
            {syncedAnswers?.map((ans) => (
              <tr key={ans.id} className="border-b hover:bg-gray-50 transition-all">
                <td className="p-4 text-sm font-medium">{ans.studentName}</td>
                <td className="p-4 text-sm text-gray-600">{ans.text}</td>
                <td className="p-4 text-sm"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">ИРСЭН</span></td>
              </tr>
            ))}
            {(!syncedAnswers || syncedAnswers.length === 0) && (
              <tr><td colSpan={3} className="p-10 text-center text-gray-400 text-sm">Одоогоор ирсэн хариулт алга...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}