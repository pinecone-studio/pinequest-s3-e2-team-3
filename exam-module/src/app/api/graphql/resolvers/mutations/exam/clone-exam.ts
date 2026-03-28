import { getDb } from "@/db";
import {
  exams as examsTable,
  questions as questionsTable,
  users as usersTable,
} from "@/db/schema";
import { mapExamRowToGraphQL } from "@/app/api/graphql/map-exam-row";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const cloneExam: MutationResolvers["cloneExam"] = async (
  _,
  { examId, teacherId },
  context,
) => {
  const db = getDb(context.db);

  const [teacher] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, teacherId))
    .limit(1);

  if (!teacher) throw new Error("Teacher not found");

  const cloned = await db.transaction(async (tx) => {
    const [source] = await tx
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, examId))
      .limit(1);

    if (!source) throw new Error("Exam not found");

    const sourceQuestions = await tx
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.examId, examId));

    const [newExam] = await tx
      .insert(examsTable)
      .values({
        name: source.name,
        creatorId: teacherId,
        isPublic: false,
        subjectId: source.subjectId,
        topicId: source.topicId,
        parentId: examId,
      })
      .returning();

    if (!newExam) throw new Error("Exam clone not created");

    if (sourceQuestions.length > 0) {
      await tx.insert(questionsTable).values(
        sourceQuestions.map((q) => ({
          examId: newExam.id,
          question: q.question,
          answers: q.answers,
          correctIndex: q.correctIndex,
          variation: q.variation,
        })),
      );
    }

    return newExam;
  });

  return mapExamRowToGraphQL(cloned);
};
