export interface StudentResult {
  name: string;
  score: string;
}

export interface AnswerOption {
  label: string;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id: number;
  text: string;
  score: number;
  image?: string;
  options: AnswerOption[];
}

export interface StudentDetail {
  name: string;
  variant: string;
  correct: number;
  total: number;
  percent: string;
  questions: ExamQuestion[];
}

export const mockStudentDetails: Record<string, StudentDetail> = {
  "А.Анүжин": {
    name: "А.Анүжин",
    variant: "А Вариант",
    correct: 15,
    total: 12,
    percent: "80%",
    questions: [
      {
        id: 1,
        text: "21*10⁷*(12*10⁻⁸) Утгыг ол.",
        score: 2,
        options: [
          { label: "А", text: "14.2", isSelected: false, isCorrect: false },
          { label: "Б", text: "15", isSelected: false, isCorrect: false },
          { label: "В", text: "25.2", isSelected: true, isCorrect: true },
          { label: "Г", text: "14", isSelected: false, isCorrect: false },
        ],
      },
      {
        id: 2,
        text: "Квадрат функцийн графикийг сонгоорой.",
        score: 1,
        options: [
          { label: "А", text: "Гипербол", isSelected: true, isCorrect: false },
          { label: "Б", text: "Парабол", isSelected: false, isCorrect: true },
          { label: "В", text: "Шулуун", isSelected: false, isCorrect: false },
          { label: "Г", text: "Тойрог", isSelected: false, isCorrect: false },
        ],
      },
      {
        id: 3,
        text: "{ x-y=-1\n  2x-2y=5  тэгшитгэлийн системийг бод.",
        score: 2,
        options: [
          { label: "А", text: "(1 ; 2)", isSelected: false, isCorrect: false },
          { label: "Б", text: "Θ", isSelected: true, isCorrect: true },
          { label: "В", text: "(-3 ; -2)", isSelected: false, isCorrect: false },
          { label: "Г", text: "(5 ; 6)", isSelected: false, isCorrect: false },
        ],
      },
      {
        id: 4,
        text: "Зурагт үзүүлсэн функцийн графикийн тэгшитгэл аль нь вэ?",
        score: 1,
        options: [
          { label: "А", text: "y = 1/2x", isSelected: false, isCorrect: false },
          { label: "Б", text: "y = 6/x", isSelected: true, isCorrect: true },
          { label: "В", text: "y = x²", isSelected: false, isCorrect: false },
          { label: "Г", text: "y = 2x", isSelected: false, isCorrect: false },
        ],
      },
    ],
  },
  "Г.Анүжин": {
    name: "Г.Анүжин",
    variant: "Б Вариант",
    correct: 12,
    total: 15,
    percent: "80%",
    questions: [
      {
        id: 1,
        text: "21*10⁷*(12*10⁻⁸) Утгыг ол.",
        score: 2,
        options: [
          { label: "А", text: "14.2", isSelected: false, isCorrect: false },
          { label: "Б", text: "15", isSelected: true, isCorrect: false },
          { label: "В", text: "25.2", isSelected: false, isCorrect: true },
          { label: "Г", text: "14", isSelected: false, isCorrect: false },
        ],
      },
      {
        id: 2,
        text: "Квадрат функцийн графикийг сонгоорой.",
        score: 1,
        options: [
          { label: "А", text: "Гипербол", isSelected: false, isCorrect: false },
          { label: "Б", text: "Парабол", isSelected: true, isCorrect: true },
          { label: "В", text: "Шулуун", isSelected: false, isCorrect: false },
          { label: "Г", text: "Тойрог", isSelected: false, isCorrect: false },
        ],
      },
    ],
  },
};

export const mockStudents: StudentResult[] = [
  { name: "А.Анүжин", score: "95%" },
  { name: "Г.Анүжин", score: "80%" },
  { name: "Батбаяр", score: "73%" },
  { name: "Барсболд", score: "81%" },
  { name: "Даваабилэг", score: "79%" },
  { name: "Доваажаргал", score: "70%" },
  { name: "М.Билгүүн", score: "70%" },
  { name: "Г.Билгүүн", score: "70%" },
  { name: "Дэлгэрзаяа", score: "86%" },
  { name: "Мөнхтайван", score: "80%" },
];