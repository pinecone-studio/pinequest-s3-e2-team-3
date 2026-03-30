"use client";

export const runtime = "edge";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStudentsQuery, useGetClassesQuery } from "@/gql/graphql";
import { MaterialTab } from "../_componets/MaterialTab";
import { StudentsTab } from "../_componets/StudentsTab";
import { Users, BookOpen, Search, GraduationCap } from "lucide-react";

type TabType = "material" | "students";
type ExamType = "явцын" | "улирлын";

export default function ClassDetailPage() {
  const [activeTab, setActiveTab]   = useState<TabType>("material");
  const [examType, setExamType]     = useState<ExamType>("явцын");
  const [searchQuery, setSearchQuery] = useState("");

  const params  = useParams();
  const classId = params.id as string;

  const { data: classData }   = useGetClassesQuery();
  const { data: studentData } = useGetStudentsQuery();

  const currentClass = classData?.getClasses?.find((c) => c.id === classId);
  const students     = studentData?.getStudents?.filter((s) => s.classId === classId) ?? [];

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "material", label: "Материал",  icon: <BookOpen size={16} /> },
    { id: "students", label: "Сурагчид", icon: <Users size={16} /> },
  ];

  return (
    <div className="min-h-screen w-full">

      {/* ── Class header ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5136a8]/10 flex items-center justify-center">
            <GraduationCap size={20} className="text-[#5136a8]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {currentClass?.name ?? "Анги"}
            </h1>
            <p className="text-xs text-gray-400">
              {students.length} сурагч · {examType} шалгалт
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/60 p-1 rounded-xl border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-[#5136a8] shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        {/* Exam type selector */}
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value as ExamType)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white capitalize"
        >
          <option value="явцын">Явцын шалгалт</option>
          <option value="улирлын">Улирлын шалгалт</option>
        </select>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder={activeTab === "material" ? "Материалын нэрээр хайх..." : "Сурагчийн нэрээр хайх..."}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Main card ───────────────────────────────────────────────────────── */}
      <main className="relative">
        {/* Decorative blobs */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#5136a8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#5136a8]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 min-h-[65vh]">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === "material" && (
              <MaterialTab
                classId={classId}
                className={currentClass?.name ?? ""}
                students={students.map((s) => ({ id: s.id, name: s.name ?? "" }))}
              />
            )}
            {activeTab === "students" && (
              <StudentsTab classId={classId} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}