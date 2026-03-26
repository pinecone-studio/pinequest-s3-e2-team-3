PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_classes`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `classes`;--> statement-breakpoint
DROP TABLE `classes`;--> statement-breakpoint
ALTER TABLE `__new_classes` RENAME TO `classes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_exam_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`description` text NOT NULL,
	`class_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`status` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exam_sessions`("id", "exam_id", "description", "class_id", "start_time", "end_time", "status", "created_at", "updated_at") SELECT "id", "exam_id", "description", "class_id", "start_time", "end_time", "status", "created_at", "updated_at" FROM `exam_sessions`;--> statement-breakpoint
DROP TABLE `exam_sessions`;--> statement-breakpoint
ALTER TABLE `__new_exam_sessions` RENAME TO `exam_sessions`;--> statement-breakpoint
CREATE TABLE `__new_exams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_exams`("id", "name", "created_at", "updated_at") SELECT "id", "name", "created_at", "updated_at" FROM `exams`;--> statement-breakpoint
DROP TABLE `exams`;--> statement-breakpoint
ALTER TABLE `__new_exams` RENAME TO `exams`;--> statement-breakpoint
CREATE TABLE `__new_proctor_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text,
	`student_id` text NOT NULL,
	`event_type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_proctor_logs`("id", "exam_id", "student_id", "event_type", "created_at", "updated_at") SELECT "id", "exam_id", "student_id", "event_type", "created_at", "updated_at" FROM `proctor_logs`;--> statement-breakpoint
DROP TABLE `proctor_logs`;--> statement-breakpoint
ALTER TABLE `__new_proctor_logs` RENAME TO `proctor_logs`;--> statement-breakpoint
CREATE TABLE `__new_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answers` text NOT NULL,
	`correct_index` integer NOT NULL,
	`exam_id` text,
	`variation` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_questions`("id", "question", "answers", "correct_index", "exam_id", "variation", "created_at", "updated_at") SELECT "id", "question", "answers", "correct_index", "exam_id", "variation", "created_at", "updated_at" FROM `questions`;--> statement-breakpoint
DROP TABLE `questions`;--> statement-breakpoint
ALTER TABLE `__new_questions` RENAME TO `questions`;--> statement-breakpoint
CREATE TABLE `__new_students` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`class_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_students`("id", "name", "email", "class_id", "created_at", "updated_at") SELECT "id", "name", "email", "class_id", "created_at", "updated_at" FROM `students`;--> statement-breakpoint
DROP TABLE `students`;--> statement-breakpoint
ALTER TABLE `__new_students` RENAME TO `students`;--> statement-breakpoint
CREATE UNIQUE INDEX `students_email_unique` ON `students` (`email`);