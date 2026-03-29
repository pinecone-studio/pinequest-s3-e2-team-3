export interface Material {
  id: string;
  title: string;
  date: string;
  gradient: string;
}

/** Same palette as the old mock cards — pick by exam id for stable colors. */
const CARD_GRADIENTS = [
  "linear-gradient(135deg,#c3b1e1,#8b9dd4)",
  "linear-gradient(135deg,#a8c0e8,#7b9fd4)",
  "linear-gradient(135deg,#9bb8e0,#6fa3d8)",
  "linear-gradient(135deg,#b8a8d8,#9088c8)",
  "linear-gradient(135deg,#c0b0e0,#9878c8)",
  "linear-gradient(135deg,#a0b8e8,#7898d8)",
] as const;

export function gradientForExamId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return CARD_GRADIENTS[Math.abs(h) % CARD_GRADIENTS.length];
}

export function formatExamCardDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export interface Question {
  id: number;
  text: string;
  answers: string[];
  /** Display-only; persisted questions use `correctIndex` for scoring. */
  score: number;
  /** Index into `answers` for the correct choice (must be non-empty when saving). */
  correctIndex: number;
  /** Present when this row exists in the database. */
  dbId?: string;
  /** Bank variation label (A, B, …). */
  variation?: string;
}

