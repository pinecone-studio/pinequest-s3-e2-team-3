import { getDb } from "@/db";
import { exams } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

export const createExam: MutationResolvers["createExam"] = async (
  _,
  { title, durationMinutes },
  context,
) => {
  const db = getDb(context.db);
  const result = await db
    .insert(exams)
    .values({
      title,
      durationMinutes,
    })
    .returning();

  return result[0];
};
