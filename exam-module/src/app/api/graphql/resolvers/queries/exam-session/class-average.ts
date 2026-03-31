import { getDb } from "@/db";
import {
  examSessions as examSessionsTable,
  students as studentsTable,
  studentAnswers as studentAnswersTable,
  questions as questionsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import type { GraphQLContext } from "../../../graphql-context";

export const classAverage = async (
  _: unknown,
  { classId, examSessionId }: { classId: string; examSessionId: string },
  context: GraphQLContext,
) => {
  const db = getDb(context.db);

  const sessionRows = await db
    .select()
    .from(examSessionsTable)
    .where(eq(examSessionsTable.id, examSessionId))
    .limit(1);

  const session = sessionRows[0];
  if (!session) throw new Error("Exam session not found");
  if (session.classId !== classId)
    throw new Error("Class ID does not match the exam session");

  const examId = session.examId;

  const classStudents = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.classId, classId));

  const allQuestions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.examId, examId));

  const totalQuestions = allQuestions.length;
  if (totalQuestions === 0) {
    return {
      classId,
      examSessionId,
      averageScore: 0,
      totalStudents: classStudents.length,
    };
  }

  const correctIndexByQuestionId = new Map(
    allQuestions.map((q) => [q.id, q.correctIndex]),
  );

  const allAnswers = await db
    .select()
    .from(studentAnswersTable)
    .where(eq(studentAnswersTable.sessionId, examSessionId));

  const studentIds = new Set(classStudents.map((s) => s.id));
  const participantIds = new Set<string>();
  const scoreByStudent = new Map<string, number>();

  for (const answer of allAnswers) {
    if (!answer.studentId || !studentIds.has(answer.studentId)) continue;

    participantIds.add(answer.studentId);

    const correctIndex = correctIndexByQuestionId.get(answer.questionId ?? "");
    if (correctIndex === undefined) continue;

    const current = scoreByStudent.get(answer.studentId) ?? 0;
    if (answer.answerIndex === correctIndex) {
      scoreByStudent.set(answer.studentId, current + 1);
    } else {
      scoreByStudent.set(answer.studentId, current);
    }
  }

  const participatedStudents = classStudents.filter((s) =>
    participantIds.has(s.id),
  );
  const totalStudents = participatedStudents.length;

  if (totalStudents === 0) {
    return { classId, examSessionId, averageScore: 0, totalStudents: 0 };
  }

  let totalScore = 0;
  for (const student of participatedStudents) {
    const correctCount = scoreByStudent.get(student.id) ?? 0;
    totalScore += (correctCount / totalQuestions) * 100;
  }

  const averageScore = Math.round((totalScore / totalStudents) * 100) / 100;

  return { classId, examSessionId, averageScore, totalStudents };
};
