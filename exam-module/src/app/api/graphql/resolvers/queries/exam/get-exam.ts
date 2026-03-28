import { mapExamRowToGraphQL } from "@/app/api/graphql/map-exam-row";
import { getDb } from "@/db";
import { exams as examsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const exam: QueryResolvers["exam"] = async (
  _parent,
  { id },
  context,
) => {
  const db = getDb(context.db);
  const row = await db
    .select()
    .from(examsTable)
    .where(eq(examsTable.id, id))
    .limit(1);

  if (!row[0]) return null;

  return mapExamRowToGraphQL(row[0]);
};

