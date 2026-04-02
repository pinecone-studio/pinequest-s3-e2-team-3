"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList,
} from "recharts";
import type { HardQuestion, Student, QuestionStat } from "./mock";

interface ExamChartProps {
  className: string;
  topHard:   HardQuestion[];
  students:  Student[];
  qStats:    QuestionStat[];
  classAvg:  number;
}

export const ExamChart = ({ className, topHard, students, qStats, classAvg }: ExamChartProps) => {
  if (!qStats.length) return null;

  const hardest = qStats.reduce((a, b) => (a.wrong > b.wrong ? a : b));

  const topHardLabels = [...qStats]
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 2)
    .map((s) => s.q.replace(/^[^-]+-/, ""))
    .join(", ");

  const chartData = qStats.map((s, i) => ({
    ...s,
    wrong: Math.round(s.wrong),
    label: `Асуулт-${i + 1}`,
  }));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      {/* ── Header: title left + stat cards right ── */}
      <div className="flex items-stretch" style={{ borderBottom: "1px solid #E2E8F0" }}>

        {/* Left: icon + title + subtitle */}
        <div className="flex-1 px-6 py-5">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M1.7998 1.79999V12.6H12.5998M11.3998 5.39999L8.3998 8.39999L5.9998 5.99999L4.1998 7.79999" stroke="#94a3b8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Шугаман график</span>
          </div>
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">
            {`${className || "Анги"} — Явцын шалгалтын анализ`}
          </h2>
          <p className="text-sm text-gray-400">
            Шалгалтад сурагчдын хамгийн их алдаа гаргасан асуултуудын үзүүлэлт
          </p>
        </div>

        {/* Stat card 1 — purple bg */}
        <div
          className="flex flex-col justify-center text-center px-6 py-5 min-w-[160px]"
          style={{ background: "#E1DFF9", borderLeft: "1px solid #E2E8F0" }}
        >
          <p className="text-xs text-[#666] font-medium mb-1.5 leading-tight">
            Хамгийн их алдсан асуултууд
          </p>
          <p className="text-2xl font-black text-[#020617]">№{topHardLabels}</p>
        </div>

        {/* Stat card 2 — white */}
        <div
          className="flex flex-col justify-center text-center px-6 py-5 min-w-[140px]"
          style={{ borderLeft: "1px solid #E2E8F0" }}
        >
          <p className="text-xs text-[#666] font-medium mb-1.5 leading-tight">
            Ангийн дундаж дүн
          </p>
          <p className="text-2xl font-black text-[#020617]">{classAvg}%</p>
        </div>
      </div>

      {/* ── Line chart ── */}
      <div className="h-64 px-6 pt-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 24, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
              formatter={(v) => [`${v} сурагч`, "Алдсан"]}
            />
            <ReferenceLine y={hardest.wrong} stroke="#fca5a5" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="wrong"
              stroke="#7165a3"
              strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isHard = topHard.some((h) => h.stat.q === payload.q);
                return (
                  <circle
                    key={payload.q}
                    cx={cx} cy={cy}
                    r={isHard ? 7 : 5}
                    fill={isHard ? "#ef4444" : "#9b8fd4"}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 6, fill: "#5136a8" }}
            >
              <LabelList
                dataKey="wrong"
                position="top"
                style={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
