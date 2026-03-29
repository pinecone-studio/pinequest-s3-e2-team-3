ALTER TABLE `exam_sessions` ADD `creator_id` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `students` ADD `phone` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `students_phone_unique` ON `students` (`phone`);--> statement-breakpoint
ALTER TABLE `users` ADD `class_ids` text DEFAULT '[]';