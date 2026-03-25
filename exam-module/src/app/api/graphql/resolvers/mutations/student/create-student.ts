import { students } from "@/db/schema";
import { getDb } from "@/db";
import { MutationResolvers } from "@/gql/graphql";

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

  const [newStudent] = await db
    .insert(students)
    .values({
      name,
      classId,
      email: email ?? "",
    })
    .returning();

  return {
    id: newStudent.id,
    name: newStudent.name,
    email: newStudent.email,
    classId: newStudent.classId!,
    createdAt: epochToISOString(newStudent.createdAt),
    updatedAt: epochToISOString(newStudent.updatedAt),
  };
};
