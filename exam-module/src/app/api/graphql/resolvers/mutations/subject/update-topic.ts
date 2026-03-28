import { getDb } from "@/db";
import {
  subjects as subjectsTable,
  topics as topicsTable,
} from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const updateTopic: MutationResolvers["updateTopic"] = async (
  _,
  { id, name, grade, subjectId },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    name?: string;
    grade?: number;
    subjectId?: string;
  } = {};

  if (name !== undefined && name !== null) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Topic name is required");
    patch.name = trimmed;
  }
  if (grade !== undefined && grade !== null) patch.grade = grade;
  if (subjectId !== undefined) {
    if (subjectId === null) throw new Error("subjectId cannot be null");
    const [subject] = await db
      .select({ id: subjectsTable.id })
      .from(subjectsTable)
      .where(eq(subjectsTable.id, subjectId))
      .limit(1);
    if (!subject) throw new Error("Subject not found");
    patch.subjectId = subjectId;
  }

  if (Object.keys(patch).length > 0) {
    await db.update(topicsTable).set(patch).where(eq(topicsTable.id, id));
  }

  const rows = await db
    .select()
    .from(topicsTable)
    .where(eq(topicsTable.id, id))
    .limit(1);

  if (!rows[0]) throw new Error("Topic not found");

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
