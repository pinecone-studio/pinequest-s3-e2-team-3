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

export const createTopic: MutationResolvers["createTopic"] = async (
  _,
  { name, grade, subjectId },
  context,
) => {
  const db = getDb(context.db);

  const [subject] = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(eq(subjectsTable.id, subjectId))
    .limit(1);
  if (!subject) throw new Error("Subject not found");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Topic name is required");

  const [inserted] = await db
    .insert(topicsTable)
    .values({
      name: trimmed,
      grade,
      subjectId,
    })
    .returning();

  if (!inserted) throw new Error("Topic not created");

  return {
    id: inserted.id,
    name: inserted.name,
    grade: inserted.grade,
    subjectId: inserted.subjectId,
    createdAt: epochToISOString(inserted.createdAt),
    updatedAt: epochToISOString(inserted.updatedAt),
  };
};
