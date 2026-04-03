import { formatCountdown } from "./active-exam-utils";

type SessionLike = {
  startTime: string;
  endTime: string;
};

type ActiveExamHeaderProps = {
  title: string;
  studentId: string;
  effectiveExamId: string;
  examSessionId: string;
  chosenVariation: string | null;
  session: SessionLike | null;
  now: number;
  isCameraReady: boolean;
};

export function ActiveExamHeader({
  title,
  studentId,
  effectiveExamId,
  examSessionId,
  chosenVariation,
  session,
  now,
  isCameraReady,
}: ActiveExamHeaderProps) {
  const timeRemaining = session
    ? Math.max(0, Date.parse(session.endTime) - now)
    : null;

  // Format as MM:SS минут for the pill display (matching screenshot "00:30 минут")
  const timerLabel =
    timeRemaining !== null ? formatCountdown(timeRemaining) + " минут" : null;

  return (
    <header className="w-full max-w-7xl flex justify-between items-start mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Шалгалтын сэдэв : {title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Сурагч: {studentId}
          {chosenVariation ? ` · Хувилбар: ${chosenVariation}` : null}
          {examSessionId ? ` · Сесс: ${examSessionId}` : null}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 mt-1">
        {!isCameraReady && (
          <span className="text-xs text-amber-500 animate-pulse font-medium">
            Initializing AI Sensors...
          </span>
        )}

        {timerLabel && (
          <div className="rounded-full bg-indigo-900 px-5 py-2 text-sm font-semibold text-white tabular-nums">
            {timerLabel}
          </div>
        )}

        {!timerLabel && (
          <div
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
              isCameraReady
                ? "bg-red-50 border-red-300 text-red-500"
                : "bg-slate-100 border-slate-300 text-slate-400"
            }`}
          >
            {isCameraReady ? "● LIVE" : "OFFLINE"}
          </div>
        )}
      </div>
    </header>
  );
}
