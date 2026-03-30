import { getDb } from "@/db";
import { students as studentsTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const studentsByClass: QueryResolvers["studentsByClass"] = async (
  _,
  { classId },
  context,
) => {
  const db = getDb(context.db);
  const rows = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.classId, classId));

  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    classId: s.classId,
    createdAt: epochToISOString(s.createdAt),
    updatedAt: epochToISOString(s.updatedAt),
  }));
};
