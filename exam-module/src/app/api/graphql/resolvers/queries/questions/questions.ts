import { getDb } from "@/db";
import { questions as questionsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const questions: QueryResolvers["questions"] = async (
  _,
  { examId },
  context,
) => {
  const db = getDb(context.db);

  const rows =
    examId !== undefined && examId !== null
      ? await db
          .select()
          .from(questionsTable)
          .where(eq(questionsTable.examId, examId))
      : await db.select().from(questionsTable);

  return rows.map((row) => ({
    id: row.id,
    examId: row.examId,
    question: row.question,
    answers: row.answers,
    correctIndex: row.correctIndex,
    variation: row.variation,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  }));
};

