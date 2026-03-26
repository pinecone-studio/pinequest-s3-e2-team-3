import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from ".././graphql/schemas";
import { resolvers } from "./resolvers";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// 1. Define the shape of your custom context
interface GraphQLContext {
  db: D1Database;
  /** Cloudflare executionContext.waitUntil (avoid naming collision with Yoga adapter). */
  cfWaitUntil?: (promise: Promise<unknown>) => void;
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
  const { env, ctx } = getRequestContext<{ DB: D1Database }>();
  return yoga.handleRequest(request, {
    db: env.DB,
    ...(ctx?.waitUntil
      ? {
          cfWaitUntil: ctx.waitUntil.bind(ctx) as (
            p: Promise<unknown>,
          ) => void,
        }
      : {}),
  });
}

export async function POST(request: Request) {
  const { env, ctx } = getRequestContext<{ DB: D1Database }>();
  return yoga.handleRequest(request, {
    db: env.DB,
    ...(ctx?.waitUntil
      ? {
          cfWaitUntil: ctx.waitUntil.bind(ctx) as (
            p: Promise<unknown>,
          ) => void,
        }
      : {}),
  });
}
