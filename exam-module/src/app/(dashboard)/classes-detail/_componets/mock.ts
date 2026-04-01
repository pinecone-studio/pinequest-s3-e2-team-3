// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  score: number;      // 0–100 тооцоолсон
  variant: string;    // variation (А, Б, ...)
}

export interface Question {
  id: string;
  no: number;         // display number (1-based index)
  text: string;
  score: number;
  options: string[];
  correct: number;    // correctIndex (0-based)
  variation: string;
  attachmentUrl?: string | null;
}

export interface QuestionStat {
  q: string;    // "А-1", "А-2" ...
  wrong: number;
}

export interface GeneratedTask {
  title: string;
  why: string;
  problem: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  targetStudents: string[];
}

export interface QuestionAnalysis {
  rootCause: string;
  commonError: string;
  tasks: GeneratedTask[];
}

export interface HardQuestion {
  stat: QuestionStat;
  question?: Question;
  analysis?: QuestionAnalysis;
  loading: boolean;
  error: string;
}

export interface AIReport {
  summary: string;
  weakTopic: string;
  weakTopicReason: string;
  recommendation: string;
  positiveNote: string;
  trendingMisconception: string;
  classHealthScore: number;
  nextLessonPlan: string;
  atRiskStudents: { name: string; reason: string }[];
  studentDiagnostics: {
    name: string;
    score: number;
    riskLevel: "high" | "medium" | "low";
    knowledgeGaps: string[];
    trendingMisconception: string;
    strengths: string[];
    learningPath: {
      step: number;
      action: string;
      type: "practice" | "review" | "challenge";
    }[];
  }[];
}

export interface MaterialTabProps {
  classId: string;
  className?: string;
  // Finished session-аас дамжиж ирнэ
  examSessionId?: string;
  examId?: string;
  students?: { id: string; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTopHard(stats: QuestionStat[], questions: Question[], n = 3): HardQuestion[] {
  return [...stats]
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, n)
    .map((stat) => {
      const idx = parseInt(stat.q.replace(/^[^-]+-/, ""), 10) - 1;
      const question = questions[idx];
      return { stat, question, analysis: undefined, loading: false, error: "" };
    });
}

export function calcClassAvg(students: Student[]): number {
  if (!students.length) return 0;
  return Math.round(students.reduce((s, g) => s + g.score, 0) / students.length);
}
