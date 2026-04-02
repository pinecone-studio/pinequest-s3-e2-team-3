"use client";

import type { Student } from "./mock";

interface StudentGradeListProps {
  students:  Student[];
  selected:  Student;
  onSelect:  (s: Student) => void;
  className: string;
  examTitle?: string;
}

export const StudentGradeList = ({
  students,
  selected,
  onSelect,
  className,
  examTitle = "Явцын шалгалт",
}: StudentGradeListProps) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
    {/* Header */}
    <div className="px-6 pt-5 pb-3 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 text-[15px]">{className}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{examTitle}</p>
    </div>

    {/* Table head */}
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
      <span className="text-xs font-semibold text-gray-500">Сурагчдын нэрс</span>
      <span className="text-xs font-semibold text-gray-500">Авсан дүн</span>
    </div>

    {/* Scrollable list */}
    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
      {students.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">Сурагч олдсонгүй</p>
      ) : (
        students.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`w-full flex items-center justify-between px-6 py-3.5 text-sm transition-colors text-left ${
              selected.id === s.id ? "bg-[#f3f0ff]" : "hover:bg-gray-50"
            }`}
          >
            <span className={`font-medium ${selected.id === s.id ? "text-[#5136a8]" : "text-gray-800"}`}>
              {s.name}
            </span>
            <span className={`font-semibold text-sm ${selected.id === s.id ? "text-[#5136a8]" : "text-gray-700"}`}>
              {s.score}%
            </span>
          </button>
        ))
      )}
    </div>
  </div>
);
