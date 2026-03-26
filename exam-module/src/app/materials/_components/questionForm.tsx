"use client";

import { Question } from "./mock";

interface QuestionFormProps {
  question: Question;
  onChange: (updated: Question) => void;
  onDelete: () => void;
}

export default function QuestionForm({ question, onChange, onDelete }: QuestionFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <input
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Асуултаа оруулна уу"
          className="flex-1 border-b border-gray-200 outline-none text-sm pb-2 text-gray-900 bg-transparent mr-4"
        />
        <span className="text-sm text-gray-500 whitespace-nowrap">Оноо : {question.score}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {question.answers.map((ans, i) => (
          <input
            key={i}
            value={ans}
            onChange={(e) => {
              const newAnswers = [...question.answers];
              newAnswers[i] = e.target.value;
              onChange({ ...question, answers: newAnswers });
            }}
            placeholder={`Хариулт ${i + 1}`}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-700 min-w-[120px]"
          />
        ))}
        <button
          onClick={() => onChange({ ...question, answers: [...question.answers, ""] })}
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
