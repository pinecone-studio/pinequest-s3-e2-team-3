import { getDb } from "@/db";
import { subjects as subjectsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const subjects: QueryResolvers["subjects"] = async (_, __, context) => {
  const db = getDb(context.db);
  const rows = await db.select().from(subjectsTable);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: epochToISOString(r.createdAt),
    updatedAt: epochToISOString(r.updatedAt),
  }));
};
