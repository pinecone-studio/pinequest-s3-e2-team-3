import { FileDown } from "lucide-react";

const MOCK_GRADES = [
  { id: "1", name: "Гансүх Анужин", quiz1: 90, quiz2: 85, exam: 92 },
  { id: "2", name: "Бат-Эрдэнэ Тэмүүлэн", quiz1: 75, quiz2: 80, exam: 88 },
  { id: "3", name: "Энхболд Сондор", quiz1: 100, quiz2: 95, exam: 98 },
];

export const GradesTab = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b text-gray-400 text-sm">
          <th className="py-4 font-medium">Сурагчийн нэр</th>
          <th className="py-4 font-medium text-center">Шалгалт 1</th>
          <th className="py-4 font-medium text-center">Шалгалт 2</th>
          <th className="py-4 font-medium text-center">Улирлын дүн</th>
          <th className="py-4 font-medium text-right"></th>
        </tr>
      </thead>
      <tbody>
        {MOCK_GRADES.map((g) => (
          <tr key={g.id} className="border-b last:border-0 hover:bg-gray-50">
            <td className="py-4 font-medium text-gray-700">{g.name}</td>
            <td className="py-4 text-center text-gray-600">{g.quiz1}</td>
            <td className="py-4 text-center text-gray-600">{g.quiz2}</td>
            <td className="py-4 text-center font-bold text-[#5136a8]">
              {g.exam}
            </td>
            <td className="py-4 text-right">
              <FileDown
                size={18}
                className="text-gray-400 inline cursor-pointer"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
