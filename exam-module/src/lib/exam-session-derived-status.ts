/**
 * Maps stored session window (epoch ms) to a lifecycle label for API clients.
 * DB row may stay `scheduled`; GraphQL `status` reflects wall-clock position.
 */
export type DerivedExamSessionStatus = "scheduled" | "ongoing" | "finished";

export function examSessionEpochToMs(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  return n > 1e12 ? n : n * 1000;
}

export function deriveExamSessionStatusFromEpoch(
  startMs: number,
  endMs: number,
  nowMs: number = Date.now(),
): DerivedExamSessionStatus {
  if (nowMs < startMs) return "scheduled";
  if (nowMs > endMs) return "finished";
  return "ongoing";
}

export function deriveExamSessionStatusFromRowTimes(
  startTime: unknown,
  endTime: unknown,
  nowMs: number = Date.now(),
): DerivedExamSessionStatus {
  const start = examSessionEpochToMs(startTime);
  const end = examSessionEpochToMs(endTime);
  return deriveExamSessionStatusFromEpoch(start, end, nowMs);
}
