import * as Mutation from "./mutations";
import * as Query from "./queries";

export const resolvers = {
  Query: {
    ...Query,
  },
  Mutation: {
    ...Mutation,
  },
};
