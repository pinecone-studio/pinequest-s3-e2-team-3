// src/data/mock.ts

export interface Assignment {
  id: number;
  title: string;
  secondTitle: string; 
  classInfo: string;
  date: string;
  startTime: string;
  endTime: string;
}
export interface AssignmentState {
  upcoming: Assignment[];
  ongoing: Assignment[];
  finished: Assignment[];
}
export interface Student {
  name: string;
  score: string;
}

export const tabs = [
  "Авах ",
  "Дууссан шалгалтууд",
  "Эхэлсэн ",
] as const;

export const mockAssignments:AssignmentState = {
  upcoming: [
    {
      id: 1,
      title: "2-р улирлын шалгалт",
      secondTitle:"",
      classInfo: "Шалгалт авах анги: 11Б анги 214 тоот",
      date: "03/27/2026",
      startTime: "13:00",
      endTime: "14:00",
    },
    {
      id: 2,
      title: "Алгебрын илэрхийлэл сэдвийн шалгалт",
     secondTitle:"",
      classInfo: "Шалгалт авах анги: 9А анги 202 тоот",
      date: "04/15/2026",
      startTime: "14:30",
      endTime: "15:20",
    },
  ],

  ongoing: [
    {
      id: 3,
      title: "Явцын шалгалт",
      secondTitle: "",
      classInfo: "12В анги 210 тоот",
      date: "03/27/2026",
      startTime: "09:15",
      endTime: "10:10",
    },
    {
      id: 4,
      title: "1-р улирлын шалгалт",
      secondTitle: "",
      classInfo: "9А анги 202 тоот",
      date: "04/15/2026",
      startTime: "14:30",
      endTime: "15:20",
    },
  ],

  finished: [
    {
      id: 1,
      title: "2-р улирлын шалгалт",
      secondTitle:"",
      classInfo: "11Б анги 214 тоот",
      date: "03/27/2026",
      startTime: "13:00",
      endTime: "14:00",
    },
    
  ],

};

export const mockStudents: Student[] = [
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


