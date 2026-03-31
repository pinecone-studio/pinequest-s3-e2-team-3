"use client";

import { useState, useMemo } from "react";

interface FinishedSession {
  id: string;
  description: string;
  class?: { name: string } | null;
  exam?: { name: string } | null;
  startTime: string;
  endTime: string;
  avgScore?: number;
  attendancePresent?: number;
  attendanceTotal?: number;
}

interface ProgressTableProps {
  sessions?: FinishedSession[];
}

// Mock data matching image 4 appearance
const mockFinishedSessions: FinishedSession[] = [
  {
    id: "1",
    description: "Явцын шалгалт",
    class: { name: "11А" },
    exam: { name: "Алгебрын илэрхийлэл" },
    startTime: "",
    endTime: "",
    avgScore: 87.8,
    attendancePresent: 42,
    attendanceTotal: 46,
  },
  {
    id: "2",
    description: "Явцын шалгалт",
    class: { name: "11Б" },
    exam: { name: "Алгебрын илэрхийлэл" },
    startTime: "",
    endTime: "",
    avgScore: 94.2,
    attendancePresent: 39,
    attendanceTotal: 39,
  },
];

export default function ProgressTable({ sessions }: ProgressTableProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const data = sessions && sessions.length > 0 ? sessions : mockFinishedSessions;

  const uniqueClasses = useMemo(() => {
    const names = data.map((s) => s.class?.name).filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((s) => {
      const matchSearch =
        !search ||
        s.exam?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || s.class?.name === classFilter;
      return matchSearch && matchClass;
    });
  }, [data, search, classFilter]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Search + filter row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-3 py-2 bg-white">
          <svg
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Материалын нэрээр хайх"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          />
        </div>

        <div className="relative">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="appearance-none border border-gray-200 rounded-xl px-3 py-2 pr-7 text-sm text-gray-700 bg-white outline-none focus:border-[#65558F] cursor-pointer"
          >
            <option value="">Анги</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                Авсан анги
              </th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                Шалгалтын нэр
              </th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">
                Материалын нэр
              </th>
              <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">
                Анги дундаж
              </th>
              <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">
                Ирц
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-sm text-gray-400"
                >
                  Дууссан шалгалт олдсонгүй
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const avg = s.avgScore ?? 0;
                const scoreColor =
                  avg >= 90
                    ? "text-[#3B6D11] bg-[#EAF3DE]"
                    : avg >= 75
                    ? "text-[#BA7517] bg-[#FAEEDA]"
                    : "text-[#A32D2D] bg-[#FCEBEB]";

                const attendance =
                  s.attendancePresent != null && s.attendanceTotal != null
                    ? `${s.attendancePresent}/${s.attendanceTotal}`
                    : "—";

                const attendanceFull =
                  s.attendancePresent === s.attendanceTotal;

                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F3F0FF] text-[#65558F] text-xs font-semibold">
                        {s.class?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-800">
                      {s.description}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {s.exam?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {s.avgScore != null ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-sm font-semibold ${scoreColor}`}
                        >
                          {avg.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          attendanceFull ? "text-[#185FA5]" : "text-gray-700"
                        }`}
                      >
                        {attendance}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
