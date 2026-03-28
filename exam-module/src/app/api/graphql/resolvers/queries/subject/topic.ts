import { getDb } from "@/db";
import { topics as topicsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const topic: QueryResolvers["topic"] = async (_, { id }, context) => {
  const db = getDb(context.db);
  const rows = await db
    .select()
    .from(topicsTable)
    .where(eq(topicsTable.id, id))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];

  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    subjectId: row.subjectId,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
};
