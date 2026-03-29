import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: integer("created_at")
    .default(sql`(unixepoch() * 1000)`)
    .notNull(),
  updatedAt: integer("updated_at")
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => Date.now())
    .notNull(),
};

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"teacher" | "manager">().notNull(),
  subjects: text("subjects", { mode: "json" }).$type<string[]>().default([]),
  classIds: text("class_ids", { mode: "json" }).$type<string[]>().default([]),
  ...timestamps,
});

export const subjects = sqliteTable("subjects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  ...timestamps,
});

export const topics = sqliteTable("topics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const exams = sqliteTable("exams", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  creatorId: text("creator_id").references(() => users.id),
  isPublic: integer("is_public", { mode: "boolean" }).default(false).notNull(),

  subjectId: text("subject_id").references(() => subjects.id),
  topicId: text("topic_id").references(() => topics.id),

  parentId: text("parent_id"),
  ...timestamps,
});

export const questions = sqliteTable("questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answers: text("answers", { mode: "json" }).$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  variation: text("variation")
    .$default(() => "A")
    .notNull(),
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
  phone: text("phone").unique().notNull(),
  classId: text("class_id")
    .references(() => classes.id, { onDelete: "cascade" })
    .notNull(),
  ...timestamps,
});

export const examSessions = sqliteTable("exam_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id),
  classId: text("class_id")
    .notNull()
    .references(() => classes.id),
  creatorId: text("creator_id")
    .references(() => users.id)
    .notNull(),
  description: text("description").notNull(),
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time").notNull(),
  ...timestamps,
});

export const studentSessionStatus = sqliteTable("student_session_status", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  sessionId: text("session_id")
    .notNull()
    .references(() => examSessions.id, { onDelete: "cascade" }),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  isStarted: integer("is_started", { mode: "boolean" })
    .default(false)
    .notNull(),
  isFinished: integer("is_finished", { mode: "boolean" })
    .default(false)
    .notNull(),
  ...timestamps,
});

export const proctorLogs = sqliteTable("proctor_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  sessionId: text("session_id").references(() => examSessions.id),
  studentId: text("student_id").references(() => students.id),
  eventType: text("event_type").notNull(),
  ...timestamps,
});

export const studentAnswers = sqliteTable("student_answers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  studentId: text("student_id").references(() => students.id),
  sessionId: text("session_id").references(() => examSessions.id),
  examId: text("exam_id").references(() => exams.id),
  questionId: text("question_id").references(() => questions.id),
  answerIndex: integer("answer_index").notNull(),
  ...timestamps,
});
