import { mapExamRowToGraphQL } from "@/app/api/graphql/map-exam-row";
import { getDb } from "@/db";
import { exams, subjects, topics, users } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const createExam: MutationResolvers["createExam"] = async (
  _,
  { name, creatorId, subjectId, topicId, isPublic },
  context,
) => {
  const db = getDb(context.db);

  if (creatorId != null && creatorId !== "") {
    const [creator] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, creatorId))
      .limit(1);
    if (!creator) throw new Error("Creator not found");
  }

  if (subjectId != null && subjectId !== "") {
    const [subject] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);
    if (!subject) throw new Error("Subject not found");
  }

  let resolvedSubjectId = subjectId ?? null;
  const resolvedTopicId = topicId ?? null;

  if (topicId != null && topicId !== "") {
    const [topicRow] = await db
      .select({
        id: topics.id,
        subjectId: topics.subjectId,
      })
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);
    if (!topicRow) throw new Error("Topic not found");

    if (resolvedSubjectId != null && resolvedSubjectId !== "") {
      if (topicRow.subjectId !== resolvedSubjectId) {
        throw new Error("Topic not found for this subject");
      }
    } else {
      resolvedSubjectId = topicRow.subjectId;
    }
  }

  const [created] = await db
    .insert(exams)
    .values({
      name,
      creatorId: creatorId ?? null,
      subjectId: resolvedSubjectId,
      topicId: resolvedTopicId,
      isPublic: isPublic ?? false,
    })
    .returning();

  if (!created) throw new Error("Exam not created");

  return mapExamRowToGraphQL(created);
};
