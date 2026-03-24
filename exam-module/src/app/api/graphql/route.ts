import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from ".././graphql/schemas";
import { resolvers } from "./resolvers";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// 1. Define the shape of your custom context
interface GraphQLContext {
  db: D1Database;
}

// 2. Pass that interface to createYoga as a generic
const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});

export async function GET(request: Request) {
  const { env } = getRequestContext<{ DB: D1Database }>();
  // Now TypeScript knows that { db: env.DB } is valid!
  return yoga.handleRequest(request, { db: env.DB });
}

export async function POST(request: Request) {
  // 1. Tell TypeScript exactly what 'env' contains
  const { env } = getRequestContext<{ DB: D1Database }>();

  // 2. Pass it into the Yoga context using the key 'db'
  // (This matches your interface GraphQLContext { db: D1Database })
  return yoga.handleRequest(request, { db: env.DB });
}
