import { getDb } from "@/db";
import { proctorLogs as proctorLogsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const proctorLog: QueryResolvers["proctorLog"] = async (
  _parent,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const row = await db
    .select()
    .from(proctorLogsTable)
    .where(eq(proctorLogsTable.id, id))
    .limit(1);

  if (!row[0]) return null;

  const log = row[0];
  return {
    id: log.id,
    examId: log.examId,
    studentId: log.studentId,
    eventType: log.eventType,
    createdAt: epochToISOString(log.createdAt),
    updatedAt: epochToISOString(log.updatedAt),
  };
};

