import { getDb } from "@/db";
import { questions as questionsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const deleteQuestion: MutationResolvers["deleteQuestion"] = async (
  _,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const deleted = await db
    .delete(questionsTable)
    .where(eq(questionsTable.id, id))
    .returning();
  return deleted.length > 0;
};

