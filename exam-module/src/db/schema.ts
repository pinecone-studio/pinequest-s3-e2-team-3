import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

// 1. The main Exam table
export const exams = sqliteTable('exams', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  title: text('title').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// 2. Questions linked to an exam
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  examId: text('exam_id').references(() => exams.id),
  content: text('content').notNull(), // The question text
  correctAnswer: text('correct_answer').notNull(),
});

// 3. Proctoring Logs (To catch tab switching or AI usage)
export const proctorLogs = sqliteTable('proctor_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  examId: text('exam_id').references(() => exams.id),
  studentId: text('student_id').notNull(),
  eventType: text('event_type').notNull(), // e.g., 'TAB_SWITCH' or 'FOCUS_LOST'
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});