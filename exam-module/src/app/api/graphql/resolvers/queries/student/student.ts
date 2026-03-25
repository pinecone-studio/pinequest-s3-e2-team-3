import { students } from "@/db/schema";
import { getDb } from "@/db";
import { QueryResolvers } from "@/gql/graphql";

export const getStudents: QueryResolvers["getStudents"] = async (
  _,
  __,
  context,
) => {
  try {
    const db = getDb(context.db);

    const allStudents = await db.select().from(students);

    return allStudents.map((student) => ({
      ...student,
      classId: student.classId!,
    }));
  } catch (error) {
    console.error("Get Students Error:", error);
    throw new Error("Сурагчдын мэдээллийг авахад алдаа гарлаа.");
  }
};
