PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE `proctor_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exam_id` text,
	`student_id` text NOT NULL,
	`event_type` text NOT NULL,
	`timestamp` integer,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text,
	`content` text NOT NULL,
	`correct_answer` text NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		);
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL);
INSERT INTO "classes" ("id","name") VALUES('1','12A');
CREATE TABLE IF NOT EXISTS "exams" (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`class_id` text,
	`duration_minutes` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "exams" ("id","title","description","class_id","duration_minutes","created_at") VALUES('028519ab-f21b-475a-a187-0d98396d6308','IELTS Mock Test - Speaking',NULL,NULL,15,1774276392);
INSERT INTO "exams" ("id","title","description","class_id","duration_minutes","created_at") VALUES('84a913d3-21c9-416d-82bc-a3e59f978fe9','does it work for remote db',NULL,NULL,2,1774408873);
CREATE TABLE IF NOT EXISTS "students" (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "students" ("id","class_id","name","email") VALUES('2','1','hulan','hulan@gmail.com');
DELETE FROM sqlite_sequence;
CREATE UNIQUE INDEX `students_email_unique` ON `students` (`email`);
