import { getDb } from "@/db";
import { examSessions as examSessionsTable } from "@/db/schema";
import { deriveExamSessionStatusFromRowTimes } from "@/lib/exam-session-derived-status";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const updateExamSession: MutationResolvers["updateExamSession"] = async (
  _,
  { id, examId, classId, description, startTime, endTime, status },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    examId?: string;
    classId?: string;
    description?: string;
    startTime?: number;
    endTime?: number;
    status?: string;
  } = {};

  if (examId !== undefined && examId !== null) patch.examId = examId;
  if (classId !== undefined && classId !== null) patch.classId = classId;
  if (description !== undefined && description !== null) patch.description = description;
  if (startTime !== undefined && startTime !== null)
    patch.startTime = new Date(startTime).getTime();
  if (endTime !== undefined && endTime !== null) patch.endTime = new Date(endTime).getTime();
  if (status !== undefined && status !== null) patch.status = status;

  if (Object.keys(patch).length > 0) {
    await db.update(examSessionsTable).set(patch).where(eq(examSessionsTable.id, id));
  }

  const rows = await db
    .select()
    .from(examSessionsTable)
    .where(eq(examSessionsTable.id, id))
    .limit(1);

  if (!rows[0]) throw new Error("Exam session not found");

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

