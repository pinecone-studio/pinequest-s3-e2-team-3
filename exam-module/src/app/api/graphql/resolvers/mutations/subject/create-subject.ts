import { getDb } from "@/db";
import {
  subjects as subjectsTable,
  topics as topicsTable,
} from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const createSubject: MutationResolvers["createSubject"] = async (
  _,
  { name },
  context,
) => {
  const db = getDb(context.db);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Subject name is required");

  // D1 does not support Drizzle's SQL transaction (BEGIN); sequential writes only.
  const [inserted] = await db
    .insert(subjectsTable)
    .values({ name: trimmed })
    .returning();

  if (!inserted) throw new Error("Subject not created");

  await db.insert(topicsTable).values({
    name: "Others",
    grade: 0,
    subjectId: inserted.id,
  });

  return {
    id: inserted.id,
    name: inserted.name,
    createdAt: epochToISOString(inserted.createdAt),
    updatedAt: epochToISOString(inserted.updatedAt),
  };
};
