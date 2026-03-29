"use client";

import { StudentDetail } from "./studentmock";

interface StudentDetailPanelProps {
  detail: StudentDetail;
  examTitle: string;
  classInfo: string;
}

export default function StudentDetailPanel({
  detail,
  examTitle,
  classInfo,
}: StudentDetailPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg text-gray-900">{examTitle}</h3>
        <p className="text-sm text-gray-500">{classInfo}</p>
      </div>

      {/* Student info row */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <span className="font-semibold text-gray-900">{detail.name}</span>
        <span className="text-sm text-gray-500">{detail.variant}</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Авсан дүн :{" "}
            <span className="font-semibold text-gray-900">
              {detail.correct}/{detail.total}
            </span>
          </span>
          <span className="font-semibold text-gray-900">{detail.percent}</span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {detail.questions.map((q) => (
          <div key={q.id} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-800 font-medium whitespace-pre-line">
                {q.id}. {q.text}
              </p>
              <span className="text-sm text-gray-500 shrink-0">
                {q.score} оноо
              </span>
            </div>

            {q.image && (
              <div className="w-48 h-32 bg-yellow-50 border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={q.image}
                  alt="question"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                let style =
                  "border border-gray-200 text-gray-700 bg-white";
                if (opt.isSelected && opt.isCorrect)
                  style = "border border-green-500 text-green-700 bg-green-50";
                else if (opt.isSelected && !opt.isCorrect)
                  style = "border border-red-400 text-red-600 bg-red-50";
                else if (!opt.isSelected && opt.isCorrect)
                  style = "border border-green-500 text-green-700 bg-white";

                return (
                  <div
                    key={opt.label}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${style}`}
                  >
                    {opt.label}. {opt.text}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
