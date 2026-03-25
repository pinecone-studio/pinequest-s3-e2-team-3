import { getDb } from "@/db";
import { examSessions as examSessionsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const deleteExamSession: MutationResolvers["deleteExamSession"] = async (
  _,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const deleted = await db
    .delete(examSessionsTable)
    .where(eq(examSessionsTable.id, id))
    .returning();
  return deleted.length > 0;
};

