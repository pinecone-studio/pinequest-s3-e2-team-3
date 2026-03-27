import Dexie, { type EntityTable } from "dexie";

export interface Answer {
  id?: number;
  studentName: string;
  questionId: string;
  answer: string;
  synced: boolean;
}

export const db = new Dexie("MiniExamDB") as Dexie & {
  answers: EntityTable<Answer, "id">;
};

db.version(1).stores({
  answers: "++id, synced, studentName, questionId",
});
