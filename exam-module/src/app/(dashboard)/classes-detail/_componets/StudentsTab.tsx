"use client";

import React from "react";
import { useGetStudentsQuery } from "@/gql/graphql";

interface StudentsTabProps {
  classId: string;
}

export const StudentsTab = ({ classId }: StudentsTabProps) => {
  const { data, loading, error } = useGetStudentsQuery();

  const students =
    data?.getStudents?.filter((s) => s.classId === classId) || [];

  if (error) {
    return (
      <p className="text-red-500 text-center mt-10">
        Алдаа гарлаа: {(error as { message: string }).message}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center pt-12 px-4">
      
      {/* CARD */}
      <div className="w-full max-w-2xl bg-white rounded-2xl px-6 py-5 shadow-[0_6px_25px_rgba(0,0,0,0.06)]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className=" h-10 bg-[#7165a3] rounded-full" />
            Сурагчид
            
          </h3>

          <span className="text-sm text-[#5136a8] font-medium">
            Нийт – {students.length}
          </span>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
              >
                {/* AVATAR */}
                <div className="w-10 h-10 rounded-xl bg-[#7165a3]/10 flex items-center justify-center text-[#5136a8] font-bold text-base">
                  {s.name?.charAt(0)}
                </div>

                {/* INFO */}
                <div className="flex flex-col">
                  <span className="text-gray-800 font-semibold text-base">
                    {s.name}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {s.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};