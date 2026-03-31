"use client";

import { FileText, AlertTriangle } from "lucide-react";
import { SectionTitle } from "./atoms";
import { QUESTIONS, Q_STATS } from "./mock";
import type { Student } from "./mock";

interface QuestionDetailProps {
  student: Student;
}

export const QuestionDetail = ({ student }: QuestionDetailProps) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <SectionTitle
      icon={<FileText size={18} />}
      title={student.name}
      sub={`${student.variant} Вариант · ${student.score}% оноо`}
    />

    <div className="space-y-3">
      {QUESTIONS.map(q => {
        const stat   = Q_STATS.find(s => s.q === `А-${q.no}`);
        const isHard = stat && stat.wrong >= 10;

        return (
          <div
            key={q.no}
            className={`rounded-xl p-4 border ${isHard ? "bg-red-50/50 border-red-100" : "bg-gray-50/50 border-gray-100"}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2">
                {isHard && <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />}
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  {q.no}. {q.text}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isHard && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">
                    {stat?.wrong} алдсан
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{q.score}п</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {q.options.map(opt => (
                <div
                  key={opt}
                  className={`px-2.5 py-2 rounded-lg text-xs text-center font-semibold border ${
                    opt.charAt(0) === q.correct
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-white text-gray-500 border-gray-200"
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
