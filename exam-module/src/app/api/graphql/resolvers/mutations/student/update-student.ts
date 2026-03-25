import { getDb } from "@/db";
import { students as studentsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const updateStudent: MutationResolvers["updateStudent"] = async (
  _,
  { id, name, email, classId },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    name?: string;
    email?: string;
    classId?: string;
  } = {};

  if (name !== undefined && name !== null) patch.name = name;
  if (email !== undefined && email !== null) patch.email = email;
  if (classId !== undefined && classId !== null) patch.classId = classId;

  if (Object.keys(patch).length > 0) {
    await db.update(studentsTable).set(patch).where(eq(studentsTable.id, id));
  }

  const rows = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, id))
    .limit(1);

  if (!rows[0]) throw new Error("Student not found");

  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    classId: row.classId!,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
};
