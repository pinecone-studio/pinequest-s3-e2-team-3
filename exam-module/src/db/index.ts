import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * In Cloudflare Workers/Pages, the database connection (D1) 
 * is passed through the 'env' object. This function initializes 
 * Drizzle using that connection.
 */
export const getDb = (d1: D1Database) => {
  return drizzle(d1, { schema });
};