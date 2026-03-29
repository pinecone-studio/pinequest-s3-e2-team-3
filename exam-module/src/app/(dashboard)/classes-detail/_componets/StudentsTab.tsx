"use client";

import React, { useState, useMemo } from "react";
import {
  useGetStudentsQuery,
  useGetStaffUsersQuery,
  useAssignTeacherToClassMutation,
  useRemoveTeacherFromClassMutation,
  GetStaffUsersDocument,
} from "@/gql/graphql";
import { Plus, X, Loader2, UserCheck } from "lucide-react";

interface StudentsTabProps {
  classId: string;
}

export const StudentsTab = ({ classId }: StudentsTabProps) => {
  const { data: studentData, loading, error } = useGetStudentsQuery();
  const { data: staffData } = useGetStaffUsersQuery({
    fetchPolicy: "cache-and-network",
  });

  const [assignTeacher, { loading: assigning }] =
    useAssignTeacherToClassMutation({
      refetchQueries: [{ query: GetStaffUsersDocument }],
    });

  const [removeTeacher, { loading: removing }] =
    useRemoveTeacherFromClassMutation({
      refetchQueries: [{ query: GetStaffUsersDocument }],
    });

  const [showTeacherSelect, setShowTeacherSelect] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const students =
    studentData?.getStudents?.filter((s) => s.classId === classId) || [];

  // Teachers assigned to this class
  const assignedTeachers = useMemo(
    () =>
      (staffData?.staffUsers ?? []).filter((t) => t.classIds.includes(classId)),
    [staffData?.staffUsers, classId],
  );

  // Teachers NOT assigned to this class (available to add)
  const availableTeachers = useMemo(
    () =>
      (staffData?.staffUsers ?? []).filter(
        (t) => !t.classIds.includes(classId),
      ),
    [staffData?.staffUsers, classId],
  );

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) return;
    await assignTeacher({
      variables: { teacherId: selectedTeacherId, classId },
    });
    setSelectedTeacherId("");
    setShowTeacherSelect(false);
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    await removeTeacher({
      variables: { teacherId, classId },
    });
  };

  if (error)
    return <p className="text-red-500">Алдаа гарлаа: {error.message}</p>;

  return (
    <div className="animate-in fade-in duration-300">
      {/* ── Teachers section ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#7165a3] rounded-full" />
            Багш нар
            <span className="ml-2 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {assignedTeachers.length}
            </span>
          </h3>
          {availableTeachers.length > 0 && (
            <button
              onClick={() => setShowTeacherSelect((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#5136a8] bg-[#5136a8]/10 hover:bg-[#5136a8]/20 transition-colors"
            >
              <Plus size={16} />
              Багш нэмэх
            </button>
          )}
        </div>

        {/* Assign teacher inline */}
        {showTeacherSelect && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#5136a8] focus:ring-2 focus:ring-[#5136a8]/20"
            >
              <option value="">Багш сонгох…</option>
              {availableTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.lastName}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignTeacher}
              disabled={!selectedTeacherId || assigning}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#5136a8] hover:bg-[#432c8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {assigning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Нэмэх
            </button>
            <button
              onClick={() => {
                setShowTeacherSelect(false);
                setSelectedTeacherId("");
              }}
              className="inline-flex items-center justify-center size-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {assignedTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-b">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <UserCheck size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 italic">
              Энэ ангид багш хуваарилагдаагүй байна.
            </p>
            {availableTeachers.length > 0 && !showTeacherSelect && (
              <button
                onClick={() => setShowTeacherSelect(true)}
                className="mt-3 text-sm text-[#5136a8] hover:underline"
              >
                Багш нэмэх
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 border-b pb-8">
            {assignedTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between gap-4 group p-2 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#7165a3] to-[#a195d4] flex items-center justify-center text-white font-bold shadow-sm">
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold text-lg">
                      {teacher.name} {teacher.lastName}
                    </span>
                    <span className="text-[#7165a3] text-sm font-medium">
                      {teacher.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveTeacher(teacher.id)}
                  disabled={removing}
                  className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-50"
                  title="Ангиас хасах"
                >
                  <X size={14} />
                  Хасах
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Students section ── */}
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
