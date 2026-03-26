import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";

// Reusable timestamp columns to keep it DRY
const timestamps = {
  // Store epoch milliseconds as integer.
  // (We avoid Drizzle's `mode: "timestamp"` decoding because it can produce invalid Date objects in D1.)
  createdAt: integer("created_at")
    .default(sql`(unixepoch() * 1000)`)
    .notNull(),
  updatedAt: integer("updated_at")
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => Date.now())
    .notNull(),
};

// 1. The main Exam table
export const exams = sqliteTable("exams", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  ...timestamps,
});

// 2. Questions linked to an exam
export const questions = sqliteTable("questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  question: text("question").notNull(),
  answers: text("answers", { mode: "json" }).$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  examId: text("exam_id").references(() => exams.id),
  variation: text("variation")
    .$default(() => "A")
    .notNull(),
  ...timestamps,
});

// 3. Proctoring Logs
export const proctorLogs = sqliteTable("proctor_logs", {
  id: text("id")
    .primaryKey() // Corrected to camelCase
    .$defaultFn(() => uuidv4()),
  examId: text("exam_id").references(() => exams.id),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  eventType: text("event_type").notNull(),
  ...timestamps,
});

export const classes = sqliteTable("classes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  ...timestamps,
});

export const students = sqliteTable("students", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  classId: text("class_id").references(() => classes.id),
  ...timestamps,
});

export const examSessions = sqliteTable("exam_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id),
  description: text("description").notNull(),
  classId: text("class_id")
    .notNull()
    .references(() => classes.id),
  // Store epoch milliseconds as integer
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time").notNull(),
  status: text("status").$default(() => "scheduled"),
  ...timestamps,
});
// 4. Student Answers for individual questions
export const answers = sqliteTable("answers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  answerIndex: integer("answer_index").notNull(),
  ...timestamps,
});
