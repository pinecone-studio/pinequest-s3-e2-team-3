"use client";

export const runtime = "edge";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  useGetClassesQuery,
  useGetStudentsByClassQuery,
  useGetActiveSessionQuery,
} from "@/gql/graphql";
import { MaterialTab } from "../_componets/MaterialTab";
import { StudentsTab }  from "../_componets/StudentsTab";
import { Search }       from "lucide-react";

type TabType = "material" | "students";

export default function ClassDetailPage() {
  const [activeTab, setActiveTab]             = useState<TabType>("material");
  const [searchQuery, setSearchQuery]         = useState("");
  const [pickedSessionId, setPickedSessionId] = useState<string | null>(null);

  const params  = useParams();
  const classId = params.id as string;

  const { data: classData }   = useGetClassesQuery();
  const { data: sessionData } = useGetActiveSessionQuery();

  const { data: studentData, loading: studentsLoading } = useGetStudentsByClassQuery({
    variables: { classId },
    skip: !classId,
    fetchPolicy: "cache-and-network",
  });

  const currentClass = classData?.getClasses?.find((c) => c.id === classId);
  const students     = studentData?.studentsByClass ?? [];

  // ── Finished sessions for this class ─────────────────────────────────────
  const finishedSessions = useMemo(() => {
    const now = new Date();
    const all = sessionData?.getActiveSessions ?? [];
    return all
      .filter((s) => {
        const matchClass = s.classId === classId || s.class?.id === classId;
        const isFinished = new Date(s.endTime) < now;
        return matchClass && isFinished;
      })
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
  }, [sessionData?.getActiveSessions, classId]);

  const activeSession = useMemo(() => {
    if (!finishedSessions.length) return null;
    if (pickedSessionId) {
      return finishedSessions.find((s) => s.id === pickedSessionId) ?? finishedSessions[0];
    }
    return finishedSessions[0];
  }, [finishedSessions, pickedSessionId]);

  const tabs = [
    { id: "material" as TabType, label: "Материал" },
    { id: "students" as TabType, label: "Сурагчид" },
  ];

  return (
    <div className="min-h-screen  w-full bg-[#F9F9FB]">
   
    

     
      <div className="flex bg-white border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 bg-white text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[#5136a8] text-[#5136a8]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center  justify-between gap-3 mb-6">
        {/* Search — left */}
        <div className="relative w-full  max-w-xs">
          <div className="absolute  inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder={
              activeTab === "material" ? "Материалын нэрээр хайх" : "Сурагчийн нэрээр хайх..."
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Session selector — right */}
        {activeTab === "material" && (
          finishedSessions.length > 0 ? (
            <div className="relative">
              <select
                value={activeSession?.id ?? ""}
                onChange={(e) => setPickedSessionId(e.target.value || null)}
                className="appearance-none border border-gray-200 rounded-2xl pl-4 pr-10 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 font-medium"
              >
                {finishedSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.description?.trim() || s.exam?.name || s.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">Дууссан шалгалт байхгүй</span>
          )
        )}
      </div>

      
      <div>
        {activeTab === "material" && (
          <MaterialTab
            classId={classId}
            className={currentClass?.name ?? ""}
            examSessionId={activeSession?.id}
            examId={activeSession?.exam?.id ?? undefined}
            students={students.map((s) => ({ id: s.id, name: s.name }))}
          />
        )}
        {activeTab === "students" && (
          <StudentsTab classId={classId} />
        )}
      </div>
    </div>
    
  );
}
