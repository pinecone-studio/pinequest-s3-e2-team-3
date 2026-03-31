"use client";

import { GetClassesQuery, useGetStudentsByClasssQuery } from "@/gql/graphql";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Loader2 } from "lucide-react";

type Class = NonNullable<GetClassesQuery["getClasses"]>[number];
interface GroupCardProps {
  cls: Class;
  onClick: () => void;
}

export function GroupCard({ cls, onClick }: GroupCardProps) {
  const { data, loading } = useGetStudentsByClasssQuery({
    variables: { classId: cls.id },
  });
  const students =
    (data?.studentsByClass as {
      id: string;
      name?: string | null;
    }[]) || [];

  const count = students.length;

  return (
    <div
      onClick={onClick}
      className="group p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800">{cls.name}</h3>
          <p className="text-sm text-slate-400 font-medium">Үндсэн бүлэг</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <Users className="w-5 h-5 text-blue-500 group-hover:text-white" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
          ) : (
            <div className="flex -space-x-3 overflow-hidden">
              {students.slice(0, 3).map((student, i) => (
                <Avatar
                  key={student.id}
                  className="border-2 border-white w-9 h-9"
                >
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                  />
                  <AvatarFallback className="text-[10px] bg-slate-100">
                    {student.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}

              {count > 3 && (
                <div className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-white bg-slate-50 text-[11px] font-bold text-slate-600 z-10">
                  +{count - 3}
                </div>
              )}

              {count === 0 && (
                <span className="text-[10px] text-slate-400 font-medium italic">
                  Сурагчгүй
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-tighter leading-none mb-1">
            Нийт сурагч
          </span>
          <span className="text-xl font-black text-slate-800">{count}</span>
        </div>
      </div>
    </div>
  );
}
