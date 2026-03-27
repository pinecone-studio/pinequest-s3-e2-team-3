import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  answers as answersTable,
  questions as questionsTable,
} from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

export const submitExamAnswers: MutationResolvers["submitExamAnswers"] = async (
  _,
  { studentId, examId, answers: answerInputs },
  context,
) => {
  const db = getDb(context.db);

  for (const row of answerInputs) {
    const [q] = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, row.questionId))
      .limit(1);

    if (!q || q.examId !== examId) {
      throw new Error(`Invalid question for this exam: ${row.questionId}`);
    }
    const n = q.answers.length;
    if (row.answerIndex < 0 || row.answerIndex >= n) {
      throw new Error(`answerIndex out of range for question ${row.questionId}`);
    }
  }

  await db
    .delete(answersTable)
    .where(
      and(
        eq(answersTable.studentId, studentId),
        eq(answersTable.examId, examId),
      ),
    );

  if (answerInputs.length === 0) {
    return { success: true, submittedCount: 0 };
  }

  await db.insert(answersTable).values(
    answerInputs.map((a) => ({
      studentId,
      examId,
      questionId: a.questionId,
      answerIndex: a.answerIndex,
    })),
  );

  return { success: true, submittedCount: answerInputs.length };
};
