"use client";

import { FileText, AlertTriangle } from "lucide-react";
import { SectionTitle } from "./atoms";
import type { Student, Question, QuestionStat } from "./mock";

interface RawAnswer {
  studentId?: string | null;
  questionId?: string | null;
  answerIndex: number;
}

interface QuestionDetailProps {
  student:        Student;
  questions:      Question[];
  qStats:         QuestionStat[];
  studentAnswers: RawAnswer[];
}

export const QuestionDetail = ({ student, questions, qStats, studentAnswers }: QuestionDetailProps) => {
  // Filter answers for this student
  const myAnswers = studentAnswers.filter((a) => a.studentId === student.id);
  const answerIndexByQId = new Map(myAnswers.map((a) => [a.questionId, a.answerIndex]));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <SectionTitle
        icon={<FileText size={18} />}
        title={student.name}
        sub={`${student.variant} Вариант · ${student.score}% оноо`}
      />

      <div className="space-y-3">
        {questions.map((q) => {
          const stat   = qStats.find((s) => s.q.endsWith(`-${q.no}`));
          const isHard = stat && stat.wrong >= 5;

          // This student's chosen answer index
          const chosen = answerIndexByQId.get(q.id);

          return (
            <div
              key={q.id}
              className={`rounded-xl p-4 border ${
                isHard ? "bg-red-50/50 border-red-100" : "bg-gray-50/50 border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2">
                  {isHard && (
                    <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                  )}
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

              {/* Attachment */}
              {q.attachmentUrl && (
                <a
                  href={q.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mb-2 text-[11px] text-blue-600 underline"
                >
                  Хавсралт харах
                </a>
              )}

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {q.options.map((opt, idx) => {
                  const isCorrect  = idx === q.correct;
                  const isChosen   = chosen === idx;
                  const noAnswer   = chosen === undefined;

                  let cls = "bg-white text-gray-500 border-gray-200";
                  if (isCorrect && isChosen)  cls = "bg-emerald-100 text-emerald-700 border-emerald-300";
                  else if (isCorrect)         cls = "bg-emerald-50  text-emerald-700 border-emerald-200";
                  else if (isChosen)          cls = "bg-red-100     text-red-700     border-red-300";

                  return (
                    <div
                      key={idx}
                      className={`px-2.5 py-2 rounded-lg text-xs text-center font-semibold border relative ${cls}`}
                    >
                      {opt}
                      {isChosen && !noAnswer && (
                        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 rounded-full bg-white border border-gray-200 text-gray-500">
                          {isCorrect ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {chosen === undefined && (
                <p className="mt-2 text-[10px] text-gray-400 italic">Хариулаагүй</p>
              )}
            </div>
          );
        })}

        {questions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">Асуулт олдсонгүй</p>
        )}
      </div>
    </div>
  );
};
