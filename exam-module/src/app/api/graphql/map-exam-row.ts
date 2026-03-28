import { exams } from "@/db/schema";

type ExamRow = typeof exams.$inferSelect;

const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

export function mapExamRowToGraphQL(row: ExamRow) {
  return {
    id: row.id,
    name: row.name,
    creatorId: row.creatorId,
    isPublic: row.isPublic,
    subjectId: row.subjectId,
    topicId: row.topicId,
    parentId: row.parentId ?? null,
    createdAt: epochToISOString(row.createdAt),
    updatedAt: epochToISOString(row.updatedAt),
  };
}
