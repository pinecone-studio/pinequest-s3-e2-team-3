import { deriveExamSessionStatusFromRowTimes } from "@/lib/exam-session-derived-status";
import { examFileDownloadUrl } from "@/lib/exam-file-url";
import { mapExamRowToGraphQL } from "@/app/api/graphql/map-exam-row";
import { getDb } from "@/db";
import { classes as classesTable, exams as examsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { GraphQLContext } from "../graphql-context";
import * as Mutation from "./mutations";
import * as Query from "./queries";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const resolvers = {
  Query: {
    ...Query,
  },
  Mutation: {
    ...Mutation,
  },
  Question: {
    attachmentUrl(
      parent: { attachmentKey?: string | null },
      _: unknown,
      context: GraphQLContext,
    ) {
      const k = parent.attachmentKey;
      if (!k) return null;
      return examFileDownloadUrl(context.requestOrigin, k);
    },
  },
  ExamQuestionForTaker: {
    attachmentUrl(
      parent: { attachmentKey?: string | null },
      _: unknown,
      context: GraphQLContext,
    ) {
      const k = parent.attachmentKey;
      if (!k) return null;
      return examFileDownloadUrl(context.requestOrigin, k);
    },
  },
  ExamSession: {
    status(parent: { startTime: string; endTime: string }) {
      return deriveExamSessionStatusFromRowTimes(
        new Date(parent.startTime).getTime(),
        new Date(parent.endTime).getTime(),
      );
    },
    async class(
      parent: { classId: string },
      _: unknown,
      context: GraphQLContext,
    ) {
      const db = getDb(context.db);
      const rows = await db
        .select()
        .from(classesTable)
        .where(eq(classesTable.id, parent.classId))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        createdAt: epochToISOString(row.createdAt),
        updatedAt: epochToISOString(row.updatedAt),
      };
    },
    async exam(
      parent: { examId: string },
      _: unknown,
      context: GraphQLContext,
    ) {
      const db = getDb(context.db);
      const rows = await db
        .select()
        .from(examsTable)
        .where(eq(examsTable.id, parent.examId))
        .limit(1);
      if (!rows[0]) return null;
      return mapExamRowToGraphQL(rows[0]);
    },
  },
};
