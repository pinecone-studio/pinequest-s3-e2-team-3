"use client";

import { AlertTriangle, Brain, Target, Lightbulb } from "lucide-react";
import type { AIReport } from "./mock";

export const AIReportCards = ({ report }: { report: AIReport }) => {
  const hc = report.classHealthScore;
  const healthCls = hc >= 75 ? "text-emerald-400" : hc >= 55 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className="bg-gradient-to-br from-[#5136a8] to-[#3e2880] text-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-purple-300 rounded-full" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">AI Шинжээчийн тайлан</p>
          <div className="ml-auto bg-white/10 rounded-lg px-3 py-1 flex items-center gap-1.5">
            <span className="text-[10px] text-purple-200">Эрүүл мэнд</span>
            <span className={`text-sm font-black ${healthCls}`}>{hc}%</span>
          </div>
        </div>
        <p className="text-sm font-light leading-relaxed text-purple-50 mb-4">{report.summary}</p>
        <div className="pt-4 border-t border-white/10">
          <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Lightbulb size={11} /> Маргаашийн хичээл
          </p>
          <p className="text-xs text-purple-100 leading-relaxed">{report.nextLessonPlan}</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={11} /> Аюултай сэдэв
          </p>
          <p className="text-xl font-black text-red-600 mb-2">{report.weakTopic}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{report.weakTopicReason}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
            <Target size={11} /> Зөвлөмж
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">{report.recommendation}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-3">🌟 Сайн тал</p>
          <p className="text-xs text-gray-700 leading-relaxed">{report.positiveNote}</p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm sm:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1.5">
            <Brain size={11} /> Нийтлэг логик алдаа
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">{report.trendingMisconception}</p>
        </div>

        {report.atRiskStudents?.map(s => (
          <div key={s.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-3">👤 Тусламж хэрэгтэй</p>
            <p className="text-lg font-black text-orange-600 mb-1.5">{s.name}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{s.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
