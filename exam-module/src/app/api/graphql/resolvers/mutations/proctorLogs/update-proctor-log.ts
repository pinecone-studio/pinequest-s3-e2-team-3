import { getDb } from "@/db";
import { proctorLogs as proctorLogsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const updateProctorLog: MutationResolvers["updateProctorLog"] = async (
  _parent,
  { id, examId, studentId, eventType },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    examId?: string;
    studentId?: string;
    eventType?: string;
  } = {};

  // examId is optional in GraphQL and nullable in DB
  if (examId !== undefined && examId !== null) patch.examId = examId;
  if (studentId !== undefined && studentId !== null)
    patch.studentId = studentId;
  if (eventType !== undefined && eventType !== null)
    patch.eventType = eventType;

  if (Object.keys(patch).length > 0) {
    await db
      .update(proctorLogsTable)
      .set(patch)
      .where(eq(proctorLogsTable.id, id));
  }

  const updated = await db
    .select()
    .from(proctorLogsTable)
    .where(eq(proctorLogsTable.id, id))
    .limit(1);

  if (!updated[0]) {
    throw new Error("Proctor log not found");
  }

  const row = updated[0];
  return {
    id: row.id,
    examId: row.examId,
    studentId: row.studentId,
    eventType: row.eventType,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
};
