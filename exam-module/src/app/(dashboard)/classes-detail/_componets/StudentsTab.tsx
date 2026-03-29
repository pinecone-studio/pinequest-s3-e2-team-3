"use client";

import React from "react";
import { useGetStudentsQuery } from "@/gql/graphql";

interface StudentsTabProps {
  classId: string;
}

export const StudentsTab = ({ classId }: StudentsTabProps) => {
  const { data: studentData, loading, error } = useGetStudentsQuery();

  const students =
    studentData?.getStudents?.filter((s) => s.classId === classId) || [];

  if (error)
    return <p className="text-red-500">Алдаа гарлаа: {error.message}</p>;

  return (
    <div className="animate-in fade-in duration-300">
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#7165a3] rounded-full" />
          Багш
        </h3>
        <div className="flex items-center gap-4 border-b pb-8">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#7165a3] to-[#a195d4] flex items-center justify-center text-white font-bold shadow-sm">
            Б
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 font-semibold text-lg">
              Булгантуяа Доржпалам
            </span>
            <span className="text-[#7165a3] text-sm font-medium">
              Үндсэн багш
            </span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#7165a3] rounded-full" />
          Сурагчид
          <span className="ml-2 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {students.length}
          </span>
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 group p-2 rounded-xl hover:bg-gray-50 transition-all cursor-default"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#7165a3]/10 flex items-center justify-center text-[#5136a8] font-bold border border-[#7165a3]/5 group-hover:bg-[#7165a3] group-hover:text-white transition-colors">
                  {s.name?.charAt(0)}
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="text-gray-800 font-bold text-[15px] truncate group-hover:text-[#5136a8] transition-colors">
                    {s.name}
                  </span>
                  <span className="text-gray-400 text-xs truncate font-medium">
                    {s.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
