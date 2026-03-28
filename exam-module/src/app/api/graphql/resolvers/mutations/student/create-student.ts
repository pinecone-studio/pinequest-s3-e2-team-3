import { classes, students } from "@/db/schema";
import { getDb } from "@/db";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const createStudent: MutationResolvers["createStudent"] = async (
  _,
  { name, classId, email },
  context,
) => {
  const db = getDb(context.db);

  const [klass] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);
  if (!klass) throw new Error("Class not found");

  const [newStudent] = await db
    .insert(students)
    .values({
      name,
      classId,
      email: email.trim(),
    })
    .returning();

  if (!newStudent) throw new Error("Student not created");

  return {
    id: newStudent.id,
    name: newStudent.name,
    email: newStudent.email,
    classId: newStudent.classId,
    createdAt: epochToISOString(newStudent.createdAt),
    updatedAt: epochToISOString(newStudent.updatedAt),
  };
};
