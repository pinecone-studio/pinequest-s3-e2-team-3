"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GetStudentsByClasssQuery,
  useGetStudentsByClasssQuery,
} from "@/gql/graphql";
import { Loader2, MoreVertical, Pencil, Users } from "lucide-react";
import { AddStudentDialog } from "./AddStudentDialog";
import { EditStudentDialog } from "./EditStudentDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export type StudentType = NonNullable<
  GetStudentsByClasssQuery["studentsByClass"]
>[number];

export function StudentTable({ classId }: { classId: string }) {
  const [editingStudent, setEditingStudent] = useState<StudentType | null>(
    null,
  );
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
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-bold text-slate-800">
            Нийт сурагч:
          </span>
          <span className="text-[17px] font-medium text-slate-500">
            {students.length}
          </span>
        </div>
        <AddStudentDialog classId={classId} onSuccess={refetch} />
      </div>

      <div className="bg-white border border-slate-200 rounded-[1.2rem] shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-250px)]">
        <div className="overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-100 z-10">
              <TableRow className="hover:bg-transparent border-b border-slate-200">
                <TableHead className="w-16 text-center font-bold text-slate-800 h-16 text-[16px]">
                  №
                </TableHead>
                <TableHead className="text-[#5D57D9] font-bold h-16 text-[16px]">
                  Овог
                </TableHead>
                <TableHead className="text-[#5D57D9] font-bold h-16 text-[16px]">
                  Нэр
                </TableHead>
                <TableHead className="text-[#5D57D9] font-bold h-16 text-[16px]">
                  Регистрийн дугаар
                </TableHead>
                <TableHead className="text-[#5D57D9] font-bold h-16 text-[16px]">
                  Мэйл хаяг
                </TableHead>
                <TableHead className="text-[#5D57D9] font-bold h-16 text-[16px]">
                  Утас
                </TableHead>
                <TableHead className="w-12 h-16"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center text-slate-400 text-[16px]"
                  >
                    Мэдээлэл олдсонгүй
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-slate-50/50 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <TableCell className="text-center text-slate-600 py-5 text-[16px] font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-slate-500 py-5 text-[16px] font-medium">
                      Сурагчийн овог
                    </TableCell>
                    <TableCell className="text-slate-900 py-5 text-[16px] font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-slate-500 py-5 text-[16px] font-medium uppercase">
                      АБ 00000000
                    </TableCell>
                    <TableCell className="text-slate-500 py-5 text-[16px] font-medium">
                      {student.email || "—"}
                    </TableCell>
                    <TableCell className="text-slate-500 py-5 text-[16px] font-medium">
                      {student.phone || "—"}
                    </TableCell>
                    <TableCell className="py-5 text-center pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-slate-400 hover:text-slate-600 outline-none">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            className="cursor-pointer flex items-center gap-2"
                            onClick={() => setEditingStudent(student)}
                          >
                            <Pencil className="w-4 h-4" />
                            Засах
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {editingStudent && (
          <EditStudentDialog
            student={editingStudent}
            open={!!editingStudent}
            onOpenChange={(open) => !open && setEditingStudent(null)}
            onSuccess={refetch}
          />
        )}
      </div>
    </div>
  );
}
