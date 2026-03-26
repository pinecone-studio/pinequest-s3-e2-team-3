import type { Question } from "./mock";

export function buildQuestionPayload(q: Question): {
  question: string;
  answers: string[];
  correctIndex: number;
} | null {
  const text = q.text.trim();
  if (!text) return null;

  const trimmed = q.answers.map((a) => a.trim());
  const answers = trimmed.filter((a) => a.length > 0);
  if (answers.length < 2) return null;

  const correctText = trimmed[q.correctIndex]?.trim();
  if (!correctText) return null;

  const correctIndex = answers.indexOf(correctText);
  if (correctIndex < 0) return null;

  return { question: text, answers, correctIndex };
}
