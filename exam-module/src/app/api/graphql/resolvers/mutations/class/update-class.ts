import { MutationResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const updateClass: MutationResolvers["updateClass"] = async (
  _,
  { id, name },
  context,
) => {
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

  const now = Date.now();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (name !== undefined && name !== null) {
    updates.push("name = ?");
    values.push(name);
  }
  if (hasUpdatedAt) {
    updates.push("updated_at = ?");
    values.push(now);
  }

  if (updates.length > 0) {
    await context.db
      .prepare(`UPDATE classes SET ${updates.join(", ")} WHERE id = ?;`)
      .bind(...values, id)
      .run();
  }

  const selectCols = ["id", "name"];
  if (hasCreatedAt) selectCols.push("created_at");
  if (hasUpdatedAt) selectCols.push("updated_at");

  const rowsRaw = await context.db
    .prepare(
      `SELECT ${selectCols.join(", ")} FROM classes WHERE id = ? LIMIT 1;`,
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

  if (!row) throw new Error("Class not found");

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

