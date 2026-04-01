"use client";

import { GetClassesQuery, useGetStudentsByClasssQuery } from "@/gql/graphql";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ExternalLink, Folder, MoreVertical } from "lucide-react";

type Class = NonNullable<GetClassesQuery["getClasses"]>[number];
interface GroupCardProps {
  cls: Class;
  onClick: () => void;
  color: string;
}

export function GroupCard({ cls, onClick, color }: GroupCardProps) {
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
      className="group bg-white border border-slate-300 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div
        className={`p-6 h-38 ${color} transition-opacity group-hover:opacity-90 relative`}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-[12px] font-semibold text-slate-600">
              {count} сурагч
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
          ) : (
            <div className="flex -space-x-2">
              {students.slice(0, 3).map((student) => (
                <Avatar
                  key={student.id}
                  className="border-2 border-white w-8 h-8 shadow-sm"
                >
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                  />
                  <AvatarFallback className="text-[8px] bg-slate-100 uppercase">
                    {student.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}

              {count > 3 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-[#4338CA] text-[9px] font-bold text-white z-10 shadow-sm">
                  +{count - 3}
                </div>
              )}

              {count === 0 && (
                <span className="text-[10px] text-slate-400 italic ml-1">
                  Сурагчгүй
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <ExternalLink className="w-4 h-4 hover:text-slate-600 transition-colors" />
          <Folder className="w-4 h-4 hover:text-slate-600 transition-colors" />
          <MoreVertical className="w-4 h-4 hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}
