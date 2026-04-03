"use client";

import { useState, useMemo } from "react";

type DisplayQuestion = {
  id: string;
  question: string;
  answers: Array<string>;
  variation: string;
  attachmentUrl?: string | null;
};

function isPdfUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".pdf");
  } catch {
    return /\.pdf(\?|#|$)/i.test(url);
  }
}

function QuestionAttachmentInline({ url }: { url: string }) {
  const startAsPdf = isPdfUrl(url);
  const [useIframe, setUseIframe] = useState(startAsPdf);

  if (useIframe) {
    return (
      <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
        <iframe
          src={url}
          title="Асуултын хавсралт"
          className="h-[min(60vh,480px)] w-full border-0 bg-slate-50"
        />
        <div className="border-t border-slate-200 px-3 py-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-500 underline underline-offset-2"
          >
            Шинэ цонхонд нээх
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Асуултын хавсралт"
        className="max-h-[min(60vh,480px)] w-auto max-w-full rounded-xl border border-slate-200 object-contain"
        loading="lazy"
        onError={() => setUseIframe(true)}
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
      >
        Шинэ цонхонд нээх
      </a>
    </div>
  );
}

type ActiveExamQuestionsColumnProps = {
  displayQuestions: DisplayQuestion[];
  choices: Record<string, number>;
  onChoiceChange: (questionId: string, answerIndex: number) => void;
  inputsDisabled: boolean;
  submitted: boolean;
  submitMutationLoading: boolean;
  onSubmit: () => void;
  sessionLink: boolean;
  hasSession: boolean;
};

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F"];

type AnswerStatusGridProps = {
  displayQuestions: DisplayQuestion[];
  choices: Record<string, number>;
  showUnansweredWarning: boolean;
};

function AnswerStatusGrid({
  displayQuestions,
  choices,
  showUnansweredWarning,
}: AnswerStatusGridProps) {
  return (
    <div className="w-72 shrink-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Хариултын төлөв
        </h3>
        <div className="grid grid-cols-5 gap-x-2 gap-y-3">
          {displayQuestions.map((q, i) => {
            const answered = choices[q.id] !== undefined;
            const isUnanswered = showUnansweredWarning && !answered;
            return (
              <div key={q.id} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {i + 1}
                </span>
                <div
                  className={`h-6 w-6 rounded-full border-2 transition-colors ${
                    answered
                      ? "border-indigo-800 bg-indigo-800"
                      : isUnanswered
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-300 bg-white"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-indigo-800" />
            <span>Хийсэн</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-slate-300 bg-white" />
            <span>Хийгээгүй</span>
          </div>
          </div>
        </div>
      </div>
    );
  }
  
  export function ActiveExamQuestionsColumn({
    displayQuestions,
    choices,
    onChoiceChange,
    inputsDisabled,
    submitted,
    submitMutationLoading,
    onSubmit,
    sessionLink,
    hasSession,
  }: ActiveExamQuestionsColumnProps) {
    const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  
    const unansweredCount = useMemo(
      () => displayQuestions.filter((q) => choices[q.id] === undefined).length,
      [displayQuestions, choices],
    );
  
    const allAnswered = unansweredCount === 0 && displayQuestions.length > 0;
  
    const handleSubmitClick = () => {
      if (!allAnswered) {
        setShowUnansweredWarning(true);
        return;
      }
      setShowUnansweredWarning(false);
      onSubmit();
    };
  
    return (
    <div className="flex gap-6 w-full items-start">
      {/* Main questions area */}
      <div className="flex-1 space-y-4 min-w-0">
        {displayQuestions.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 shadow-sm">
            Энэ шалгалтад сонгогдох асуулт байхгүй байна.
          </div>
        ) : (
          displayQuestions.map((q, i) => {
            const isUnanswered =
              showUnansweredWarning && choices[q.id] === undefined;
            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border shadow-sm transition-colors ${
                  isUnanswered
                    ? "border-amber-400"
                    : "border-slate-200"
                }`}
              >
                {/* Question header */}
                <div className="flex items-baseline justify-between gap-4 px-5 pt-4 pb-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800 leading-relaxed flex-1">
                    <span className="text-slate-500 mr-2">{i + 1}.</span>
                    {q.question}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400 font-medium">
                    Оноо : 2
                  </span>
                </div>

                {/* Attachment */}
                {q.attachmentUrl ? (
                  <div className="px-5 pt-3">
                    <QuestionAttachmentInline url={q.attachmentUrl} />
                  </div>
                ) : null}

                {/* Answer options — horizontal row like the screenshot */}
                <div className="px-5 py-4">
                  <div
                    className={`grid gap-3 ${
                      q.answers.length <= 4
                        ? "grid-cols-2 sm:grid-cols-4"
                        : "grid-cols-2"
                    }`}
                  >
                    {q.answers.map((label, idx) => {
                      const selected = choices[q.id] === idx;
                      const letterLabel = ANSWER_LABELS[idx] ?? String(idx + 1);
                      return (
                        <label
                          key={`${q.id}-${idx}`}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-colors select-none ${
                            selected
                              ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                          } ${inputsDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="sr-only"
                            checked={selected}
                            disabled={inputsDisabled}
                            onChange={() => onChoiceChange(q.id, idx)}
                          />
                          {/* Custom radio circle */}
                          <span
                            className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selected
                                ? "border-indigo-700 bg-indigo-700"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>
                          <span className="font-medium text-xs text-slate-400 shrink-0">
                            {letterLabel}.
                          </span>
                          <span className="leading-snug">{label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {isUnanswered && (
                    <p className="mt-2 text-xs text-amber-500 font-medium">
                      Хариулаагүй
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Submit area */}
        {displayQuestions.length > 0 && !submitted ? (
          <div className="space-y-2 pt-1 pb-6">
            {showUnansweredWarning && !allAnswered && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Бүх асуултад хариулна уу. ({unansweredCount} асуулт хариулаагүй
                байна)
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={inputsDisabled}
                onClick={handleSubmitClick}
                className="rounded-full bg-indigo-900 px-7 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitMutationLoading ? "Илгээж байна…" : "Хариу илгээх"}
              </button>
              {sessionLink && hasSession ? (
                <p className="text-xs text-slate-400">
                  Хугацаа дуусахад хариу автоматаар илгээгдэнэ.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Answer status sidebar */}
      {displayQuestions.length > 0 && (
        <div className="hidden lg:block">
          <AnswerStatusGrid
            displayQuestions={displayQuestions}
            choices={choices}
            showUnansweredWarning={showUnansweredWarning}
          />
        </div>
      )}
    </div>
  );
}
