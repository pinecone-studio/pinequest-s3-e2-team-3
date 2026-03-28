import { getDb } from "@/db";
import { users as usersTable } from "@/db/schema";
import { QueryResolvers, UserRole } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const staffUsers: QueryResolvers["staffUsers"] = async (
  _,
  __,
  context,
) => {
  const db = getDb(context.db);
  const rows = await db.select().from(usersTable);
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    lastName: u.lastName,
    email: u.email,
    username: u.username,
    password: null,
    role:
      u.role === "manager" ? UserRole.Manager : UserRole.Teacher,
    subjects: u.subjects ?? [],
    createdAt: epochToISOString(u.createdAt),
    updatedAt: epochToISOString(u.updatedAt),
  }));
};
