import { deriveExamSessionStatusFromRowTimes } from "@/lib/exam-session-derived-status";
import * as Mutation from "./mutations";
import * as Query from "./queries";

export const resolvers = {
  Query: {
    ...Query,
  },
  Mutation: {
    ...Mutation,
  },
  ExamSession: {
    status(parent: { startTime: string; endTime: string }) {
      return deriveExamSessionStatusFromRowTimes(
        new Date(parent.startTime).getTime(),
        new Date(parent.endTime).getTime(),
      );
    },
  },
};
