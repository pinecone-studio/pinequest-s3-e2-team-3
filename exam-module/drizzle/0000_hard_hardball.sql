CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`duration_minutes` integer NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `proctor_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exam_id` text,
	`student_id` text NOT NULL,
	`event_type` text NOT NULL,
	`timestamp` integer,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text,
	`content` text NOT NULL,
	`correct_answer` text NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
