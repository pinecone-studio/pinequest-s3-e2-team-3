type DisplayQuestion = {
  id: string;
  question: string;
  answers: Array<string>;
  variation: string;
};

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
  return (
    <div className="lg:col-span-3 space-y-6">
      {displayQuestions.length === 0 ? (
        <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 text-center text-slate-400">
          Энэ шалгалтад сонгогдох асуулт байхгүй байна.
        </div>
      ) : (
        displayQuestions.map((q, i) => (
          <div
            key={q.id}
            className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm"
          >
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <label className="block text-slate-400 text-sm uppercase tracking-widest font-semibold">
                Асуулт {i + 1}
              </label>
            </div>
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
        ))
      )}

      {displayQuestions.length > 0 && !submitted ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={inputsDisabled}
            onClick={() => onSubmit()}
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
      ) : null}
    </div>
  );
}
