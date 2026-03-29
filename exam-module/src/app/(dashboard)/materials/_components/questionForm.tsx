"use client";

import { Question } from "./mock";

interface QuestionFormProps {
  question: Question;
  onChange: (updated: Question) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showVariation?: boolean;
}

export default function QuestionForm({
  question,
  onChange,
  onDelete,
  onDuplicate,
  showVariation,
}: QuestionFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4 gap-2">
        <input
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Асуултаа оруулна уу"
          className="flex-1 border-b border-gray-200 outline-none text-sm pb-2 text-gray-900 bg-transparent min-w-0"
        />
        <div className="flex items-center gap-2 shrink-0">
          {showVariation && question.variation ? (
            <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
              {question.variation}
            </span>
          ) : null}
          {onDuplicate ? (
            <button
              type="button"
              onClick={onDuplicate}
              className="text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-2 py-1 hover:bg-gray-50"
            >
              Хувилбар хуулах
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-red-600 border border-red-100 rounded-md px-2 py-1 hover:bg-red-50"
            >
              Устгах
            </button>
          ) : null}
          <span className="text-sm text-gray-500 whitespace-nowrap">Оноо : {question.score}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-2">Зөв хариултыг сонгоно уу</p>
      <div className="flex flex-wrap gap-2 items-start">
        {question.answers.map((ans, i) => (
          <label
            key={i}
            className={`flex items-center gap-2 border rounded-lg px-2 py-2 text-sm text-gray-700 min-w-[120px] cursor-pointer ${
              question.correctIndex === i ? "border-blue-400 bg-blue-50/50" : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={question.correctIndex === i}
              onChange={() => onChange({ ...question, correctIndex: i })}
              className="shrink-0"
            />
            <input
              value={ans}
              onChange={(e) => {
                const newAnswers = [...question.answers];
                newAnswers[i] = e.target.value;
                onChange({ ...question, answers: newAnswers });
              }}
              placeholder={`Хариулт ${i + 1}`}
              className="flex-1 min-w-0 border-0 outline-none bg-transparent text-gray-700"
            />
          </label>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...question,
              answers: [...question.answers, ""],
              correctIndex: question.answers.length === 0 ? 0 : question.correctIndex,
            })
          }
          className="border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center gap-1 hover:bg-gray-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Хариулт нэмэх
        </button>
      </div>
    </div>
  );
}
