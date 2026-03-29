import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDb } from "@/db";

export async function assignTeacherToClass(
  _: unknown,
  args: { teacherId: string; classId: string },
  context: { db: D1Database },
) {
  const { teacherId, classId } = args;
  const db = getDb(context.db);

  const [teacher] = await db
    .select()
    .from(users)
    .where(eq(users.id, teacherId))
    .limit(1);

  if (!teacher) throw new Error("Багш олдсонгүй.");

  const currentClassIds: string[] = (teacher.classIds as string[]) ?? [];

  if (currentClassIds.includes(classId)) {
    // Already assigned — return as-is
    return {
      id: teacher.id,
      name: teacher.name,
      lastName: teacher.lastName,
      email: teacher.email,
      username: teacher.username,
      role: teacher.role,
      subjects: teacher.subjects ?? [],
      classIds: currentClassIds,
      createdAt: String(teacher.createdAt),
      updatedAt: String(teacher.updatedAt),
    };
  }

  const newClassIds = [...currentClassIds, classId];

  await db
    .update(users)
    .set({ classIds: newClassIds })
    .where(eq(users.id, teacherId));

  return {
    id: teacher.id,
    name: teacher.name,
    lastName: teacher.lastName,
    email: teacher.email,
    username: teacher.username,
    role: teacher.role,
    subjects: teacher.subjects ?? [],
    classIds: newClassIds,
    createdAt: String(teacher.createdAt),
    updatedAt: String(Date.now()),
  };
}
