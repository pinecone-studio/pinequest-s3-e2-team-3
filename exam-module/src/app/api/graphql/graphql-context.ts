/** GraphQL Yoga context passed to resolvers (built in `route.ts`). */
export interface GraphQLContext {
  db: D1Database;
  /** `new URL(request.url).origin` from the incoming GraphQL HTTP request. */
  requestOrigin: string;
  /** Cloudflare executionContext.waitUntil (avoid naming collision with Yoga adapter). */
  cfWaitUntil?: (promise: Promise<unknown>) => void;
}
