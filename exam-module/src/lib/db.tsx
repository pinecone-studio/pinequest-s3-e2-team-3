import Dexie, { type EntityTable } from "dexie";

export interface Answer {
  id?: number;
  studentName: string;
  questionId: string;
  answer: string;
  examId: string;
  sessionId: string;
  synced: boolean;
}

export interface ProctorLogEntry {
  id?: number;
  eventType: string;
  studentId: string;
  examId?: string;
  sessionId?: string;
  timestamp: number;
  synced: boolean;
}

export const db = new Dexie("MiniExamDB") as Dexie & {
  answers: EntityTable<Answer, "id">;
  proctorLogs: EntityTable<ProctorLogEntry, "id">;
};

db.version(1).stores({
  answers: "++id, synced, studentName, questionId",
  proctorLogs: "++id, synced, studentId, eventType",
});
