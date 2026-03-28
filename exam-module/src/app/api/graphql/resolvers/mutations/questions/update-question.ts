import { getDb } from "@/db";
import { questions as questionsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const updateQuestion: MutationResolvers["updateQuestion"] = async (
  _,
  { id, examId, question, answers, correctIndex, variation },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    examId?: string;
    question?: string;
    answers?: string[];
    correctIndex?: number;
    variation?: string;
  } = {};

  if (examId !== undefined && examId !== null) patch.examId = examId;
  if (question !== undefined && question !== null) patch.question = question;
  if (answers !== undefined && answers !== null) patch.answers = answers;
  if (correctIndex !== undefined && correctIndex !== null) {
    patch.correctIndex = correctIndex;
  }
  if (variation !== undefined && variation !== null) patch.variation = variation;

  if (Object.keys(patch).length > 0) {
    await db.update(questionsTable).set(patch).where(eq(questionsTable.id, id));
  }

  const rows = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.id, id))
    .limit(1);

  if (!rows[0]) throw new Error("Question not found");
  const row = rows[0];

  return {
    id: row.id,
    examId: row.examId,
    question: row.question,
    answers: row.answers,
    correctIndex: row.correctIndex,
    variation: row.variation,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
};

