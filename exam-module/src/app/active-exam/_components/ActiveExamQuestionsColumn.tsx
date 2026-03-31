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
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/30">
        <iframe
          src={url}
          title="Асуултын хавсралт"
          className="h-[min(70vh,560px)] w-full border-0 bg-slate-900/50"
        />
        <div className="border-t border-slate-700/80 px-3 py-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            Шинэ цонхонд нээх
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* External exam attachments (S3 etc.); sizes unknown — native img scales with object-contain */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Асуултын хавсралт"
        className="mx-auto max-h-[min(70vh,560px)] w-full max-w-full rounded-2xl border border-slate-700/80 object-contain"
        loading="lazy"
        onError={() => setUseIframe(true)}
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs text-slate-500 hover:text-slate-400 underline underline-offset-2"
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
    <div className="lg:col-span-3 space-y-6">
      {displayQuestions.length === 0 ? (
        <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 text-center text-slate-400">
          Энэ шалгалтад сонгогдох асуулт байхгүй байна.
        </div>
      ) : (
        displayQuestions.map((q, i) => {
          const isUnanswered =
            showUnansweredWarning && choices[q.id] === undefined;
          return (
            <div
              key={q.id}
              className={`p-8 bg-slate-900/50 rounded-3xl border backdrop-blur-sm ${
                isUnanswered
                  ? "border-amber-500/60 ring-1 ring-amber-500/30"
                  : "border-white/5"
              }`}
            >
              <div className="flex items-baseline justify-between gap-4 mb-4">
                <label className="block text-slate-400 text-sm uppercase tracking-widest font-semibold">
                  Асуулт {i + 1}
                </label>
                {isUnanswered && (
                  <span className="text-xs text-amber-400 font-medium">
                    Хариулаагүй
                  </span>
                )}
              </div>
              {q.attachmentUrl ? (
                <QuestionAttachmentInline url={q.attachmentUrl} />
              ) : null}
              <p className="text-lg leading-relaxed mb-6 whitespace-pre-wrap text-slate-100">
                {q.question}
              </p>
              <ul className="space-y-3">
                {q.answers.map((label, idx) => {
                  const selected = choices[q.id] === idx;
                  return (
                    <li key={`${q.id}-${idx}`}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                          selected
                            ? "border-blue-500 bg-blue-950/40"
                            : "border-slate-700 bg-slate-800/40 hover:border-slate-500"
                        } ${inputsDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          className="mt-1"
                          checked={selected}
                          disabled={inputsDisabled}
                          onChange={() => onChoiceChange(q.id, idx)}
                        />
                        <span className="text-slate-200">{label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}

      {displayQuestions.length > 0 && !submitted ? (
        <div className="space-y-3">
          {showUnansweredWarning && !allAnswered && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-300">
              Бүх асуултад хариулна уу. ({unansweredCount} асуулт хариулаагүй
              байна)
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={inputsDisabled}
              onClick={handleSubmitClick}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitMutationLoading ? "Илгээж байна…" : "Хариу илгээх"}
            </button>
            {sessionLink && hasSession ? (
              <p className="text-xs text-slate-500 self-center">
                Хугацаа дуусахад хариу автоматаар илгээгдэнэ.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
