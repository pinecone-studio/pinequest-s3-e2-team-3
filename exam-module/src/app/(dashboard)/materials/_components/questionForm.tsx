
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Question } from "./mock";
import { ImageIcon, Trash2, Plus, Pencil, X } from "lucide-react";

interface QuestionFormProps {
  question: Question;
  onChange: (updated: Question) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  addQuestion?:()=>void;
  showVariation?: boolean;
  index: number;
}

const ACCEPT =
  "application/pdf,.pdf,image/jpeg,image/jpg,image/png,image/gif,image/webp";

function isImageLike(nameOrKey: string): boolean {
  return /\.(jpe?g|png|gif|webp)$/i.test(nameOrKey);
}

const MATH_SYMBOLS = [
  "x",
  "÷",
  "|x|",
  "□ⁿ",
  "√□",
  "ⁿ√□",
  "⅟□",
  "□/□",
  "eⁿ",
  "ln",
  "π",
  "log□",
  "lg",
  "□!",
  "sin⁻¹",
  "cos⁻¹",
  "tan⁻¹",
  "∫",
  "(□)",
  ">",
  "≥",
  "<",
  "≤",
  "≠",
  "x",
  "y",
  "z",
];

export default function QuestionForm({
  question,
  onChange,
  onDelete,
  onDuplicate,
  addQuestion,
  index,
}: QuestionFormProps) {
  const [isMathActive, setIsMathActive] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const blobPreviewUrl = useMemo(() => {
    if (!question.attachmentFile) return null;
    return URL.createObjectURL(question.attachmentFile);
  }, [question.attachmentFile]);

  useEffect(() => {
    return () => {
      if (blobPreviewUrl) URL.revokeObjectURL(blobPreviewUrl);
    };
  }, [blobPreviewUrl]);

  const serverPreviewUrl = useMemo(() => {
    if (question.attachmentFile || !question.attachmentKey) return null;
    if (typeof window === "undefined") return null;
    return `${window.location.origin}/api/exam-file?k=${encodeURIComponent(question.attachmentKey)}`;
  }, [question.attachmentFile, question.attachmentKey]);

  const displayUrl = blobPreviewUrl ?? serverPreviewUrl;

  const isImagePreview = useMemo(() => {
    if (question.attachmentFile) {
      const t = question.attachmentFile.type.toLowerCase();
      if (t.startsWith("image/")) return true;
      return isImageLike(question.attachmentFile.name);
    }
    if (question.attachmentKey) return isImageLike(question.attachmentKey);
    return false;
  }, [question.attachmentFile, question.attachmentKey]);

  const isPdfPreview = useMemo(() => {
    if (question.attachmentFile) {
      const n = question.attachmentFile.name.toLowerCase();
      const t = question.attachmentFile.type.toLowerCase();
      return t.includes("pdf") || n.endsWith(".pdf");
    }
    if (question.attachmentKey)
      return question.attachmentKey.toLowerCase().endsWith(".pdf");
    return false;
  }, [question.attachmentFile, question.attachmentKey]);

  const fileLabel = question.attachmentFile?.name ?? null;
  return (
    <div className="bg-[#F8F9FD] border border-gray-100 rounded-[32px] p-8 mb-6 relative shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200/60 pb-5">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-gray-900 font-bold text-xl">
            <span className="text-gray-900 font-bold text-xl">{index}.</span>
          </span>
          <div className="relative flex-1 group max-w-6xl">
            <input
              value={question.text}
              onChange={(e) => onChange({ ...question, text: e.target.value })}
              placeholder="Асуултаа оруулна уу"
              className="w-full bg-transparent outline-none text-gray-800 text-lg font-medium placeholder:text-gray-400 border-b border-transparent focus:border-indigo-400 pb-1 transition-all"
            />
            <Pencil className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-gray-600" />
          </div>
        </div>
        <div className="flex items-center gap-6 ml-4">
          <span className="text-gray-500 font-semibold text-base whitespace-nowrap">
            Оноо : {question.score}
          </span>
        </div>
      </div>

      {displayUrl && (
        <div className="mb-6 relative inline-block group">
          {isImagePreview ? (
            <div className="rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white max-w-sm">
              <Image
                src={displayUrl}
                alt="preview"
                width={384}
                height={256}
                className="max-h-64 w-full object-contain"
                unoptimized
              />
            </div>
          ) : isPdfPreview ? (
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-red-50 p-2 rounded-lg text-red-600 font-bold text-xs">
                PDF
              </div>
              <span className="text-sm text-gray-600 truncate max-w-[200px]">
                {fileLabel || "Хадгалагдсан файл"}
              </span>
            </div>
          ) : null}
          <button
            onClick={() =>
              onChange({
                ...question,
                attachmentFile: null,
                attachmentKey: null,
              })
            }
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {question.answers.map((ans, i) => {
          const label = String.fromCharCode(65 + i);
          const isSelected = question.correctIndex === i;

          return (
            <div
              key={i}
              onClick={() => onChange({ ...question, correctIndex: i })}
              className={`flex items-center justify-between p-4 px-6 rounded-full border-2 transition-all cursor-pointer bg-white group ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/30"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
             
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <span
                  className={`font-bold text-base transition-colors ${isSelected ? "text-indigo-600" : "text-gray-400"}`}
                >
                  {label}.
                </span>
                <input
                  value={ans}
                  onChange={(e) => {
                    const newAnswers = [...question.answers];
                    newAnswers[i] = e.target.value;
                    onChange({ ...question, answers: newAnswers });
                  }}
                  placeholder="Хариулт"
                  className="bg-transparent outline-none text-gray-700 text-base w-full font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-900"
                    : "border-gray-300"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in-50" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <button
          type="button"
          onClick={() =>
            onChange({ ...question, answers: [...question.answers, ""] })
          }
          className="flex items-center self-start gap-2 px-8 py-3.5 rounded-full border border-gray-200 bg-white text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" /> Хариулт нэмэх
        </button>

        {isMathActive && (
          <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-[repeat(13,minmax(0,1fr))] gap-2 p-3 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            {MATH_SYMBOLS.map((symbol, idx) => (
              <button
                key={idx}
                className="h-12 flex items-center justify-center bg-indigo-50/50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-lg font-medium transition-all"
                onClick={() =>
                  onChange({ ...question, text: question.text + symbol })
                }
              >
                {symbol}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200/60">
        <div className="flex items-center gap-3">
          <label className="p-3 text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-md rounded-2xl transition-all cursor-pointer">
            <ImageIcon className="w-6 h-6" />
            <input
              type="file"
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                onChange({
                  ...question,
                  attachmentFile: f,
                  attachmentKey: f ? null : question.attachmentKey,
                });
                e.target.value = "";
              }}
            />
          </label>
          <button
            onClick={onDelete}
            className="p-3 text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-2xl transition-all"
          >
            <Trash2 className="w-6 h-6" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-3 text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-md rounded-2xl transition-all"
          >
            <Plus onClick={addQuestion} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-700">Математик</span>
            <Switch
              active={isMathActive}
              onToggle={() => setIsMathActive(!isMathActive)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-700">
              Олон хариулт
            </span>
            <Switch
              active={isMultiSelect}
              onToggle={() => setIsMultiSelect(!isMultiSelect)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Switch({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`w-14 h-7 rounded-full cursor-pointer transition-all relative p-1 ${active ? "bg-indigo-900" : "bg-gray-200"}`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-sm transition-all transform ${active ? "translate-x-7" : "translate-x-0"}`}
      />
    </div>
  );
}
