import { getDb } from "@/db";
import {
  examSessions,
  proctorLogs as proctorLogsTable,
} from "@/db/schema";
import { mapJoinedProctorRowToGraphQL } from "@/app/api/graphql/proctor-log-map";
import { MutationResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const updateProctorLog: MutationResolvers["updateProctorLog"] = async (
  _parent,
  { id, sessionId, studentId, eventType },
  context,
) => {
  const db = getDb(context.db);

  const patch: {
    sessionId?: string | null;
    studentId?: string;
    eventType?: string;
  } = {};

  if (sessionId !== undefined) {
    patch.sessionId = sessionId ?? null;
  }
  if (studentId !== undefined && studentId !== null)
    patch.studentId = studentId;
  if (eventType !== undefined && eventType !== null)
    patch.eventType = eventType;

  if (Object.keys(patch).length > 0) {
    await db
      .update(proctorLogsTable)
      .set(patch)
      .where(eq(proctorLogsTable.id, id));
  }

  const rows = await db
    .select({
      id: proctorLogsTable.id,
      sessionId: proctorLogsTable.sessionId,
      studentId: proctorLogsTable.studentId,
      eventType: proctorLogsTable.eventType,
      createdAt: proctorLogsTable.createdAt,
      updatedAt: proctorLogsTable.updatedAt,
      examIdFromSession: examSessions.examId,
    })
    .from(proctorLogsTable)
    .leftJoin(
      examSessions,
      eq(proctorLogsTable.sessionId, examSessions.id),
    )
    .where(eq(proctorLogsTable.id, id))
    .limit(1);

  if (!rows[0]) {
    throw new Error("Proctor log not found");
  }

  return mapJoinedProctorRowToGraphQL(rows[0]);
};
