import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts', // Correct: Start from the root of the project
  out: './drizzle',             // Correct: Puts migrations in a 'drizzle' folder at the root
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: '8341d4b31e574cb9873ce1bb80671685',
    token: 'SbYseBcRUiFDrLdJOHllbxitdJa9GaKub3FcfTWs',
    databaseId: 'cdc7508a-838c-4498-9c2d-63f576e8c3df',
  },
});