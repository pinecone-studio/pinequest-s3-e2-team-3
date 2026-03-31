import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  examSessions,
  questions as questionsTable,
  studentAnswers as studentAnswersTable,
  studentSessionStatus,
} from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

const INSERT_BATCH_SIZE = 15;

async function markSessionFinished(
  db: ReturnType<typeof getDb>,
  sessionId: string,
  studentId: string,
) {
  const updated = await db
    .update(studentSessionStatus)
    .set({ isFinished: true })
    .where(
      and(
        eq(studentSessionStatus.sessionId, sessionId),
        eq(studentSessionStatus.studentId, studentId),
      ),
    )
    .returning({ id: studentSessionStatus.id });

  if (updated.length === 0) {
    await db.insert(studentSessionStatus).values({
      sessionId,
      studentId,
      isStarted: true,
      isFinished: true,
    });
  }
}

export const submitExamAnswers: MutationResolvers["submitExamAnswers"] = async (
  _,
  { studentId, examId, sessionId, answers: answerInputs },
  context,
) => {
  const db = getDb(context.db);

  // Validate all questions in a single query instead of one-by-one
  if (answerInputs.length > 0) {
    const questionIds = answerInputs.map((a) => a.questionId);
    const dbQuestions = await db
      .select({
        id: questionsTable.id,
        examId: questionsTable.examId,
        answers: questionsTable.answers,
      })
      .from(questionsTable)
      .where(inArray(questionsTable.id, questionIds));

    const questionMap = new Map(dbQuestions.map((q) => [q.id, q]));

    for (const row of answerInputs) {
      const q = questionMap.get(row.questionId);
      if (!q || q.examId !== examId) {
        throw new Error(`Invalid question for this exam: ${row.questionId}`);
      }
      const n = q.answers.length;
      const unanswered = row.answerIndex === -1;
      const inRange = row.answerIndex >= 0 && row.answerIndex < n;
      if (!unanswered && !inRange) {
        throw new Error(
          `answerIndex out of range for question ${row.questionId}`,
        );
      }
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
      return { success: true, submittedCount: 0 };
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
      await markSessionFinished(db, sessionId, studentId);
    }
    return { success: true, submittedCount: 0 };
  }

  // Insert in batches to stay within D1's 100 bound-parameter limit
  const rows = answerInputs.map((a) => ({
    studentId,
    sessionId: sessionId ?? null,
    examId,
    questionId: a.questionId,
    answerIndex: a.answerIndex,
  }));

  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    await db
      .insert(studentAnswersTable)
      .values(rows.slice(i, i + INSERT_BATCH_SIZE));
  }

  if (sessionId) {
    await markSessionFinished(db, sessionId, studentId);
  }

  return { success: true, submittedCount: answerInputs.length };
};
