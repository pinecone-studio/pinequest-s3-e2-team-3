import { mapExamRowToGraphQL } from "@/app/api/graphql/map-exam-row";
import { getDb } from "@/db";
import { exams as examsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";

export const exams: QueryResolvers["exams"] = async (_, __, context) => {
  const db = getDb(context.db);
  const rows = await db.select().from(examsTable);
  return rows.map(mapExamRowToGraphQL);
};
