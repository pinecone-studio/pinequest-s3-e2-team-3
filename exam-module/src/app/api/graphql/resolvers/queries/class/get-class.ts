import { QueryResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

const getClass: QueryResolvers["class"] = async (_, { id }, context) => {
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
  const selectParts = [
    "id",
    "name",
    hasCreatedAt ? "created_at" : `${now} as created_at`,
    hasUpdatedAt ? "updated_at" : `${now} as updated_at`,
  ];

  const rowsRaw = await context.db
    .prepare(
      `SELECT ${selectParts.join(
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

  if (!row) return null;

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

export { getClass as class };

