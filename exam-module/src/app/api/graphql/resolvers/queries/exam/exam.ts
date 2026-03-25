import { QueryResolvers } from "@/gql/graphql";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000; // accept both seconds and milliseconds
  return new Date(ms).toISOString();
};

export const exams: QueryResolvers["exams"] = async (_, __, context) => {
  const tableInfoRaw = await context.db
    .prepare("PRAGMA table_info(exams);")
    .all();
  const tableInfo = Array.isArray(tableInfoRaw)
    ? tableInfoRaw
    : (tableInfoRaw as { results?: Array<{ name: string }> }).results ?? [];

  const columnNames = new Set(
    (tableInfo as Array<{ name: string }>).map((c) => c.name),
  );

  const hasName = columnNames.has("name");
  const hasTitle = columnNames.has("title");
  const hasCreatedAt = columnNames.has("created_at");
  const hasUpdatedAt = columnNames.has("updated_at");

  if (!hasName && !hasTitle) {
    throw new Error("Unsupported exams schema: missing `name`/`title` column");
  }

  const nameExpr = hasName ? "name" : "title";
  const selectParts = [
    "id",
    `${nameExpr} as name`,
    hasCreatedAt ? "created_at" : "0 as created_at",
    hasUpdatedAt ? "updated_at" : "0 as updated_at",
  ];

  const rowsRaw = await context.db
    .prepare(`SELECT ${selectParts.join(", ")} FROM exams;`)
    .all();

  const rows = Array.isArray(rowsRaw)
    ? rowsRaw
    : (rowsRaw as { results?: unknown[] }).results ?? [];

  return rows.map((row) => {
    const r = row as {
      id: string;
      name: string;
      created_at: number | string;
      updated_at: number | string;
    };

    // If created_at/updated_at weren't present, we used `0` above.
    // Avoid throwing on `0` and just return current time instead.
    const createdEpoch = hasCreatedAt ? r.created_at : Date.now();
    const updatedEpoch = hasUpdatedAt ? r.updated_at : createdEpoch;

    return {
      id: r.id,
      name: r.name,
      createdAt: epochToISOString(createdEpoch),
      updatedAt: epochToISOString(updatedEpoch),
    };
  });
};
