import { getDb } from "@/db";
import { proctorLogs as proctorLogsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const createProctorLog: MutationResolvers["createProctorLog"] = async (
  _parent,
  { examId, studentId, eventType },
  context,
) => {
  const db = getDb(context.db);

  const values: {
    examId?: string | null;
    studentId: string;
    eventType: string;
  } = {
    studentId,
    eventType,
    examId,
  };

  const result = await db.insert(proctorLogsTable).values(values).returning();

  const created = result[0];

  return {
    id: created.id,
    examId: created.examId,
    studentId: created.studentId,
    eventType: created.eventType,
    createdAt: epochToISOString(created.createdAt),
    updatedAt: epochToISOString(created.updatedAt),
  };
};
