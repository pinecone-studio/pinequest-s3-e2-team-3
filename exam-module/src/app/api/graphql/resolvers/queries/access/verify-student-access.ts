import { getDb } from "@/db";
import { studentSessionStatus as studentSessionStatusTable } from "@/db/schema";
import { QueryResolvers } from "@/gql/graphql";
import { and, eq } from "drizzle-orm";

export const verifyStudentAccess: QueryResolvers["verifyStudentAccess"] =
  async (_, { studentId, sessionId }, context) => {
    const db = getDb(context.db);

    const rows = await db
      .select()
      .from(studentSessionStatusTable)
      .where(
        and(
          eq(studentSessionStatusTable.studentId, studentId),
          eq(studentSessionStatusTable.sessionId, sessionId),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) return { allowed: false };

    if (row.isFinished) return { allowed: false };

    if (!row.isStarted) {
      await db
        .update(studentSessionStatusTable)
        .set({ isStarted: true })
        .where(eq(studentSessionStatusTable.id, row.id));
      return { allowed: true };
    }

    return { allowed: true };
  };
