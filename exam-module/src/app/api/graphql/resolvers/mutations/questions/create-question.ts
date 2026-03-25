import { getDb } from "@/db";
import { questions as questionsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const createQuestion: MutationResolvers["createQuestion"] = async (
  _,
  { examId, question, answers, correctIndex, variation },
  context,
) => {
  const db = getDb(context.db);

  const values: {
    examId?: string | null;
    question: string;
    answers: string[];
    correctIndex: number;
    variation?: string;
  } = {
    examId,
    question,
    answers,
    correctIndex,
  };

  if (variation !== undefined && variation !== null) values.variation = variation;

  const result = await db
    .insert(questionsTable)
    .values(values)
    .returning();

  const created = result[0];
  return {
    id: created.id,
    examId: created.examId,
    question: created.question,
    answers: created.answers,
    correctIndex: created.correctIndex,
    variation: created.variation,
    createdAt: epochToISOString(created.createdAt),
    updatedAt: epochToISOString(created.updatedAt),
  };
};

