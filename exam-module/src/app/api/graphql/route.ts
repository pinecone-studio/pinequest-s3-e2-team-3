import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from ".././graphql/schemas";
import { resolvers } from "./resolvers";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type { GraphQLContext } from "./graphql-context";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

export const runtime = "edge";

// Pass GraphQLContext to createYoga as a generic
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
    requestOrigin: new URL(request.url).origin,
    ...(ctx?.waitUntil
      ? {
          cfWaitUntil: ctx.waitUntil.bind(ctx) as (p: Promise<unknown>) => void,
        }
      : {}),
  });
}

export async function POST(request: Request) {
  const { env, ctx } = getRequestContext<{ DB: D1Database }>();
  return yoga.handleRequest(request, {
    db: env.DB,
    requestOrigin: new URL(request.url).origin,
    ...(ctx?.waitUntil
      ? {
          cfWaitUntil: ctx.waitUntil.bind(ctx) as (p: Promise<unknown>) => void,
        }
      : {}),
  });
}
