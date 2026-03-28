import { mapExamRowToGraphQL } from "@/app/api/graphql/map-exam-row";
import { getDb } from "@/db";
import { exams, topics } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { and, eq } from "drizzle-orm";

export const updateExam: MutationResolvers["updateExam"] = async (
  _parent: unknown,
  { id, name, isPublic, subjectId, topicId, parentId },
  context,
) => {
  const db = getDb(context.db);

  const [current] = await db
    .select()
    .from(exams)
    .where(eq(exams.id, id))
    .limit(1);
  if (!current) throw new Error("Exam not found");

  const patch: {
    name?: string;
    isPublic?: boolean;
    subjectId?: string;
    topicId?: string;
    parentId?: string | null;
  } = {};

  if (name !== undefined && name !== null) patch.name = name;
  if (isPublic !== undefined && isPublic !== null) patch.isPublic = isPublic;
  if (subjectId !== undefined && subjectId !== null) patch.subjectId = subjectId;
  if (topicId !== undefined && topicId !== null) patch.topicId = topicId;
  if (parentId !== undefined) patch.parentId = parentId;

  const nextSubjectId = patch.subjectId ?? current.subjectId;
  const nextTopicId = patch.topicId ?? current.topicId;

  if (patch.topicId !== undefined || patch.subjectId !== undefined) {
    if (nextTopicId != null && nextSubjectId != null) {
      const [topicOk] = await db
        .select({ id: topics.id })
        .from(topics)
        .where(
          and(eq(topics.id, nextTopicId), eq(topics.subjectId, nextSubjectId)),
        )
        .limit(1);
      if (!topicOk) throw new Error("Topic does not belong to subject");
    }
  }

  if (Object.keys(patch).length > 0) {
    await db.update(exams).set(patch).where(eq(exams.id, id));
  }

  const updated = await db
    .select()
    .from(exams)
    .where(eq(exams.id, id))
    .limit(1);
  if (!updated[0]) throw new Error("Exam not found");

  return mapExamRowToGraphQL(updated[0]);
};
