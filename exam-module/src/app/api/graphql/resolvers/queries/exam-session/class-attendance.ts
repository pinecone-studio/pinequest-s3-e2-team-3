import { getDb } from "@/db";
import {
  students as studentsTable,
  studentSessionStatus as studentSessionStatusTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import type { GraphQLContext } from "../../../graphql-context";

export const classAttendance = async (
  _: unknown,
  { classId, examSessionId }: { classId: string; examSessionId: string },
  context: GraphQLContext,
) => {
  const db = getDb(context.db);

  const classStudents = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.classId, classId));

  const studentIds = new Set(classStudents.map((s) => s.id));
  const totalStudents = classStudents.length;

  const statusRows = await db
    .select()
    .from(studentSessionStatusTable)
    .where(eq(studentSessionStatusTable.sessionId, examSessionId));

  const attended = statusRows.filter(
    (row) => studentIds.has(row.studentId) && row.isStarted,
  ).length;

  const attendanceRate =
    totalStudents > 0
      ? Math.round((attended / totalStudents) * 10000) / 100
      : 0;

  return {
    classId,
    examSessionId,
    attended,
    totalStudents,
    attendanceRate,
  };
};
