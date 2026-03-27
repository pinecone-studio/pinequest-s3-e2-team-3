import { getDb } from "@/db";
import { questions as questionsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const examQuestionsForTaker: QueryResolvers["examQuestionsForTaker"] =
  async (_, { examId }, context) => {
    const db = getDb(context.db);

    const rows = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.examId, examId));

    return rows.map((row) => ({
      id: row.id,
      question: row.question,
      answers: row.answers,
      variation: row.variation,
    }));
  };
