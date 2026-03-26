export interface Material {
  id: number;
  title: string;
  date: string;
  gradient: string;
}

export interface Question {
  id: number;
  text: string;
  answers: string[];
  score: number;
}

export const mockMaterials: Material[] = [
  { id: 1, title: "11-р анги Сонгоны шалгалт", date: "2026.04.12", gradient: "linear-gradient(135deg,#c3b1e1,#8b9dd4)" },
  { id: 2, title: "10-р анги II улиралын шалгалт", date: "2026.03.30", gradient: "linear-gradient(135deg,#a8c0e8,#7b9fd4)" },
  { id: 3, title: "12-р анги 100 Бодлогын тест", date: "2026.04.17", gradient: "linear-gradient(135deg,#9bb8e0,#6fa3d8)" },
  { id: 4, title: "12-р анги ЭЕШ тест 1", date: "2026.04.19", gradient: "linear-gradient(135deg,#b8a8d8,#9088c8)" },
  { id: 5, title: "11-р анги Алгебрын шалгалт", date: "2026.04.21", gradient: "linear-gradient(135deg,#c0b0e0,#9878c8)" },
  { id: 6, title: "10-р анги Дэвших шалгалт", date: "2026.04.22", gradient: "linear-gradient(135deg,#a0b8e8,#7898d8)" },
];
