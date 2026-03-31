import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  examSessions,
  questions as questionsTable,
  studentAnswers as studentAnswersTable,
  studentSessionStatus,
} from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

export const submitExamAnswers: MutationResolvers["submitExamAnswers"] = async (
  _,
  { studentId, examId, sessionId, answers: answerInputs },
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

  if (sessionId) {
    const [sess] = await db
      .select()
      .from(examSessions)
      .where(eq(examSessions.id, sessionId))
      .limit(1);
    if (!sess || sess.examId !== examId) {
      throw new Error("Session does not match this exam");
    }

    const [statusRow] = await db
      .select({ isFinished: studentSessionStatus.isFinished })
      .from(studentSessionStatus)
      .where(
        and(
          eq(studentSessionStatus.sessionId, sessionId),
          eq(studentSessionStatus.studentId, studentId),
        ),
      )
      .limit(1);
    if (statusRow?.isFinished) {
      throw new Error("Your answer has already been submitted for this session.");
    }

    await db
      .delete(studentAnswersTable)
      .where(
        and(
          eq(studentAnswersTable.studentId, studentId),
          eq(studentAnswersTable.sessionId, sessionId),
        ),
      );
  } else {
    const questionRows = await db
      .select({ id: questionsTable.id })
      .from(questionsTable)
      .where(eq(questionsTable.examId, examId));
    const qIds = questionRows.map((r) => r.id);
    if (qIds.length > 0) {
      await db
        .delete(studentAnswersTable)
        .where(
          and(
            eq(studentAnswersTable.studentId, studentId),
            isNull(studentAnswersTable.sessionId),
            inArray(studentAnswersTable.questionId, qIds),
          ),
        );
    }
  }

  if (answerInputs.length === 0) {
    if (sessionId) {
      await db
        .update(studentSessionStatus)
        .set({ isFinished: true })
        .where(
          and(
            eq(studentSessionStatus.sessionId, sessionId),
            eq(studentSessionStatus.studentId, studentId),
          ),
        );
    }
    return { success: true, submittedCount: 0 };
  }

  await db.insert(studentAnswersTable).values(
    answerInputs.map((a) => ({
      studentId,
      sessionId: sessionId ?? null,
      examId,
      questionId: a.questionId,
      answerIndex: a.answerIndex,
    })),
  );

  if (sessionId) {
    await db
      .update(studentSessionStatus)
      .set({ isFinished: true })
      .where(
        and(
          eq(studentSessionStatus.sessionId, sessionId),
          eq(studentSessionStatus.studentId, studentId),
        ),
      );
  }

  return { success: true, submittedCount: answerInputs.length };
};
