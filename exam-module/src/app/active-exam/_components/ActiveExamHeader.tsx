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
  return (
    <header className="w-full max-w-7xl flex justify-between items-center mb-8 border-b border-white/10 pb-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          {title}
        </h1>
        <p className="text-xs text-slate-400">
          Сурагч: {studentId} · Шалгалт: {effectiveExamId}
          {examSessionId ? ` · Сесс: ${examSessionId}` : null}
        </p>
        {chosenVariation ? (
          <p className="text-xs text-slate-500 mt-1">
            Хувилбар:{" "}
            <span className="text-slate-300 font-medium">{chosenVariation}</span>
          </p>
        ) : null}
        {session ? (
          <>
            <p className="text-xs text-slate-500 mt-1">
              Эхэлсэн: {new Date(session.startTime).toLocaleString()} — Дуусах:{" "}
              {new Date(session.endTime).toLocaleString()}
            </p>
            <p className="text-xs text-amber-400/90 mt-1 font-medium tabular-nums">
              Үлдсэн хугацаа:{" "}
              {formatCountdown(
                Math.max(0, Date.parse(session.endTime) - now),
              )}
            </p>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {!isCameraReady && (
          <span className="text-xs text-yellow-500 animate-pulse">
            Initializing AI Sensors...
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
            isCameraReady
              ? "bg-red-900/20 border-red-500 text-red-400 animate-pulse"
              : "bg-slate-800 border-slate-700 text-slate-500"
          }`}
        >
          {isCameraReady ? "● LIVE MONITORING" : "OFFLINE"}
        </div>
      </div>
    </header>
  );
}
