import { getDb } from "@/db";
import { examSessions as examSessionsTable } from "@/db/schema";
import { deriveExamSessionStatusFromRowTimes } from "@/lib/exam-session-derived-status";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const examSession: QueryResolvers["examSession"] = async (
  _,
  { id },
  context,
) => {
  const db = getDb(context.db);

  const rows = await db
    .select()
    .from(examSessionsTable)
    .where(eq(examSessionsTable.id, id))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];

  return {
    id: row.id,
    examId: row.examId,
    classId: row.classId,
    description: row.description,
    startTime: epochToISOString(row.startTime),
    endTime: epochToISOString(row.endTime),
    status: deriveExamSessionStatusFromRowTimes(row.startTime, row.endTime),
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
};

