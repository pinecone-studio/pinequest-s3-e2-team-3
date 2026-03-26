"use client";

import { useState } from "react";

import { Question } from "@/app/materials/_components/mock";
import QuestionForm from "@/app/materials/_components/questionForm";

export default function CreateMaterialPage() {
 
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "", answers: ["", "", ""], score: 2 },
  ]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), text: "", answers: ["", "", ""], score: 2 },
    ]);
  };

  const updateQuestion = (id: number, updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const deleteQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="p-8 sm:p-10 flex gap-6">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Шалгалтын материал үүсгэх</h1>
        <p className="text-sm text-gray-500 mb-6">Шалгалтын материал болон хувилбар гаргах</p>

        {/* Title */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Шалгалтын материал нэр оруулна уу</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Жишээ нь : 12-р анги Бүлэг сэдвийн шалгалт"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-700"
          />
        </div>

        {/* Questions */}
        {questions.map((q) => (
          <QuestionForm
            key={q.id}
            question={q}
            onChange={(updated) => updateQuestion(q.id, updated)}
            onDelete={() => deleteQuestion(q.id)}
          />
        ))}
      </div>

      {/* Right sidebar */}
      <div className="w-48 shrink-0">
        <div className="flex flex-col gap-2 sticky top-8">
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Асуулт нэмэх
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Зураг оруулах
          </button>
          <button
            onClick={() => questions.length > 1 && deleteQuestion(questions[questions.length - 1].id)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Асуултыг устгах
          </button>
        </div>
      </div>
    </div>
  );
}
