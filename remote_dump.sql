PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`class_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `students_email_unique` ON `students` (`email`);
CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
CREATE TABLE `exam_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`description` text NOT NULL,
	`class_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`status` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answers` text NOT NULL,
	`correct_index` integer NOT NULL,
	`exam_id` text,
	`variation` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `proctor_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text,
	`student_id` text NOT NULL,
	`event_type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer_index` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `__new_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "classes" ("id","name","created_at","updated_at") VALUES('63501efc-23d6-41ff-954e-1c326354169b','12A',1774451237867,1774451237867);
INSERT INTO "classes" ("id","name","created_at","updated_at") VALUES('75169101-e15c-49b9-8ac3-c9ab564fc0a1','11В - 312 тоот',1774525487897,1774525487897);
INSERT INTO "classes" ("id","name","created_at","updated_at") VALUES('d4d825ff-5f40-43f5-af8e-c675a4d1b2b3','10A - 202 тоот',1774525504194,1774525504194);
INSERT INTO "classes" ("id","name","created_at","updated_at") VALUES('6b28f447-f1bd-4283-8440-7b3d12ae6afd','11A- 204 тоот',1774526115957,1774526115957);
INSERT INTO "classes" ("id","name","created_at","updated_at") VALUES('a8ded88c-44af-44c6-82af-984d39552809','11B - 315 тоот',1774526154737,1774526154737);
INSERT INTO "classes" ("id","name","created_at","updated_at") VALUES('8b8962b6-adf8-4114-98f4-3951fd3fe51a','11Б - 214 тоот',1774537782968,1774537782968);
INSERT INTO "classes" ("id","name","created_at","updated_at") VALUES('24d0bbc1-6802-405b-812d-4c3e758d1dca','11В- 312 тоот',1774537791945,1774537791945);
INSERT INTO "students" ("id","name","email","class_id","created_at","updated_at") VALUES('ea015c90-9e60-4d99-b541-75056e0721fd','Ариунтөгөлдөр','ariuntuguldur20@gmail.com','63501efc-23d6-41ff-954e-1c326354169b',1774515490000,1774515490000);
INSERT INTO "students" ("id","name","email","class_id","created_at","updated_at") VALUES('b4e57df8-6281-42a3-b417-0b3cf82b4931','Тэмүүлэн','temuulen.b@gmail.com','75169101-e15c-49b9-8ac3-c9ab564fc0a1',1774525755000,1774525755000);
INSERT INTO "students" ("id","name","email","class_id","created_at","updated_at") VALUES('98dc7f4e-1e93-44bf-848f-d47834b47b19','Анударь','anu.ganbold@yahoo.com','d4d825ff-5f40-43f5-af8e-c675a4d1b2b3',1774525883000,1774525883000);
INSERT INTO "students" ("id","name","email","class_id","created_at","updated_at") VALUES('6dd8bf05-65d6-45fd-a613-000b27a0105f','Төгөлдөр','tuguldur2026@gmail.com','75169101-e15c-49b9-8ac3-c9ab564fc0a1',1774525924000,1774525924000);
INSERT INTO "students" ("id","name","email","class_id","created_at","updated_at") VALUES('1edea5b4-96c6-4edb-92f1-3a779fea331f','Сарнай','sarnai.enkhbat@outlook.com','d4d825ff-5f40-43f5-af8e-c675a4d1b2b3',1774525944000,1774525944000);
INSERT INTO "students" ("id","name","email","class_id","created_at","updated_at") VALUES('30cdac49-ca70-4dfa-9773-518ad34d695d','Билгүүн','m.bilguun@icloud.com','d4d825ff-5f40-43f5-af8e-c675a4d1b2b3',1774525964000,1774525964000);
INSERT INTO "exams" ("id","name","created_at","updated_at") VALUES('4f490e72-0976-4263-bd2f-bcbfceafed78','Logarithm',1774531906983,1774575910600);
INSERT INTO "exam_sessions" ("id","exam_id","description","class_id","start_time","end_time","status","created_at","updated_at") VALUES('ebf03508-d024-4d8a-95de-b4afce5125d3','4f490e72-0976-4263-bd2f-bcbfceafed78','25 onii hagas jil','63501efc-23d6-41ff-954e-1c326354169b',1774579500000,1774583100000,'scheduled',1774575960000,1774575960000);
INSERT INTO "exam_sessions" ("id","exam_id","description","class_id","start_time","end_time","status","created_at","updated_at") VALUES('e4b9a91b-4a3f-4b0b-9c04-9d7a93b47773','4f490e72-0976-4263-bd2f-bcbfceafed78','25 onii finals','63501efc-23d6-41ff-954e-1c326354169b',1774577220000,1774581000000,'scheduled',1774577265000,1774577265000);
INSERT INTO "exam_sessions" ("id","exam_id","description","class_id","start_time","end_time","status","created_at","updated_at") VALUES('3200307d-3f1c-435c-9690-0e501cf23d9b','4f490e72-0976-4263-bd2f-bcbfceafed78','2026 onii 3 sariin tuvshin togtooh','63501efc-23d6-41ff-954e-1c326354169b',1774581840000,1774585320000,'scheduled',1774581761000,1774581761000);
INSERT INTO "questions" ("id","question","answers","correct_index","exam_id","variation","created_at","updated_at") VALUES('94f7047f-8f95-48e8-896b-289d8ee9b58e','Log10(100)','["100","10","2"]',2,'4f490e72-0976-4263-bd2f-bcbfceafed78','A',1774531907000,1774575911056);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('c9eb9f2c-f436-44d6-bee1-d3469f44fa3d','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774580431000,1774580431000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('1205ea90-1605-43b0-adf7-fdb64f1d5b14','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774580435000,1774580435000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('7d64bce2-9f60-496b-a5f5-6eb80aab4665','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774580440000,1774580440000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('c85260fa-cf15-475a-8eb5-6e36f29d0930','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774580440000,1774580440000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('20824191-336f-449e-888a-184e7f2a06b4','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774580452000,1774580452000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('4773c295-c38a-4187-9953-ce7ed42f5792','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','tab_change',1774580453000,1774580453000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('e9c8b0c0-f1d1-4fc9-b85b-16c79db21d7b','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774580454000,1774580454000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('c2df8a1b-a111-45f6-ab43-42b2c634b1af','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774580578000,1774580578000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('54cdc68a-75e1-4ce3-b7af-511e9896cab6','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774581843000,1774581843000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('999567af-79ed-41f0-a266-2988eccf0043','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','tab_change',1774581844000,1774581844000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('e92c271a-fa27-4d92-922d-8c4d1ed02f33','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774581847000,1774581847000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('0dbb30df-fc4a-4542-89a6-ceae0b421456','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','no_face_detected',1774581848000,1774581848000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('3c529ab3-0b97-46cd-8b80-874f83ea5ce1','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774581850000,1774581850000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('e649cbda-0548-4667-8059-9fe9f0b69ce1','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774581852000,1774581852000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('867588f0-307f-4a75-b226-3504572fe5c5','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774581856000,1774581856000);
INSERT INTO "proctor_logs" ("id","exam_id","student_id","event_type","created_at","updated_at") VALUES('39f15aab-a7b8-4ff1-8b9b-aa0fd7802846','4f490e72-0976-4263-bd2f-bcbfceafed78','ea015c90-9e60-4d99-b541-75056e0721fd','human_speech_detected',1774581858000,1774581858000);
INSERT INTO "answers" ("id","student_id","exam_id","question_id","answer_index","created_at","updated_at") VALUES('ec26cf37-cedd-42d2-9886-959354faec0c','ea015c90-9e60-4d99-b541-75056e0721fd','4f490e72-0976-4263-bd2f-bcbfceafed78','94f7047f-8f95-48e8-896b-289d8ee9b58e',2,1774581855000,1774581855000);
INSERT INTO "__new_classes" ("id","name","created_at","updated_at") VALUES('0d43d1a3-3d1a-461d-a5f9-62987ed62d0b','12',1774449998980,1774449998980);
INSERT INTO "__new_classes" ("id","name","created_at","updated_at") VALUES('63501efc-23d6-41ff-954e-1c326354169b','12A',1774451237867,1774451237867);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0000_dapper_blue_shield.sql','2026-03-26 08:22:27');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0001_polite_snowbird.sql','2026-03-26 08:22:28');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(3,'0002_tidy_ben_grimm.sql','2026-03-26 08:27:35');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',3);
