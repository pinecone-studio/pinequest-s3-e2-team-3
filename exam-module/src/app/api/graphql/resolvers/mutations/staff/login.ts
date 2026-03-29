import { getDb } from "@/db";
import { users as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export async function login(
  _: unknown,
  args: { username: string; password: string },
  context: { db: D1Database },
) {
  const db = getDb(context.db);
  const { username, password } = args;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username.trim()))
    .limit(1);

  if (!user) {
    return {
      success: false,
      message: "Нэвтрэх нэр буруу байна.",
      user: null,
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: "Нууц үг буруу байна.",
      user: null,
    };
  }

  return {
    success: true,
    message: null,
    user: {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: null,
      role: user.role,
      subjects: user.subjects ?? [],
      classIds: user.classIds ?? [],
      createdAt: epochToISOString(user.createdAt),
      updatedAt: epochToISOString(user.updatedAt),
    },
  };
}
