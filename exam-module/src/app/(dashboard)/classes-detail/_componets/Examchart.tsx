"use client";

import { BarChart2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { SectionTitle } from "./atoms";
import { CLASS_AVG, Q_STATS, STUDENTS } from "./mock";
import type { HardQuestion } from "./mock";

interface ExamChartProps {
  className: string;
  topHard:   HardQuestion[];
}

export const ExamChart = ({ className, topHard }: ExamChartProps) => {
  const hardest = Q_STATS.reduce((a, b) => (a.wrong > b.wrong ? a : b));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <SectionTitle
        icon={<BarChart2 size={18} />}
        title={`${className || "12А"} — Явцын шалгалтын анализ`}
        sub="Асуулт бүрээр алдсан сурагчдын тоо"
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: "Хамгийн хэцүү", val: hardest.q,  sub: `${hardest.wrong} алдсан`,             cls: "bg-purple-50 border-purple-100 text-[#5136a8]" },
          { label: "Дундаж дүн",    val: `${CLASS_AVG}%`, sub: `${STUDENTS.length} сурагч`,      cls: "border-gray-100 text-gray-800" },
          { label: "Тэнцсэн",      val: `${STUDENTS.filter(s => s.score >= 70).length}`, sub: "сурагч", cls: "bg-emerald-50 border-emerald-100 text-emerald-700" },
          { label: "Хоцрогдсон",   val: `${STUDENTS.filter(s => s.score < 70).length}`,  sub: "сурагч", cls: "bg-red-50 border-red-100 text-red-700" },
        ].map(c => (
          <div key={c.label} className={`border rounded-xl px-4 py-2.5 text-center ${c.cls}`}>
            <p className="text-[10px] text-gray-400 mb-0.5">{c.label}</p>
            <p className="text-lg font-black">{c.val}</p>
            <p className="text-[10px] text-gray-400">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={Q_STATS} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="q" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
              formatter={v => [`${v} сурагч`, "Алдсан"]}
            />
            <ReferenceLine y={hardest.wrong} stroke="#fca5a5" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="wrong"
              stroke="#7165a3"
              strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isHard = topHard.some(h => h.stat.q === payload.q);
                return (
                  <circle
                    key={payload.q}
                    cx={cx} cy={cy}
                    r={isHard ? 6 : 4}
                    fill={isHard ? "#ef4444" : "#7165a3"}
                    stroke={isHard ? "#fca5a5" : "none"}
                    strokeWidth={isHard ? 2 : 0}
                  />
                );
              }}
              activeDot={{ r: 6, fill: "#5136a8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Хамгийн их алдаа — улаан цэг
        </p>
        <div className="flex gap-2 flex-wrap">
          {topHard.map(({ stat }) => (
            <div key={stat.q} className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-xs font-bold text-red-700">{stat.q}</span>
              <span className="text-[10px] text-red-400">{stat.wrong} алдсан</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
