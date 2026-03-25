import { MutationResolvers } from "@/gql/graphql";
import { v4 as uuidv4 } from "uuid";

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export const createExam: MutationResolvers["createExam"] = async (
  _,
  { name },
  context,
) => {
  const id = uuidv4();

  const now = Date.now();

  // Use native D1 API to avoid Drizzle/D1 insert execution issues.
  // Also handle schema variants by introspecting available columns.
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
  const hasDurationMinutes = columnNames.has("duration_minutes");
  const hasCreatedAt = columnNames.has("created_at");
  const hasUpdatedAt = columnNames.has("updated_at");

  if (!hasName && !hasTitle) {
    throw new Error("Unsupported exams schema: missing `name`/`title` column");
  }
  if (!hasName && !hasDurationMinutes) {
    throw new Error(
      "Unsupported legacy exams schema: missing `duration_minutes` column",
    );
  }

  const insertColumns: string[] = ["id"];
  const insertValues: unknown[] = [id];

  if (hasName) {
    insertColumns.push("name");
    insertValues.push(name);
  } else {
    insertColumns.push("title");
    insertValues.push(name);
    insertColumns.push("duration_minutes");
    insertValues.push(0);
  }

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
      `INSERT INTO exams (${insertColumns.join(
        ", ",
      )}) VALUES (${placeholders})`,
    )
    .bind(...insertValues)
    .run();

  const nameExpr = hasName ? "name" : "title";
  const selectColumns = [`id`, `${nameExpr} as name`];
  if (hasCreatedAt) selectColumns.push("created_at");
  if (hasUpdatedAt) selectColumns.push("updated_at");

  const rows = await context.db
    .prepare(
      `SELECT ${selectColumns.join(
        ", ",
      )} FROM exams WHERE id = ? LIMIT 1`,
    )
    .bind(id)
    .all();

  const rowsNormalized = Array.isArray(rows)
    ? rows
    : (rows as { results?: unknown[] }).results ?? [];

  const created = rowsNormalized[0] as
    | {
        id: string;
        name: string;
        created_at?: number | string;
        updated_at?: number | string;
      }
    | undefined;

  if (!created) throw new Error("Exam not created");

  const createdRaw = hasCreatedAt ? created.created_at : now;
  const updatedRaw = hasUpdatedAt
    ? created.updated_at
    : hasCreatedAt
      ? created.created_at
      : now;

  return {
    id: created.id,
    name: created.name,
    createdAt: epochToISOString(createdRaw),
    updatedAt: epochToISOString(updatedRaw),
  };
};
