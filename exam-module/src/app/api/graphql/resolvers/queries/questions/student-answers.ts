import { getDb } from "@/db";
import { studentAnswers as studentAnswersTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { and, eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const studentAnswers: QueryResolvers["studentAnswers"] = async (
  _,
  { studentId, sessionId, examId },
  context,
) => {
  const db = getDb(context.db);

  const conditions = [];
  if (studentId != null && studentId !== "")
    conditions.push(eq(studentAnswersTable.studentId, studentId));
  if (sessionId != null && sessionId !== "")
    conditions.push(eq(studentAnswersTable.sessionId, sessionId));
  if (examId != null && examId !== "")
    conditions.push(eq(studentAnswersTable.examId, examId));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(studentAnswersTable)
          .where(and(...conditions))
      : await db.select().from(studentAnswersTable);

  return rows.map((row) => ({
    id: row.id,
    studentId: row.studentId ?? null,
    sessionId: row.sessionId ?? null,
    examId: row.examId ?? null,
    questionId: row.questionId ?? null,
    answerIndex: row.answerIndex,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  }));
};
