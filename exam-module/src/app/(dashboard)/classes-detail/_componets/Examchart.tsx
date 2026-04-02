"use client";

import { BarChart2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList,
} from "recharts";
import { SectionTitle } from "./atoms";
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
    <div className="bg-white border border-gray-100  rounded-2xl p-6 shadow-sm">
      
      <div className="bg-white  mb-6">
  <div className="flex items-center gap-2 text-[14px] leading-[125%] font-normal text-[#0f172a]">
    
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.7998 1.79999V12.6H12.5998M11.3998 5.39999L8.3998 8.39999L5.9998 5.99999L4.1998 7.79999"
        stroke="#64748B"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <span className="font-[GIP]">
      Шугаман график
    </span>
    
  </div>
</div>

  {/* Top header row */}
<div className="flex items-start justify-between gap-6 mb-6">
  
  {/* Left: Custom Title */}
  <div className="flex flex-col gap-2 max-w-full">
    
    {/* Title */}
    <h2 className="text-[16px] font-semibold leading-[130%] text-gray-800">
      {`${className || "Анги"} — Явцын шалгалтын анализ`}
    </h2>

    {/* Subtitle (ТОМРУУЛСАН) */}
    <p className="text-[14px] font-normal leading-[125%]">
      Шалгалтад сурагчдын хамгийн их алдаа гаргасан асуултуудын үзүүлэлт
    </p>

  </div>

  {/* Right: 2 stat cards */}
  <div className="flex gap-3 shrink-0">
    <div className="bg-[#EEEAF8] rounded-2xl px-6 py-4 text-center min-w-[180px]">
      <p className="text-sm text-[#7165a3] font-medium mb-1">
        Хамгийн их алдсан асуултууд
      </p>
      <p className="text-3xl font-black text-[#1a054d]">
        №{topHardLabels}
      </p>
    </div>

    <div className="rounded-2xl border border-gray-200 px-6 py-4 text-center min-w-[150px]">
      <p className="text-sm text-gray-400 font-medium mb-1">
        Ангийн дундаж дүн
      </p>
      <p className="text-3xl font-black text-gray-900">
        {classAvg}%
      </p>
    </div>
  </div>

</div>

      {/* Line chart */}
      <div className="h-64">
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
