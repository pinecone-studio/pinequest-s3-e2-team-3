// ─── Types ────────────────────────────────────────────────────────────────────
export interface Student      { id: string; name: string; score: number; variant: string }
export interface Question     { no: number; text: string; score: number; options: string[]; correct: string }
export interface QuestionStat { q: string; wrong: number }

export interface GeneratedTask {
  title:          string;
  why:            string;
  problem:        string;
  hint:           string;
  difficulty:     "easy" | "medium" | "hard";
  targetStudents: string[];
}

export interface QuestionAnalysis {
  rootCause:   string;
  commonError: string;
  tasks:       GeneratedTask[];
}

export interface HardQuestion {
  stat:      QuestionStat;
  question?: Question;
  analysis?: QuestionAnalysis;
  loading:   boolean;
  error:     string;
}

export interface AIReport {
  summary:               string;
  weakTopic:             string;
  weakTopicReason:       string;
  recommendation:        string;
  positiveNote:          string;
  trendingMisconception: string;
  classHealthScore:      number;
  nextLessonPlan:        string;
  atRiskStudents:        { name: string; reason: string }[];
  studentDiagnostics: {
    name:                  string;
    score:                 number;
    riskLevel:             "high" | "medium" | "low";
    knowledgeGaps:         string[];
    trendingMisconception: string;
    strengths:             string[];
    learningPath:          { step: number; action: string; type: "practice" | "review" | "challenge" }[];
  }[];
}

export interface MaterialTabProps {
  classId:   string;
  className?: string;
  students?:  { id: string; name: string }[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
export const STUDENTS: Student[] = [
  { id: "1", name: "А.Анужин",  score: 95, variant: "А" },
  { id: "2", name: "Г.Анужин",  score: 80, variant: "Б" },
  { id: "3", name: "Батбаяр",   score: 73, variant: "А" },
  { id: "4", name: "Барсболд",  score: 81, variant: "Б" },
  { id: "5", name: "Д.Анужин",  score: 67, variant: "А" },
];

export const QUESTIONS: Question[] = [
  { no: 1,  text: "21×10⁷ × (12×10⁻⁸) утгыг ол.",        score: 2, options: ["А. 14.2","Б. 15","В. 25.2","Г. 14"],               correct: "В" },
  { no: 2,  text: "Квадрат функцийн графикийг сонгоорой.", score: 1, options: ["А. Гипербол","Б. Парабол","В. Шулуун","Г. Тойрог"], correct: "Б" },
  { no: 3,  text: "log₂(8) = ?",                           score: 1, options: ["А. 2","Б. 4","В. 3","Г. 8"],                       correct: "В" },
  { no: 8,  text: "sin(90°) + cos(0°) = ?",                score: 2, options: ["А. 0","Б. 1","В. 2","Г. √2"],                      correct: "В" },
  { no: 12, text: "2x + 5 = 13 бол x = ?",                 score: 1, options: ["А. 3","Б. 4","В. 5","Г. 9"],                       correct: "Б" },
];

export const Q_STATS: QuestionStat[] = [
  { q: "А-1",  wrong: 8  }, { q: "А-2",  wrong: 15 }, { q: "А-3",  wrong: 3  },
  { q: "А-4",  wrong: 4  }, { q: "А-5",  wrong: 11 }, { q: "А-6",  wrong: 6  },
  { q: "А-7",  wrong: 5  }, { q: "А-8",  wrong: 20 }, { q: "А-9",  wrong: 12 },
  { q: "А-10", wrong: 11 }, { q: "А-11", wrong: 11 }, { q: "А-12", wrong: 13 },
  { q: "А-13", wrong: 4  }, { q: "А-14", wrong: 13 }, { q: "А-15", wrong: 11 },
];

export const CLASS_AVG = Math.round(
  STUDENTS.reduce((s, g) => s + g.score, 0) / STUDENTS.length,
);

export function getTopHard(n = 3): HardQuestion[] {
  return [...Q_STATS]
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, n)
    .map((stat) => {
      const qNo     = parseInt(stat.q.replace("А-", ""), 10);
      const question = QUESTIONS.find((q) => q.no === qNo);
      return { stat, question, analysis: undefined, loading: false, error: "" };
    });
}
