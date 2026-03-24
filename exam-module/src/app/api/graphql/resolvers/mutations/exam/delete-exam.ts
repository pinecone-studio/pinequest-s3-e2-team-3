import { getDb } from "@/db";
import { exams } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const deleteExam: MutationResolvers["deleteExam"] = async (
  _,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const deleted = await db.delete(exams).where(eq(exams.id, id)).returning();
  return deleted.length > 0;
};
