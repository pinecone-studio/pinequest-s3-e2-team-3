"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import TabButton from "./_components/TabButton";
import AssignmentCard from "./_components/Assignment.Card";
import NewAssignmentModal from "./_components/NewAssigmentModal";
import ProgressTable from "./_components/Progresstable";
import { tabs } from "./_components/mock";
import {
  useGetActiveSessionQuery,
  useGetProctorLogsQuery,
  useGetStudentsByClassQuery,
} from "@/gql/graphql";
import {
  useProctorLogsPusher,
  type ProctorLogPayload,
} from "@/hooks/useProctorLogsPusher";
import { ProctorVideoGrid } from "./_components/ProctorVideoGrid";

// ─── Types ───────────────────────────────────────────────────────────────────

type SidebarTab = "зөрчил" | "ирц";

interface AttendanceStudent {
  studentId: string;
  name: string;
  status: "present" | "late" | "absent";
  time?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatLogTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const getEventLabel = (eventType: string) => {
  const type = eventType.toLowerCase();
  if (type.includes("tab_hidden")) return "Цонхыг далд болгосон";
  if (type.includes("window_blur")) return "Chrome оос гарсан";
  if (type.includes("window_focus")) return "Таб руу буцаж орсон";
  if (type.includes("clipboard_copy")) return "Copy хийсэн";
  if (type.includes("clipboard_paste")) return "Paste хийсэн";
  if (type.includes("clipboard_cut")) return "Cut хийсэн";
  if (type.includes("context_menu_blocked")) return "Баруун товч цэс блоклогдсон";
  if (type.includes("user_idle")) return "Afk байсан";
  if (type.includes("human_speech")) return "Бусадтай ярьсан";
  if (type.includes("tab_change")) return "Цонх солих гэж оролдсон";
  if (type.includes("no_face_detected")) return "Сурагч харагдахгүй байна";
  if (
    type.includes("camera_off") ||
    type.includes("camera_disabled") ||
    type.includes("camera_lost")
  )
    return "Камер унтраасан";
  return eventType;
};

const getEventIcon = (eventType: string) => {
  const type = eventType.toLowerCase();
  if (type.includes("human_speech")) return "🎤";
  if (type.includes("tab_change")) return "↗";
  if (
    type.includes("camera_off") ||
    type.includes("camera_disabled") ||
    type.includes("camera_lost") ||
    type.includes("no_face_detected")
  )
    return "📷";
  return "•";
};

// ─── Sidebar: Зөрчил (violations) ────────────────────────────────────────────

function ViolationSidebar({
  logs,
  getStudentDisplayName,
}: {
  logs: ProctorLogPayload[];
  getStudentDisplayName: (id: string) => string;
}) {
  if (logs.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
        Хяналтын бүртгэл олдсонгүй.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((row) => (
        <div
          key={row.id}
          className="rounded-[22px] border border-[#F2B7BE] bg-[#FFF1F3] px-4 py-4"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-gray-900">
                {getStudentDisplayName(row.studentId)}
              </p>
              <p className="mt-0.5 text-sm text-gray-700">
                {getEventLabel(row.eventType)}
              </p>
            </div>
            <span className="shrink-0 text-lg text-[#E85D75]">
              {getEventIcon(row.eventType)}
            </span>
          </div>
          <p className="text-xs text-gray-500">{formatLogTime(row.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar: Ирц (attendance) ────────────────────────────────────────────────

function AttendanceSidebar({
  students,
  totalCount,
}: {
  students: AttendanceStudent[];
  totalCount: number;
}) {
  const presentCount = students.filter((s) => s.status === "present").length;

  const statusConfig = {
    present: {
      bg: "bg-[#E6F7F1]",
      border: "border-[#9FE1CB]",
      dot: "bg-[#1D9E75]",
      label: "Цагтаа",
      textColor: "text-[#0F6E56]",
    },
    late: {
      bg: "bg-[#FAEEDA]",
      border: "border-[#FAC775]",
      dot: "bg-[#BA7517]",
      label: "Оройтсон",
      textColor: "text-[#854F0B]",
    },
    absent: {
      bg: "bg-[#FFF1F3]",
      border: "border-[#F2B7BE]",
      dot: "bg-[#E85D75]",
      label: "Шалгалтанд оролцоогүй",
      textColor: "text-[#993556]",
    },
  };

  return (
    <div className="space-y-3">
      {/* Attendance count */}
      <div className="flex items-center justify-between rounded-[16px] border border-gray-100 bg-white px-4 py-3">
        <span className="text-sm text-gray-600">Нийт ирц</span>
        <span className="text-sm font-semibold text-gray-900">
          {presentCount} / {totalCount}
        </span>
      </div>

      {/* Student list */}
      {students.map((s) => {
        const cfg = statusConfig[s.status];
        return (
          <div
            key={s.studentId}
            className={`rounded-[22px] border ${cfg.border} ${cfg.bg} px-4 py-3`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
                <p className="truncate text-[15px] font-semibold text-gray-900">
                  {s.name}
                </p>
              </div>
              <span className={`shrink-0 text-[11px] font-medium ${cfg.textColor}`}>
                🎤
              </span>
            </div>
            <p className={`mt-1 text-xs font-medium ${cfg.textColor}`}>
              {cfg.label}
            </p>
            {s.time && (
              <p className="mt-0.5 text-xs text-gray-400">{s.time}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShalgaltPage() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pusherLogs, setPusherLogs] = useState<ProctorLogPayload[]>([]);
  const [pickedViewerSessionId, setPickedViewerSessionId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("зөрчил");

  const { data, loading, error } = useGetActiveSessionQuery();
  const { data: proctorData } = useGetProctorLogsQuery({
    fetchPolicy: "cache-and-network",
    pollInterval: 5000,
  });

  const sessions = useMemo(
    () => data?.getActiveSessions ?? [],
    [data?.getActiveSessions],
  );

  const seedLogs = useMemo(() => {
    const rows = proctorData?.proctorLogs ?? [];
    return rows.map((r) => ({
      id: r.id,
      examId: r.examId ?? null,
      studentId: r.studentId ?? "",
      eventType: r.eventType,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }, [proctorData?.proctorLogs]);

  const liveLogs = useMemo(() => {
    const byId = new Map<string, ProctorLogPayload>();
    for (const row of pusherLogs) byId.set(row.id, row);
    for (const row of seedLogs) byId.set(row.id, row);
    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [seedLogs, pusherLogs]);

  const onNewLog = useCallback((log: ProctorLogPayload) => {
    setPusherLogs((prev) => {
      if (prev.some((p) => p.id === log.id)) return prev;
      return [...prev, log];
    });
  }, []);

  useProctorLogsPusher(true, onNewLog);

  const filteredAssignments = useMemo(() => {
    const now = new Date();
    const upcoming = sessions.filter((s) => new Date(s.startTime) > now);
    const ongoing = sessions.filter((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      return start <= now && end >= now;
    });
    const finished = sessions.filter((s) => new Date(s.endTime) < now);
    return { upcoming, ongoing, finished };
  }, [sessions]);

  const ongoingExamIds = useMemo(() => {
    const ids = filteredAssignments.ongoing
      .map((s) => s.exam?.id)
      .filter((id): id is string => Boolean(id));
    return new Set(ids);
  }, [filteredAssignments.ongoing]);

  const effectiveViewerSessionId = useMemo(() => {
    const ongoing = filteredAssignments.ongoing;
    if (ongoing.length === 0) return null;
    if (
      pickedViewerSessionId &&
      ongoing.some((s) => s.id === pickedViewerSessionId)
    ) {
      return pickedViewerSessionId;
    }
    return ongoing[0]!.id;
  }, [filteredAssignments.ongoing, pickedViewerSessionId]);

  const viewerSession = useMemo(
    () =>
      filteredAssignments.ongoing.find(
        (s) => s.id === effectiveViewerSessionId,
      ) ?? null,
    [filteredAssignments.ongoing, effectiveViewerSessionId],
  );

  const viewerClassId =
    viewerSession?.classId ?? viewerSession?.class?.id ?? null;

  const { data: classStudentsData } = useGetStudentsByClassQuery({
    variables: { classId: viewerClassId! },
    skip: !viewerClassId || activeTab !== 2,
    fetchPolicy: "cache-and-network",
  });

  const studentNameById = useMemo(() => {
    const list = classStudentsData?.studentsByClass;
    if (!list) return new Map<string, string>();
    const m = new Map<string, string>();
    for (const s of list) m.set(s.id, s.name);
    return m;
  }, [classStudentsData?.studentsByClass]);

  const getStudentDisplayName = (studentId: string) => {
    if (!studentId) return "—";
    const name = studentNameById.get(studentId);
    if (name) return name;
    return `ID ${studentId.slice(0, 8)}`;
  };

  const ongoingLogs = useMemo(() => {
    if (liveLogs.length === 0) return [];
    if (ongoingExamIds.size === 0) return liveLogs;
    const scoped = liveLogs.filter(
      (log) => !log.examId || ongoingExamIds.has(log.examId),
    );
    return scoped.length > 0 ? scoped : liveLogs;
  }, [liveLogs, ongoingExamIds]);

  // Build attendance list from students
  const attendanceStudents = useMemo((): AttendanceStudent[] => {
    const list = classStudentsData?.studentsByClass ?? [];
    return list.map((s) => {
      // Derive attendance from logs: if student has any log they're "present"
      const hasLog = liveLogs.some((l) => l.studentId === s.id);
      return {
        studentId: s.id,
        name: s.name,
        status: hasLog ? "present" : "absent",
        time: hasLog
          ? formatLogTime(
              liveLogs.find((l) => l.studentId === s.id)!.createdAt,
            )
          : undefined,
      };
    });
  }, [classStudentsData?.studentsByClass, liveLogs]);

  const [proctorNowMs, setProctorNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (activeTab !== 2) return;
    queueMicrotask(() => setProctorNowMs(Date.now()));
    const id = window.setInterval(() => setProctorNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeTab]);

  const proctorRemainingLabel = useMemo(() => {
    if (!viewerSession?.endTime) return "—";
    const end = new Date(viewerSession.endTime).getTime();
    const sec = Math.max(0, Math.floor((end - proctorNowMs) / 1000));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [viewerSession, proctorNowMs]);

  // Exam title for proctor view
  const examTitle = viewerSession
    ? `${viewerSession.class?.name ?? ""} – ${viewerSession.exam?.name ?? viewerSession.description ?? ""}`
    : "";

  if (loading)
    return <div className="p-8 text-center text-gray-500">Уншиж байна...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Алдаа: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9F9FB] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Шалгалт</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Шалгалттай холбоотой мэдээлэл болон шалгалт үүсгэх
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#21005D] hover:bg-[#21005D]/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all w-fit"
          >
            + Шалгалт үүсгэх
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {tabs.map((tab, index) => (
            <TabButton
              key={index}
              label={tab}
              isActive={activeTab === index}
              onClick={() => setActiveTab(index as 2 | 1 | 0)}
            />
          ))}
        </div>

        {/* ── Tab 0: Авах шалгалтууд (upcoming) ──────────────────────────────── */}
        {activeTab === 0 &&
          (filteredAssignments.upcoming.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
              <p className="font-medium text-gray-700">Төлөвлөгдсөн шалгалт байхгүй</p>
              <p className="mt-2 text-sm text-gray-400">
                Одоогоор авах шалгалт харагдахгүй байна.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAssignments.upcoming.map((item) => (
                <AssignmentCard
                  key={item.id}
                  title={item.exam?.name || item.description}
                  classInfo={item.class?.name || "Тодорхойгүй"}
                  date={new Date(item.startTime).toLocaleDateString("mn-MN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                  startTime={new Date(item.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  endTime={new Date(item.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  type="upcoming"
                />
              ))}
            </div>
          ))}

        {/* ── Tab 1: Дууссан шалгалтууд ──────────────────────────────────────── */}
        {activeTab === 1 && (
          <ProgressTable />
        )}

        {/* ── Tab 2: Эхэлсэн (ongoing / proctor) ─────────────────────────────── */}
        {activeTab === 2 && (
          <div className="space-y-5">
            {/* Session selector + exam title */}
            {filteredAssignments.ongoing.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border border-[#E8DEF8] bg-white px-4 py-3">
                <p className="text-sm font-semibold text-gray-800">{examTitle}</p>
                {filteredAssignments.ongoing.length > 1 && (
                  <select
                    className="rounded-xl border border-gray-200 bg-[#FCFBFF] px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#65558F]"
                    value={effectiveViewerSessionId ?? ""}
                    onChange={(e) =>
                      setPickedViewerSessionId(e.target.value || null)
                    }
                  >
                    {filteredAssignments.ongoing.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.description?.trim() || s.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              {/* LEFT — video grid */}
              {effectiveViewerSessionId ? (
                <ProctorVideoGrid
                  examSessionId={effectiveViewerSessionId}
                  examId={viewerSession?.exam?.id ?? null}
                  enabled={activeTab === 2}
                />
              ) : (
                <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-400">
                  Эхэлсэн шалгалт байхгүй.
                </div>
              )}

              {/* RIGHT — sidebar */}
              <aside className="rounded-[24px] bg-white border border-[#E8DEF8] p-4 xl:sticky xl:top-6 xl:h-[calc(100vh-120px)] xl:overflow-hidden flex flex-col gap-3">
                {/* Timer */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-[#36C38A]" />
                  <span className="font-medium tabular-nums">
                    Үлдсэн хугацаа: {proctorRemainingLabel}
                  </span>
                </div>

                {/* Зөрчил / Ирц toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("зөрчил")}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      sidebarTab === "зөрчил"
                        ? "border-[#65558F] bg-white text-[#65558F]"
                        : "border-[#E8DEF8] bg-[#FCFBFF] text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Зөрчил
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("ирц")}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      sidebarTab === "ирц"
                        ? "border-[#65558F] bg-white text-[#65558F]"
                        : "border-[#E8DEF8] bg-[#FCFBFF] text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Ирц
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                  {sidebarTab === "зөрчил" ? (
                    <ViolationSidebar
                      logs={ongoingLogs}
                      getStudentDisplayName={getStudentDisplayName}
                    />
                  ) : (
                    <AttendanceSidebar
                      students={attendanceStudents}
                      totalCount={
                        classStudentsData?.studentsByClass?.length ?? 0
                      }
                    />
                  )}
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>

      <NewAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
