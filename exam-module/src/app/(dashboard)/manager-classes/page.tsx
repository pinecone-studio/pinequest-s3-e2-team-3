"use client";

import { useState, useMemo } from "react";
import {
  GetClassesQuery,
  useGetClassesQuery,
  useGetStaffUsersQuery,
} from "@/gql/graphql";

import { Button } from "@/components/ui/button";
import { ChevronLeft, Users } from "lucide-react";
import { CreateClassDialog } from "./_components/CreateClassDialog";
import { ClassCard } from "./_components/ClassCardProps";
import { StudentTable } from "./_components/StudentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GroupCard } from "./_components/GroupCard";

type Class = GetClassesQuery["getClasses"][number];

export default function ClassesPage() {
  const [view, setView] = useState<"grid" | "groups" | "students">("grid");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Class | null>(null);
  const {
    data: classesData,
    loading: classesLoading,
    refetch,
  } = useGetClassesQuery();
  const { data: staffData } = useGetStaffUsersQuery();

  const classTeacher = useMemo(() => {
    if (!selectedGroup || !staffData?.staffUsers) return null;
    return staffData.staffUsers.find((staff) =>
      staff.classIds.includes(selectedGroup.id),
    );
  }, [selectedGroup, staffData]);

  const groupedByGrade = useMemo(() => {
    if (!classesData?.getClasses) return {};

    return classesData.getClasses.reduce<Record<string, Class[]>>(
      (acc, curr) => {
        const gradeMatch = curr.name.match(/^(\d+)/);
        const gradeNumber = gradeMatch ? gradeMatch[1] : curr.name;

        const gradeKey = `${gradeNumber}-р анги`;

        if (!acc[gradeKey]) acc[gradeKey] = [];
        acc[gradeKey].push(curr);

        return acc;
      },
      {},
    );
  }, [classesData]);

  const displayGrades = Object.entries(groupedByGrade).map(
    ([grade, classes]) => ({
      grade,
      count: classes.length,
      classes,
    }),
  );

  const groups = selectedGrade ? (groupedByGrade[selectedGrade] ?? []) : [];
  const cardColors = [
    "bg-blue-100",
    "bg-purple-100",
    "bg-indigo-100",
    "bg-sky-100",
  ];

  if (classesLoading)
    return <div className="p-10 text-center">Уншиж байна...</div>;

  return (
    <div className="p-6 min-h-screen">
      <div className=" mx-auto">
        {view === "grid" && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Анги</h1>
                <p className="text-[14px] font-medium text-gray-400">Сургуульд анги, сурагч нэмэх</p>
              </div>

              <CreateClassDialog onSuccess={refetch} />
            </div>
            <div className="grid grid-cols-4 gap-6">
              {displayGrades.map((item, index) => (
                <div
                  key={item.grade}
                  onClick={() => {
                    setSelectedGrade(item.grade);
                    setView("groups");
                  }}
                  className="cursor-pointer transition-transform active:scale-95"
                >
                  <ClassCard
                    grade={
                      item.grade.includes("-р анги")
                        ? item.grade
                        : `${item.grade}-р анги`
                    }
                    count={item.count}
                    color={cardColors[index % cardColors.length]}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {view === "groups" && selectedGrade && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setView("grid")}
              className="gap-2 hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" /> Нийт ангиуд руу буцах
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              {selectedGrade} бүлгүүд
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedByGrade[selectedGrade].map((cls) => (
                <GroupCard
                  key={cls.id}
                  cls={cls}
                  onClick={() => {
                    setSelectedGroup(cls);
                    setView("students");
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {view === "students" && selectedGroup && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setView("groups")}
                  className="gap-2 p-0 mb-4 hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" /> Бүлгүүд рүү буцах
                </Button>
                <h1 className="text-3xl font-black text-slate-900">
                  {selectedGroup.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm font-medium text-slate-500">
                    Анги удирдсан багш:{" "}
                    <span className="text-slate-900">
                      {classTeacher
                        ? `${classTeacher.lastName} ${classTeacher.name}`
                        : "Томилоогүй"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <StudentTable classId={selectedGroup.id} />
          </div>
        )}
      </div>
    </div>
  );
}
