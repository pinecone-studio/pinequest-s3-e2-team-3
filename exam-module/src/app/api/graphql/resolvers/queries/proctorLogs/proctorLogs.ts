import { getDb } from "@/db";
import { proctorLogs as proctorLogsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { and, eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const proctorLogs: QueryResolvers["proctorLogs"] = async (
  _parent,
  { examId, studentId },
  context,
) => {
  const db = getDb(context.db);

  const conditions = [];
  if (examId) conditions.push(eq(proctorLogsTable.examId, examId));
  if (studentId) conditions.push(eq(proctorLogsTable.studentId, studentId));

  const logs =
    conditions.length > 0
      ? await db
          .select()
          .from(proctorLogsTable)
          .where(and(...conditions))
      : await db.select().from(proctorLogsTable);

  return logs.map((log) => ({
    id: log.id,
    examId: log.examId,
    studentId: log.studentId,
    eventType: log.eventType,
    createdAt: epochToISOString(log.createdAt),
    updatedAt: epochToISOString(log.updatedAt),
  }));
};

