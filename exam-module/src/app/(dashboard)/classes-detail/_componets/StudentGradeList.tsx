"use client";

import { Users } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, ResponsiveContainer } from "recharts";
import { SectionTitle, ScorePill } from "./atoms";
import type { Student } from "./mock";

interface StudentGradeListProps {
  students:  Student[];
  selected:  Student;
  onSelect:  (s: Student) => void;
  className: string;
}

export const StudentGradeList = ({ students, selected, onSelect, className }: StudentGradeListProps) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <SectionTitle
      icon={<Users size={18} />}
      title={`${className || "Анги"}`}
      sub="Сурагч дарж асуултыг харна уу"
    />

    {students.length > 0 && (
      <div className="h-20 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={students} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => v.split(".").pop()?.slice(0, 4) ?? v.slice(0, 4)}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {students.map((s) => (
                <Cell
                  key={s.id}
                  fill={s.score >= 85 ? "#34d399" : s.score >= 70 ? "#fbbf24" : "#f87171"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}

    <div className="space-y-1">
      {students.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all border ${
            selected.id === g.id
              ? "bg-[#5136a8]/8 border-[#5136a8]/30 text-[#5136a8]"
              : "hover:bg-gray-50 text-gray-700 border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white ${
                g.score >= 85 ? "bg-emerald-400" : g.score >= 70 ? "bg-amber-400" : "bg-red-400"
              }`}
            >
              {g.name.charAt(0)}
            </div>
            <span className="font-medium">{g.name}</span>
            <span className="text-[10px] text-gray-400">{g.variant}</span>
          </div>
          <ScorePill score={g.score} />
        </button>
      ))}

      {students.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">Сурагч олдсонгүй</p>
      )}
    </div>
  </div>
);
