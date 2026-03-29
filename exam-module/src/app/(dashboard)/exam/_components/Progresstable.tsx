// import { mockStudents } from "./mock";

// export default function ProgressTable() {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-200 p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h3 className="font-semibold text-lg">Явцын шалгалт</h3>
//           <p className="text-sm text-gray-500">12В анги 210 тоот</p>
//         </div>
//         <div className="text-right">
//           <p className="text-sm text-gray-500">Нийт сурагчид</p>
//           <p className="font-medium">210 тоот</p>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full min-w-full">
//           <thead>
//             <tr className="border-b">
//               <th className="text-left py-3 font-medium text-gray-600">Сурагчдын нэрс</th>
//               <th className="text-right py-3 font-medium text-gray-600">Авсан дүн</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {mockStudents.map((student, i) => (
//               <tr key={i} className="hover:bg-gray-50">
//                 <td className="py-4 text-gray-900 font-medium">{student.name}</td>
//                 <td className="py-4 text-right font-semibold text-gray-700">
//                   {student.score}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { mockStudents, mockStudentDetails } from "./studentmock";
import StudentDetailPanel from "./Studentdetailpanel";

interface ProgressTableProps {
  examTitle?: string;
  classInfo?: string;
}
 
export default function ProgressTable({
  examTitle = "Явцын шалгалт",
  classInfo = "12В анги 210 тоот",
}: ProgressTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const detail = selectedStudent ? mockStudentDetails[selectedStudent] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left - Student list */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-900">{examTitle}</h3>
          <p className="text-sm text-gray-500">{classInfo}</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 text-sm font-medium text-gray-600">
                Сурагчдын нэрс
              </th>
              <th className="text-right py-3 text-sm font-medium text-gray-600">
                Авсан дүн
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockStudents.map((student, i) => (
              <tr
                key={i}
                onClick={() => setSelectedStudent(student.name)}
                className={`cursor-pointer transition-colors ${
                  selectedStudent === student.name
                    ? "bg-purple-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="py-3.5 text-gray-900 font-medium text-sm">
                  {student.name}
                </td>
                <td className="py-3.5 text-right font-semibold text-gray-700 text-sm">
                  {student.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right - Detail panel */}
      <div>
        {detail ? (
          <StudentDetailPanel
            detail={detail}
            examTitle={examTitle}
            classInfo={classInfo}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full flex items-center justify-center">
            <p className="text-sm text-gray-400">
              Сурагч сонгоно уу
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
