"use client";

export const runtime = "edge";

import React, { useEffect, useMemo, useState } from "react";
import {
  useGetClassesQuery,
  useGetStudentsQuery,
  useGetStaffUsersQuery,
  UserRole,
} from "@/gql/graphql";
import { Plus } from "lucide-react";
import { ClassCard } from "./_components/ClassCard";
import { AddClassModal } from "./_components/Addclass";

type StoredUser = {
  id?: string;
  role?: UserRole | string;
  classIds?: string[];
};

export default function ClassesPage() {
  const [modalOpen, setModalOpen]         = useState(false);
  const [storedUser, setStoredUser]       = useState<StoredUser | null>(null);
  const [authReady, setAuthReady]         = useState(false);
  const [removedClassIds, setRemovedClassIds] = useState<Set<string>>(new Set());

  const { data, loading, error } = useGetClassesQuery();
  const { data: studentData }    = useGetStudentsQuery();
  const { data: staffData }      = useGetStaffUsersQuery({ fetchPolicy: "cache-and-network" });

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem("user");
        setStoredUser(raw ? (JSON.parse(raw) as StoredUser) : null);
      } catch { setStoredUser(null); }
      setAuthReady(true);
    });
  }, []);

  const isTeacher = storedUser?.role === UserRole.Teacher || storedUser?.role === "teacher";

  const teacherClassIds = useMemo(() => {
    if (!isTeacher || !storedUser?.id) return null;
    const me = staffData?.staffUsers?.find((u) => u.id === storedUser.id);
    return new Set(me?.classIds ?? storedUser?.classIds ?? []);
  }, [isTeacher, storedUser, staffData?.staffUsers]);

  const classes = useMemo(() => {
    const all = data?.getClasses ?? [];
    if (isTeacher) {
      const allowed = teacherClassIds ?? new Set(storedUser?.classIds ?? []);
      return all.filter((c) => allowed.has(c.id) && !removedClassIds.has(c.id));
    }
    return all;
  }, [data?.getClasses, isTeacher, teacherClassIds, storedUser?.classIds, removedClassIds]);

  const students = studentData?.getStudents ?? [];
  const getStudentCount = (classId: string) => students.filter((s) => s.classId === classId).length;
  const handleRemoved   = (classId: string) => setRemovedClassIds((prev) => new Set([...prev, classId]));

  if (loading || !authReady)
    return <div className="flex items-center justify-center h-screen">Уншиж байна...</div>;
  if (error)
    return <div className="p-10 text-red-500">Алдаа гарлаа: {error.message}</div>;

  return (
    <div className="min-h-screen w-full">
      <main className="flex-1 flex flex-col">
        <div className="p-6 max-w-9xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-[24px] font-semibold text-gray-900 mb-2">Миний ангиуд</h2>
              <p className="text-gray-500">Анги нэмэж, шалгалтын түүх ба анализ харах</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="bg-[#21005D] hover:bg-[#21005D] text-white px-5 py-2.5 rounded-full flex items-center gap-2 transition font-medium shadow-md shadow-purple-200">
              <Plus size={20} /> Анги нэмэх
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-20 text-gray-400 italic">
              {isTeacher ? "Танд хуваарилагдсан анги байхгүй байна." : "Одоогоор анги байхгүй байна."}
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
                  teacherId={isTeacher ? (storedUser?.id ?? undefined) : undefined}
                  onRemoved={handleRemoved}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddClassModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        teacherId={isTeacher ? (storedUser?.id ?? undefined) : undefined}
      />
    </div>
  );
}
