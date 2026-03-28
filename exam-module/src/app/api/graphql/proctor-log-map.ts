import { examSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/db/schema";

type Db = DrizzleD1Database<typeof schema>;

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export async function resolveExamIdForSession(
  db: Db,
  sessionId: string | null,
): Promise<string | null> {
  if (!sessionId) return null;
  const rows = await db
    .select({ examId: examSessions.examId })
    .from(examSessions)
    .where(eq(examSessions.id, sessionId))
    .limit(1);
  return rows[0]?.examId ?? null;
}

export function mapJoinedProctorRowToGraphQL(row: {
  id: string;
  sessionId: string | null;
  studentId: string | null;
  eventType: string;
  createdAt: number;
  updatedAt: number;
  examIdFromSession: string | null;
}) {
  return {
    id: row.id,
    sessionId: row.sessionId,
    examId: row.examIdFromSession,
    studentId: row.studentId,
    eventType: row.eventType,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
}
