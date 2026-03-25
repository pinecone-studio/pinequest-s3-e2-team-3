import { MutationResolvers } from "@/gql/graphql";
import { v4 as uuidv4 } from "uuid";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const createClass: MutationResolvers["createClass"] = async (
  _,
  { name },
  context,
) => {
  const id = uuidv4();
  const now = Date.now();

  // Handle both schema variants by checking runtime table columns.
  const tableInfoRaw = await context.db
    .prepare("PRAGMA table_info(classes);")
    .all();
  const tableInfo = Array.isArray(tableInfoRaw)
    ? tableInfoRaw
    : (tableInfoRaw as { results?: Array<{ name: string }> }).results ?? [];

  const columnNames = new Set(
    (tableInfo as Array<{ name: string }>).map((c) => c.name),
  );

  const hasName = columnNames.has("name");
  const hasCreatedAt = columnNames.has("created_at");
  const hasUpdatedAt = columnNames.has("updated_at");
  if (!hasName) throw new Error("Unsupported classes schema: missing `name`");

  const insertColumns: string[] = ["id", "name"];
  const insertValues: unknown[] = [id, name];
  if (hasCreatedAt) {
    insertColumns.push("created_at");
    insertValues.push(now);
  }
  if (hasUpdatedAt) {
    insertColumns.push("updated_at");
    insertValues.push(now);
  }

  const placeholders = insertValues.map(() => "?").join(", ");
  await context.db
    .prepare(
      `INSERT INTO classes (${insertColumns.join(
        ", ",
      )}) VALUES (${placeholders});`,
    )
    .bind(...insertValues)
    .run();

  const selectColumns = ["id", "name"];
  if (hasCreatedAt) selectColumns.push("created_at");
  if (hasUpdatedAt) selectColumns.push("updated_at");

  const rowsRaw = await context.db
    .prepare(
      `SELECT ${selectColumns.join(
        ", ",
      )} FROM classes WHERE id = ? LIMIT 1;`,
    )
    .bind(id)
    .all();

  const rows = Array.isArray(rowsRaw)
    ? rowsRaw
    : (rowsRaw as { results?: unknown[] }).results ?? [];

  const row = rows[0] as
    | {
        id: string;
        name: string;
        created_at?: number | string;
        updated_at?: number | string;
      }
    | undefined;

  if (!row) throw new Error("Class not created");

  const createdEpoch = hasCreatedAt ? row.created_at : now;
  const updatedEpoch = hasUpdatedAt
    ? row.updated_at
    : hasCreatedAt
      ? row.created_at
      : now;

  return {
    id: row.id,
    name: row.name,
    createdAt: epochToISOString(createdEpoch),
    updatedAt: epochToISOString(updatedEpoch),
  };
};
