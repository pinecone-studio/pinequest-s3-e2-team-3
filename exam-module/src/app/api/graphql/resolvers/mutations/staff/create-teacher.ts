import { getDb } from "@/db";
import { users as usersTable } from "@/db/schema";
import { MutationResolvers, UserRole } from "@/gql/graphql";
import { eq } from "drizzle-orm";
import { sendTeacherCredentialsEmail } from "@/lib/send-teacher-credentials-email";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

/** Generate random 4-digit suffix */
function random4Digits(): string {
  const n = crypto.getRandomValues(new Uint8Array(2));
  const num = ((n[0]! << 8) | n[1]!) % 10000;
  return String(num).padStart(4, "0");
}

const USERNAME_PREFIX = "pinequest26227";

/**
 * Username: pinequest26227XXXX  (sүүлийн 4 тоо random)
 * Password: pinequest26227XXXX  (username-тай ижил — сүүлийн 4 тоо = password-ийн сүүлийн 4 тоо)
 */
async function allocateUsername(db: ReturnType<typeof getDb>): Promise<string> {
  for (let i = 0; i < 100; i++) {
    const digits = random4Digits();
    const candidate = `${USERNAME_PREFIX}${digits}`;
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

  // Check for duplicate email before inserting
  const existingEmail = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.trim()))
    .limit(1);
  if (existingEmail[0]) {
    throw new Error(
      `"${email.trim()}" имэйлтэй хэрэглэгч аль хэдийн бүртгэлтэй байна.`,
    );
  }

  const username = await allocateUsername(db);
  // Password = username-ийн сүүлийн 4 тоо
  const password = username.slice(-4);
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
      classIds: [],
    })
    .returning();

  if (!created) throw new Error("Teacher not created");

  // Send credentials email via Resend (fire & forget — don't block the response)
  const loginUrl = `${(context as { requestOrigin?: string }).requestOrigin ?? "http://localhost:3000"}/login`;
  sendTeacherCredentialsEmail({
    email: created.email,
    name: created.name,
    lastName: created.lastName,
    username,
    password,
    loginUrl,
  }).catch((err) =>
    console.error("[createTeacher] Failed to send credentials email:", err),
  );

  return {
    id: created.id,
    name: created.name,
    lastName: created.lastName,
    email: created.email,
    username: created.username,
    password: created.password,
    role: created.role === "manager" ? UserRole.Manager : UserRole.Teacher,
    subjects: created.subjects ?? [],
    classIds: created.classIds ?? [],
    createdAt: epochToISOString(created.createdAt),
    updatedAt: epochToISOString(created.updatedAt),
  };
};
