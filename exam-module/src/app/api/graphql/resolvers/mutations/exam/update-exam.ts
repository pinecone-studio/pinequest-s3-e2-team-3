import { getDb } from "@/db";
import { exams } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const updateExam: MutationResolvers["updateExam"] = async (
  _parent: unknown,
  { id, title, description, durationMinutes },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    title?: string;
    description?: string | null;
    durationMinutes?: number;
  } = {};

  if (title !== undefined && title !== null) patch.title = title;
  if (description !== undefined) patch.description = description;
  if (durationMinutes !== undefined && durationMinutes !== null) {
    patch.durationMinutes = durationMinutes;
  }

  if (Object.keys(patch).length > 0) {
    await db.update(exams).set(patch).where(eq(exams.id, id));
  }

  const updated = await db
    .select()
    .from(exams)
    .where(eq(exams.id, id))
    .limit(1);
  if (!updated[0]) {
    throw new Error("Exam not found");
  }

  return updated[0];
};
