import { students } from "@/db/schema";
import { getDb } from "@/db";
import { QueryResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const getStudents: QueryResolvers["getStudents"] = async (
  _,
  __,
  context,
) => {
  try {
    const db = getDb(context.db);

    const allStudents = await db.select().from(students);

    return allStudents.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      classId: s.classId,
      createdAt: epochToISOString(s.createdAt),
      updatedAt: epochToISOString(s.updatedAt),
    }));
  } catch (error) {
    console.error("Get Students Error:", error);
    throw new Error("Сурагчдын мэдээллийг авахад алдаа гарлаа.");
  }
};
