import { getDb } from "@/db";
import { users as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteTeacher(
  _: unknown,
  args: { teacherId: string },
  context: { db: D1Database },
) {
  const db = getDb(context.db);
  const { teacherId } = args;

  const [deleted] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, teacherId))
    .returning({ id: usersTable.id });

  if (!deleted) {
    throw new Error("Багш олдсонгүй эсвэл устгах боломжгүй.");
  }

  return true;
}
