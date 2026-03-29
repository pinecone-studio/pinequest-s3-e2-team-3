"use client";

export const runtime = "edge";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStudentsQuery, useGetClassesQuery } from "@/gql/graphql";
import { MaterialTab } from "../_componets/MaterialTab";
import { GradesTab } from "../_componets/GradesTab";
import { StudentsTab } from "../_componets/StudentsTab";
import { Users, BookOpen, GraduationCap, LayoutDashboard } from "lucide-react";

type TabType = "material" | "students" | "grades";

export default function ClassDetailPage() {
  const [activeTab, setActiveTab] = useState<TabType>("students");
  const params = useParams();
  const classId = params.id as string;

  const { data: classData } = useGetClassesQuery();
  const { data: studentData } = useGetStudentsQuery();

  const currentClass = classData?.getClasses?.find((c) => c.id === classId);
  const students =
    studentData?.getStudents?.filter((s) => s.classId === classId) || [];

  const tabs = [
    { id: "material", label: "Материал", icon: <BookOpen size={18} /> },
    { id: "students", label: "Сурагчид", icon: <Users size={18} /> },
    { id: "grades", label: "Дүн", icon: <GraduationCap size={18} /> },
  ];

  return (
    <div className="min-h-screen  w-full p-4 md:p-8">
      <div className="max-w-9xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between px-4 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#5136a8] font-medium text-sm mb-1">
              <LayoutDashboard size={16} />
              <span>Ангийн удирдлага</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {currentClass?.name || "11Б – 214 тоот"}
            </h1>
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-sm font-medium">
                Нийт {students.length} сурагч бүртгэлтэй байна
              </p>
            </div>
          </div>

          <div className="flex bg-white/50 p-1 rounded-xl border border-gray-200 mt-6 md:mt-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-[#5136a8] shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/30"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <main className="relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#5136a8]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#5136a8]/10 rounded-full blur-3xl"></div>

          <div className="relative bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12 min-h-[65vh]">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === "material" && <MaterialTab />}
              {activeTab === "students" && <StudentsTab classId={classId} />}
              {activeTab === "grades" && <GradesTab />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
