import { getDb } from "@/db";
import { users as usersTable } from "@/db/schema";
import { MutationResolvers, UserRole } from "@/gql/graphql";
import { eq } from "drizzle-orm";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

function randomPassword8(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const buf = crypto.getRandomValues(new Uint8Array(8));
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += chars[buf[i]! % chars.length]!;
  }
  return s;
}

function sanitizeLastNamePart(lastName: string): string {
  const t = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return t.length > 0 ? t : "user";
}

/** firstname[0] + lastname (alphanumeric) + 3 random digits */
async function allocateUsername(
  db: ReturnType<typeof getDb>,
  name: string,
  lastName: string,
): Promise<string> {
  const first = name.trim()[0]?.toLowerCase() ?? "u";
  const last = sanitizeLastNamePart(lastName);
  const base = `${first}${last}`;

  for (let i = 0; i < 100; i++) {
    const n = crypto.getRandomValues(new Uint8Array(2));
    const num = ((n[0]! << 8) | n[1]!) % 1000;
    const digits = String(num).padStart(3, "0");
    const candidate = `${base}${digits}`;
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, candidate))
      .limit(1);
    if (!existing[0]) return candidate;
  }
  throw new Error("Could not allocate unique username");
}

export const createTeacher: MutationResolvers["createTeacher"] = async (
  _,
  { name, lastName, email, subjects },
  context,
) => {
  const db = getDb(context.db);
  const username = await allocateUsername(db, name, lastName);
  const password = randomPassword8();
  const subjectList = (subjects ?? []).filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );

  const [created] = await db
    .insert(usersTable)
    .values({
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      username,
      password,
      role: "teacher",
      subjects: subjectList,
    })
    .returning();

  if (!created) throw new Error("Teacher not created");

  return {
    id: created.id,
    name: created.name,
    lastName: created.lastName,
    email: created.email,
    username: created.username,
    password: created.password,
    role:
      created.role === "manager" ? UserRole.Manager : UserRole.Teacher,
    subjects: created.subjects ?? [],
    createdAt: epochToISOString(created.createdAt),
    updatedAt: epochToISOString(created.updatedAt),
  };
};
