"use client";

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
  examTitle?:     string;
  classInfo?:     string;
}

export const QuestionDetail = ({
  student,
  questions,
  qStats,
  studentAnswers,
  examTitle = "Явцын шалгалт",
  classInfo = "",
}: QuestionDetailProps) => {
  const myAnswers        = studentAnswers.filter((a) => a.studentId === student.id);
  const answerByQId      = new Map(myAnswers.map((a) => [a.questionId, a.answerIndex]));
  const correctCount     = questions.filter((q) => answerByQId.get(q.id) === q.correct).length;
  const totalScore       = questions.reduce((s, q) => s + q.score, 0);
  const earnedScore      = questions.reduce((s, q) => {
    return answerByQId.get(q.id) === q.correct ? s + q.score : s;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900 text-[15px]">{student.name}</span>
            <span className="text-sm text-gray-400">{student.variant} Вариант</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              Авсан дүн :{" "}
              <span className="font-bold text-gray-900">
                {earnedScore}/{totalScore}
              </span>
            </span>
            <span className="font-bold text-gray-900">{student.score}%</span>
          </div>
        </div>
      </div>

      {/* Scrollable questions */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {questions.map((q) => {
          const chosen   = answerByQId.get(q.id);
          const stat     = qStats.find((s) => s.q.endsWith(`-${q.no}`));
          const isHard   = stat && stat.wrong >= 5;

          return (
            <div key={q.id}>
              {/* Question text */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  {q.no}. {q.text}
                </p>
                <span className="text-xs text-gray-400 shrink-0">{q.score} оноо</span>
              </div>

              {/* Answer options — 4 in a row */}
              <div className="grid grid-cols-4 gap-2">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correct;
                  const isChosen  = chosen === idx;

                  let cls = "border border-gray-200 text-gray-600 bg-white";
                  if (isChosen && isCorrect)
                    cls = "border border-emerald-400 text-emerald-700 bg-emerald-50";
                  else if (isChosen && !isCorrect)
                    cls = "border border-red-400 text-red-600 bg-red-50";
                  else if (!isChosen && isCorrect)
                    cls = "border border-emerald-300 text-emerald-700 bg-white";

                  return (
                    <div
                      key={idx}
                      className={`rounded-lg px-3 py-2 text-xs font-medium text-center ${cls}`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </div>
                  );
                })}
              </div>

              {chosen === undefined && (
                <p className="text-[11px] text-gray-400 italic mt-1">Хариулаагүй</p>
              )}
            </div>
          );
        })}

        {questions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">Асуулт олдсонгүй</p>
        )}
      </div>
    </div>
  );
};
