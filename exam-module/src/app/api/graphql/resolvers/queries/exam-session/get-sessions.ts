import { getDb } from "@/db";
import { examSessions as examSessionsTable } from "@/db/schema";
import { deriveExamSessionStatusFromRowTimes } from "@/lib/exam-session-derived-status";
import { QueryResolvers } from "@/gql/graphql";

const epochToMs = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  return n > 1e12 ? n : n * 1000;
};

const epochToISOString = (value: unknown) => {
  return new Date(epochToMs(value)).toISOString();
};

export const getActiveSessions: QueryResolvers["getActiveSessions"] = async (
  _,
  __,
  context,
) => {
  const db = getDb(context.db);

  const rows = await db.select().from(examSessionsTable);

  return (
    rows
      // .filter((row) => {
      //   const start = epochToMs(row.startTime);
      //   const end = epochToMs(row.endTime);
      //   const now = Date.now();
      //   return now >= start && now <= end && row.status === "scheduled";
      // })
      .map((row) => ({
        id: row.id,
        examId: row.examId,
        classId: row.classId,
        description: row.description,
        startTime: epochToISOString(row.startTime),
        endTime: epochToISOString(row.endTime),
        status: deriveExamSessionStatusFromRowTimes(row.startTime, row.endTime),
        createdAt: epochToISOString(row.createdAt),
        updatedAt: epochToISOString(row.updatedAt),
      }))
  );
};
