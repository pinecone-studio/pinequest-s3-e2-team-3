import { mergeTypeDefs } from "@graphql-tools/merge";
import { examTypeDefs } from "./exam-schema";

export * from "./exam-schema";
export const typeDefs = mergeTypeDefs([examTypeDefs]);
