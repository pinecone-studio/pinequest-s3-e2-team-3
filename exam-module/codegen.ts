import type { CodegenConfig } from "@graphql-codegen/cli";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";

import { classTypeDefs } from "./src/app/api/graphql/schemas/class-schema";
import { examTypeDefs } from "./src/app/api/graphql/schemas/exam-schema";
import { proctorLogsTypeDefs } from "./src/app/api/graphql/schemas/proctor-logs-schema";
import { questionsTypeDefs } from "./src/app/api/graphql/schemas/questions-schema";
import { sessionTypeDefs } from "./src/app/api/graphql/schemas/session";
import { staffTypeDefs } from "./src/app/api/graphql/schemas/staff-schema";
import { studentTypeDefs } from "./src/app/api/graphql/schemas/student-schema";
import { subjectTypeDefs } from "./src/app/api/graphql/schemas/subject-schema";

/** Same merge as `schemas/index.ts` — no running server required for deploy/CI. */
const schema = print(
  mergeTypeDefs([
    examTypeDefs,
    classTypeDefs,
    studentTypeDefs,
    sessionTypeDefs,
    proctorLogsTypeDefs,
    questionsTypeDefs,
    staffTypeDefs,
    subjectTypeDefs,
  ]),
);

const config: CodegenConfig = {
  schema,
  documents: ["src/**/*.graphql"],
  generates: {
    "./src/gql/graphql.tsx": {
      plugins: [
        "typescript",
        "typescript-resolvers",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        // CRITICAL: Set these to match your package.json versions
        apolloClientVersion: 3,
        useTypeImports: true,
        // This forces the generator to use the React-aware entry point
        importOperationSideEffect: true,
      },
    },
  },
};

export default config;
