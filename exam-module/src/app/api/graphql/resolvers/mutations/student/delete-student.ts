import { getDb } from "@/db";
import { students as studentsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const deleteStudent: MutationResolvers["deleteStudent"] = async (
  _,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const deleted = await db
    .delete(studentsTable)
    .where(eq(studentsTable.id, id))
    .returning();
  return deleted.length > 0;
};

