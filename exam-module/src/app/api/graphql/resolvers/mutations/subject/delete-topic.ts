import { getDb } from "@/db";
import { topics as topicsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const deleteTopic: MutationResolvers["deleteTopic"] = async (
  _,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const deleted = await db
    .delete(topicsTable)
    .where(eq(topicsTable.id, id))
    .returning();
  return deleted.length > 0;
};
