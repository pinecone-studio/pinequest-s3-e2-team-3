import { getDb } from "@/db";
import { exams } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const updateExam: MutationResolvers["updateExam"] = async (
  _parent: unknown,
  { id, name },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    name?: string;
  } = {};

  if (name !== undefined && name !== null) patch.name = name;

  if (Object.keys(patch).length > 0) {
    await db.update(exams).set(patch).where(eq(exams.id, id));
  }

  const updated = await db
    .select()
    .from(exams)
    .where(eq(exams.id, id))
    .limit(1);
  if (!updated[0]) {
    throw new Error("Exam not found");
  }

  const row = updated[0];
  return {
    id: row.id,
    name: row.name,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
};
