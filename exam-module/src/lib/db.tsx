import Dexie, { type EntityTable } from 'dexie';

interface Answer {
  id?: number;
  studentName: string;
  questionId: number;
  text: string;
  status: 'pending' | 'synced';
}

export const db = new Dexie('MiniExamDB') as Dexie & {
  answers: EntityTable<Answer, 'id'>;
};

db.version(1).stores({
  answers: '++id, status, studentName'
});
