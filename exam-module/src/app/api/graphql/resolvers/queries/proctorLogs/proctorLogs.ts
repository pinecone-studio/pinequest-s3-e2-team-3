import { getDb } from "@/db";
import {
  examSessions,
  proctorLogs as proctorLogsTable,
} from "@/db/schema";
import { mapJoinedProctorRowToGraphQL } from "@/app/api/graphql/proctor-log-map";
import { QueryResolvers } from "@/gql/graphql";
import { and, eq } from "drizzle-orm";

export const proctorLogs: QueryResolvers["proctorLogs"] = async (
  _parent,
  { examId, studentId },
  context,
) => {
  const db = getDb(context.db);

  const conditions = [];
  if (examId) conditions.push(eq(examSessions.examId, examId));
  if (studentId) conditions.push(eq(proctorLogsTable.studentId, studentId));

  const base = db
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
    );

  const rows =
    conditions.length > 0
      ? await base.where(and(...conditions))
      : await base;

  return rows.map((row) => mapJoinedProctorRowToGraphQL(row));
};
