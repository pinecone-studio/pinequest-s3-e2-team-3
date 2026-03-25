import { getDb } from "@/db";
import { proctorLogs as proctorLogsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const deleteProctorLog: MutationResolvers["deleteProctorLog"] = async (
  _parent,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const deleted = await db
    .delete(proctorLogsTable)
    .where(eq(proctorLogsTable.id, id))
    .returning();

  return deleted.length > 0;
};
