import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  exams as examsTable,
  examSessions as examSessionsTable,
  students as studentsTable,
} from "@/db/schema";
import { sendExamInviteEmails } from "@/lib/send-exam-invite-emails";
import { MutationResolvers } from "@/gql/graphql";

function hasCfWaitUntil(
  ctx: unknown,
): ctx is { cfWaitUntil: (p: Promise<unknown>) => void } {
  return (
    typeof ctx === "object" &&
    ctx !== null &&
    "cfWaitUntil" in ctx &&
    typeof (ctx as { cfWaitUntil: unknown }).cfWaitUntil === "function"
  );
}

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const createExamSession: MutationResolvers["createExamSession"] = async (
  _,
  { input },
  context,
) => {
  const db = getDb(context.db);

  const [created] = await db
    .insert(examSessionsTable)
    .values({
      examId: input.examId,
      classId: input.classId,
      description: input.description,
      startTime: new Date(input.startTime).getTime(),
      endTime: new Date(input.endTime).getTime(),
      status: input.status ?? undefined,
    })
    .returning();

  if (!created) throw new Error("Exam session not created");

  const [examRow] = await db
    .select()
    .from(examsTable)
    .where(eq(examsTable.id, created.examId))
    .limit(1);

  const classStudents = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.classId, created.classId));

  const recipients = classStudents
    .filter((s) => s.email?.trim())
    .map((s) => ({
      email: s.email!.trim(),
      name: s.name,
      studentId: s.id,
    }));

  const emailPromise = sendExamInviteEmails({
    recipients,
    examId: created.examId,
    examName: examRow?.name ?? "Шалгалт",
    sessionDescription: created.description,
  });

  if (hasCfWaitUntil(context)) {
    context.cfWaitUntil(emailPromise);
  } else {
    void emailPromise.catch((err) =>
      console.error("[exam-invite] background send failed:", err),
    );
  }

  return {
    id: created.id,
    examId: created.examId,
    classId: created.classId,
    description: created.description,
    startTime: epochToISOString(created.startTime),
    endTime: epochToISOString(created.endTime),
    status: created.status,
    createdAt: epochToISOString(created.createdAt),
    updatedAt: epochToISOString(created.updatedAt),
  };
};
