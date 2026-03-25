import { mergeTypeDefs } from "@graphql-tools/merge";
import { examTypeDefs } from "./exam-schema";
import { classTypeDefs } from "./class-schema";
import { studentTypeDefs } from "./student-schema";
import { sessionTypeDefs } from "./session";
import { proctorLogsTypeDefs } from "./proctor-logs-schema";
import { questionsTypeDefs } from "./questions-schema";

export * from "./exam-schema";
export const typeDefs = mergeTypeDefs([
  examTypeDefs,
  classTypeDefs,
  studentTypeDefs,
  sessionTypeDefs,
  proctorLogsTypeDefs,
  questionsTypeDefs,
]);
