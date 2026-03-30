"use client";

import React, { useState } from "react";
import { useGetClassesQuery, useGetStudentsQuery } from "@/gql/graphql";
import { Plus } from "lucide-react";
import { ClassCard } from "./_components/ClassCard";
import { AddClassModal } from "./_components/Addclass";

export default function ClassesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, loading, error } = useGetClassesQuery();
  const { data: studentData } = useGetStudentsQuery();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen ml-64">
        Уншиж байна...
      </div>
    );

  if (error)
    return (
      <div className="ml-64 p-10 text-red-500">
        Алдаа гарлаа: {error.message}
      </div>
    );

  const classes = data?.getClasses || [];
  const students = studentData?.getStudents || [];

  const getStudentCount = (classId: string) =>
    students.filter((s) => s.classId === classId).length;

  return (
    <div className="min-h-screen w-full">
      <main className="flex-1 flex flex-col">
        <div className="p-8 max-w-9xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Миний ангиуд
              </h2>
              <p className="text-gray-500">
                Анги нэмэж, шалгалтын түүх ба анализ харах
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#5136a8] hover:bg-[#432c8a] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-medium shadow-md shadow-purple-200"
            >
              <Plus size={20} />
              Анги нэмэх
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-20 text-gray-400 italic">
              Одоогоор анги байхгүй байна.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classes.map((item, index) => (
                <ClassCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  index={index}
                  studentCount={getStudentCount(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddClassModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
