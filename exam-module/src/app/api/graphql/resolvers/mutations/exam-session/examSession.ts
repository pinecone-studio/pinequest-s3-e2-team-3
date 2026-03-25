import { getDb } from "@/db";
import { examSessions as examSessionsTable } from "@/db/schema";
import { MutationResolvers } from "@/gql/graphql";

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
