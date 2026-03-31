"use client";

import { useState, useMemo } from "react";
import {
  useGetClassAverageQuery,
  useGetClassAttendanceQuery,
} from "@/gql/graphql";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FinishedSession {
  id: string;
  description: string;
  classId?: string | null;
  class?: { id?: string | null; name: string } | null;
  exam?: { id?: string | null; name: string } | null;
  startTime: string;
  endTime: string;
}

interface ProgressTableProps {
  sessions: FinishedSession[];
}

// ─── Per-row: fetches its own avg + attendance ────────────────────────────────

function SessionRow({ session }: { session: FinishedSession }) {
  const classId = session.classId ?? session.class?.id ?? "";
  const examSessionId = session.id;

  const { data: avgData } = useGetClassAverageQuery({
    variables: { classId, examSessionId },
    skip: !classId || !examSessionId,
    fetchPolicy: "cache-and-network",
  });

  const { data: attData } = useGetClassAttendanceQuery({
    variables: { classId, examSessionId },
    skip: !classId || !examSessionId,
    fetchPolicy: "cache-and-network",
  });

  const avg = avgData?.classAverage?.averageScore ?? null;
  const attended = attData?.classAttendance?.attended ?? null;
  const totalStudents = attData?.classAttendance?.totalStudents ?? null;

  const scoreColor =
    avg === null
      ? ""
      : avg >= 90
      ? "text-[#3B6D11] bg-[#EAF3DE]"
      : avg >= 75
      ? "text-[#BA7517] bg-[#FAEEDA]"
      : "text-[#A32D2D] bg-[#FCEBEB]";

  const attendanceFull =
    attended !== null && totalStudents !== null && attended === totalStudents;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F3F0FF] text-[#65558F] text-xs font-semibold">
          {session.class?.name ?? "—"}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-gray-800">{session.description}</td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {session.exam?.name ?? "—"}
      </td>
      <td className="px-5 py-4 text-right">
        {avg !== null ? (
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-sm font-semibold ${scoreColor}`}>
            {avg.toFixed(1)}%
          </span>
        ) : (
          <span className="text-sm text-gray-300">—</span>
        )}
      </td>
      <td className="px-5 py-4 text-right">
        {attended !== null && totalStudents !== null ? (
          <span className={`text-sm font-semibold ${attendanceFull ? "text-[#185FA5]" : "text-gray-700"}`}>
            {attended}/{totalStudents}
          </span>
        ) : (
          <span className="text-sm text-gray-300">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export default function ProgressTable({ sessions }: ProgressTableProps) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const uniqueClasses = useMemo(() => {
    const names = sessions.map((s) => s.class?.name).filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        !search ||
        s.exam?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || s.class?.name === classFilter;
      return matchSearch && matchClass;
    });
  }, [sessions, search, classFilter]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Search + filter */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
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
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Авсан анги</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Шалгалтын нэр</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Материалын нэр</th>
              <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">Анги дундаж</th>
              <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">Ирц</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                  Дууссан шалгалт олдсонгүй
                </td>
              </tr>
            ) : (
              filtered.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
