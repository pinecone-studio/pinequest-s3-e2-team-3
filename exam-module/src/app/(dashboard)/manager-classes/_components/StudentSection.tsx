"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetStudentsByClasssQuery } from "@/gql/graphql";
import { Loader2, MoreVertical, Users } from "lucide-react";
import { AddStudentDialog } from "./AddStudentDialog";

export function StudentTable({ classId }: { classId: string }) {
  const { data, loading, refetch } = useGetStudentsByClasssQuery({
    variables: { classId },
  });

  if (loading)
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="font-medium">Сурагчдыг ачаалж байна...</p>
      </div>
    );

  const students = data?.studentsByClass || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-md font-black text-slate-800">
              Нийт {students.length} сурагч
            </span>
          </div>
        </div>
        <AddStudentDialog classId={classId} onSuccess={refetch} />
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm shadow-indigo-100/20">
        <Table>
          <TableHeader className="bg-[#f8faff]">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="w-14 text-center font-bold text-slate-800 py-5">
                №
              </TableHead>
              <TableHead className="text-[#4f46e5] font-bold py-5">
                Овог
              </TableHead>
              <TableHead className="text-[#4f46e5] font-bold py-5">
                Нэр
              </TableHead>
              <TableHead className="text-[#4f46e5] font-bold py-5 text-center">
                Регистрийн дугаар
              </TableHead>
              <TableHead className="text-[#4f46e5] font-bold py-5">
                Мэйл хаяг
              </TableHead>
              <TableHead className="text-[#4f46e5] font-bold py-5">
                Утас
              </TableHead>
              <TableHead className="w-12 py-5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-40 text-center text-slate-400 font-medium italic"
                >
                  Энэ ангид одоогоор сурагч бүртгэгдээгүй байна.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, index) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-indigo-50/30 transition-all duration-200 border-b border-slate-50 last:border-0"
                >
                  <TableCell className="text-center text-slate-800 font-bold py-4">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium py-4">
                    Сурагчийн овог
                  </TableCell>
                  <TableCell className="text-slate-800 font-bold py-4">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-xs uppercase text-center py-4 tracking-tighter">
                    {student.id.slice(0, 2).toUpperCase()}{" "}
                    {student.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium py-4">
                    {student.email || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium py-4">
                    {student.phone || "—"}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-center">
                      <button className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end pr-2">
        <button className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors py-2 px-6">
          Буцах
        </button>
      </div>
    </div>
  );
}
