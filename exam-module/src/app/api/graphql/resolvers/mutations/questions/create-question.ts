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

  const result = await db
    .insert(questionsTable)
    .values({
      examId,
      question,
      answers,
      correctIndex,
      variation: variation ?? "A",
    })
    .returning();

  const created = result[0];
  if (!created) throw new Error("Question not created");
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
