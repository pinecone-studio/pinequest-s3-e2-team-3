import { getDb } from "@/db";
import {
  examSessions,
  proctorLogs as proctorLogsTable,
} from "@/db/schema";
import { mapJoinedProctorRowToGraphQL } from "@/app/api/graphql/proctor-log-map";
import { QueryResolvers } from "@/gql/graphql";
import { eq } from "drizzle-orm";

export const proctorLog: QueryResolvers["proctorLog"] = async (
  _parent,
  { id },
  context,
) => {
  const db = getDb(context.db);
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

  if (!rows[0]) return null;

  return mapJoinedProctorRowToGraphQL(rows[0]);
};
