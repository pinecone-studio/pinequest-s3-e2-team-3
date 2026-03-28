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

export const topics: QueryResolvers["topics"] = async (
  _,
  { subjectId },
  context,
) => {
  const db = getDb(context.db);
  const rows = await db
    .select()
    .from(topicsTable)
    .where(eq(topicsTable.subjectId, subjectId));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    grade: r.grade,
    subjectId: r.subjectId,
    createdAt: epochToISOString(r.createdAt),
    updatedAt: epochToISOString(r.updatedAt),
  }));
};
