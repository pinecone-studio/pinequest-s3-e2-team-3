"use client";

export const runtime = "edge";

import { useState, useMemo, useCallback, useEffect } from "react";
import TabButton from "./_components/TabButton";
import AssignmentCard from "./_components/Assignment.Card";
import NewAssignmentModal from "./_components/NewAssigmentModal";
import ProgressTable from "./_components/Progresstable";
import { tabs } from "./_components/mock";
import {
  useGetSessionsByCreatorQuery,
  useGetProctorLogsQuery,
  useGetStudentsByClassQuery,
  useGetClassAttendanceQuery,
} from "@/gql/graphql";
import {
  useProctorLogsPusher,
  type ProctorLogPayload,
} from "@/hooks/useProctorLogsPusher";
import { ProctorVideoGrid } from "./_components/ProctorVideoGrid";

function getCreatorIdFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw) as { id?: string };
    return user.id && user.id.length > 0 ? user.id : null;
  } catch {
    return null;
  }
}

export default function ShalgaltPage() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pusherLogs, setPusherLogs] = useState<ProctorLogPayload[]>([]);
  const [pickedViewerSessionId, setPickedViewerSessionId] = useState<
    string | null
  >(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [proctorSidebarTab, setProctorSidebarTab] = useState<
    "violations" | "attendance"
  >("violations");

  useEffect(() => {
    queueMicrotask(() => {
      setCreatorId(getCreatorIdFromStorage());
      setAuthReady(true);
    });
  }, []);

  const { data, loading, error } = useGetSessionsByCreatorQuery({
    variables: { creatorId: creatorId! },
    skip: !authReady || !creatorId,
  });

  const sessions = useMemo(
    () => data?.getSessionsByCreator ?? [],
    [data?.getSessionsByCreator],
  );

  const filteredAssignments = useMemo(() => {
    const now = new Date();

    const upcoming = sessions.filter((s) => {
      const start = new Date(s.startTime);

      return start > now;
    });

    const ongoing = sessions.filter((s) => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      return start <= now && end >= now;
    });
    const finished = sessions.filter((s) => {
      const end = new Date(s.endTime);

      return end < now;
    });
    return { upcoming, ongoing, finished };
  }, [sessions]);

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

  const { data: proctorData, loading: proctorLoading } = useGetProctorLogsQuery(
    {
      variables: { sessionId: effectiveViewerSessionId ?? undefined },
      fetchPolicy: "cache-and-network",
      pollInterval: 5000,
      skip: !effectiveViewerSessionId,
    },
  );

  const seedLogs = useMemo(() => {
    const rows = proctorData?.proctorLogs ?? [];
    return rows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId ?? null,
      examId: r.examId ?? null,
      studentId: r.studentId ?? "",
      eventType: r.eventType,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }, [proctorData?.proctorLogs]);

  const liveLogs = useMemo(() => {
    if (!effectiveViewerSessionId) return [];
    const byId = new Map<string, ProctorLogPayload>();
    const inSession = (row: ProctorLogPayload) =>
      row.sessionId === effectiveViewerSessionId;
    for (const row of pusherLogs) {
      if (inSession(row)) byId.set(row.id, row);
    }
    for (const row of seedLogs) {
      if (inSession(row)) byId.set(row.id, row);
    }
    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [effectiveViewerSessionId, seedLogs, pusherLogs]);

  const onNewLog = useCallback(
    (log: ProctorLogPayload) => {
      setPusherLogs((prev) => {
        if (
          !effectiveViewerSessionId ||
          log.sessionId !== effectiveViewerSessionId
        )
          return prev;
        if (prev.some((p) => p.id === log.id)) return prev;
        return [...prev, log];
      });
    },
    [effectiveViewerSessionId],
  );

  const viewerSession = useMemo(
    () =>
      filteredAssignments.ongoing.find(
        (s) => s.id === effectiveViewerSessionId,
      ) ?? null,
    [filteredAssignments.ongoing, effectiveViewerSessionId],
  );

  const { data: studentsByClassData } = useGetStudentsByClassQuery({
    variables: { classId: viewerSession?.classId ?? "" },
    skip: !viewerSession?.classId,
  });

  const studentNamesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of studentsByClassData?.studentsByClass ?? []) {
      map.set(s.id, s.name);
    }
    return map;
  }, [studentsByClassData?.studentsByClass]);

  const { data: attendanceData, loading: attendanceLoading } =
    useGetClassAttendanceQuery({
      variables: {
        classId: viewerSession?.classId ?? "",
        examSessionId: effectiveViewerSessionId ?? "",
      },
      skip: !viewerSession?.classId || !effectiveViewerSessionId,
      fetchPolicy: "cache-and-network",
      pollInterval: 5000,
    });

  const attendedStudentIdSet = useMemo(() => {
    const ids = attendanceData?.classAttendance.attendedStudentIds ?? [];
    return new Set(ids);
  }, [attendanceData?.classAttendance.attendedStudentIds]);

  const missingStudents = useMemo(() => {
    const roster = studentsByClassData?.studentsByClass ?? [];
    return roster.filter((s) => !attendedStudentIdSet.has(s.id));
  }, [studentsByClassData?.studentsByClass, attendedStudentIdSet]);

  //shineer orson yms
  const formatLogTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getEventLabel = (eventType: string) => {
    const type = eventType.toLowerCase();

    if (type.includes("human_speech")) return "Бусадтай ярьсан";
    if (type.includes("tab_change")) return "Цонх солих гэж оролдсон";
    if (type.includes("no_face_detected")) return "Сурагч харагдахгүй байна";
    if (type.includes("idle")) return "Идэвхгүй байдал илэрсэн";

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

  const getStudentShort = useCallback(
    (studentId: string) => {
      if (!studentId) return "—";
      const name = studentNamesById.get(studentId);
      if (name) return name;
      return `ID ${studentId.slice(0, 8)}`;
    },
    [studentNamesById],
  );

  //duusla

  useProctorLogsPusher(true, onNewLog);

  const proctorLogsAside = (
    <aside className="w-full shrink-0 rounded-[28px] bg-[#F7F7FB] p-4 xl:sticky xl:top-6 xl:h-[calc(100vh-120px)] xl:w-[340px] xl:overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-800">
          <span className="h-2.5 w-2.5 rounded-full bg-[#36C38A]" />
          <span className="font-medium">Үлдсэн хугацаа: 25:00</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setProctorSidebarTab("violations")}
          className={
            proctorSidebarTab === "violations"
              ? "rounded-xl border border-[#65558F] bg-white px-4 py-2 text-sm font-medium text-[#65558F]"
              : "rounded-xl border border-[#E8DEF8] bg-[#FCFBFF] px-4 py-2 text-sm font-medium text-gray-500"
          }
        >
          Зөрчил
        </button>
        <button
          type="button"
          onClick={() => setProctorSidebarTab("attendance")}
          className={
            proctorSidebarTab === "attendance"
              ? "rounded-xl border border-[#65558F] bg-white px-4 py-2 text-sm font-medium text-[#65558F]"
              : "rounded-xl border border-[#E8DEF8] bg-[#FCFBFF] px-4 py-2 text-sm font-medium text-gray-500"
          }
        >
          Ирц
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto xl:max-h-[calc(100%-92px)] pr-1">
        {proctorSidebarTab === "violations" ? (
          liveLogs.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
              {filteredAssignments.ongoing.length === 0
                ? "Эхэлсэн шалгалт байхгүй."
                : "Хяналтын бүртгэл олдсонгүй."}
            </div>
          ) : (
            liveLogs.map((row) => (
              <div
                key={row.id}
                className="rounded-[22px] border border-[#F2B7BE] bg-[#FFF1F3] px-4 py-4"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold text-gray-900">
                      {getStudentShort(row.studentId)}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {getEventLabel(row.eventType)}
                    </p>
                  </div>

                  <span className="shrink-0 text-lg text-[#E85D75]">
                    {getEventIcon(row.eventType)}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {formatLogTime(row.createdAt)}
                </p>
              </div>
            ))
          )
        ) : !viewerSession?.classId || !effectiveViewerSessionId ? (
          <div className="rounded-[22px] border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
            Идэвхтэй сесс сонгогдоогүй байна.
          </div>
        ) : attendanceLoading && !attendanceData ? (
          <div className="rounded-[22px] border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
            Ирцийг ачааллаж байна...
          </div>
        ) : (
          <>
            <div className="rounded-[22px] border border-[#E8DEF8] bg-white px-4 py-4">
              <p className="text-sm font-medium text-gray-700">Ирцийн тойм</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {attendanceData?.classAttendance.attended ?? 0} /{" "}
                {attendanceData?.classAttendance.totalStudents ?? 0}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Хувь:{" "}
                <span className="font-semibold text-[#65558F]">
                  {attendanceData?.classAttendance.attendanceRate ?? 0}%
                </span>
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-800">
                Ирээгүй сурагчид ({missingStudents.length})
              </p>
              {missingStudents.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
                  Бүх сурагч эхэлсэн.
                </div>
              ) : (
                <ul className="space-y-2">
                  {missingStudents.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-[18px] border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm text-gray-900"
                    >
                      <span className="font-medium">{s.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );

  if (!authReady)
    return <div className="p-8 text-center text-gray-500">Уншиж байна...</div>;
  if (!creatorId)
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Хэрэглэгчийн мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү.
      </div>
    );
  if (loading)
    return <div className="p-8 text-center text-gray-500">Уншиж байна...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Алдаа: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen p-6">
      <div className=" mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Шалгалт</h1>
            <p className="text-gray-600 mt-1">
              Шалгалттай холбоотой мэдээлэл болон шалгалт үүсгэх
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#65558F] hover:bg-[#65558F]/90 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            + Шалгалт үүсгэх
          </button>
        </div>
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {tabs.map((tab, index) => (
            <TabButton
              key={index}
              label={tab}
              isActive={activeTab === index}
              onClick={() => setActiveTab(index as 0 | 1 | 2)}
            />
          ))}
        </div>

        <div className="space-y-8">
          {activeTab === 1 &&
            (filteredAssignments.upcoming.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
                <p className="font-medium text-gray-700">
                  Төлөвлөгдсөн шалгалт байхгүй
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Одоогоор авах шалгалт харагдахгүй байна.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAssignments.upcoming.map((item) => (
                  <AssignmentCard
                    key={item.id}
                    title={item.description}
                    classInfo={item.class?.name || "Тодорхойгүй"}
                    date={new Date(item.startTime).toLocaleDateString()}
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

          {activeTab === 2 &&
            (filteredAssignments.finished.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
                <p className="font-medium text-gray-700">
                  Дууссан шалгалтын түүх байхгүй
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Session-ууд дууссан шалгалтад тохирохгүй байна.
                </p>
              </div>
            ) : (
              <>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAssignments.finished.map((item) => (
                    <AssignmentCard
                      key={item.id}
                      title={item.description}
                      classInfo={item.class?.name || "Тодорхойгүй"}
                      date={new Date(item.startTime).toLocaleDateString()}
                      startTime={new Date(item.startTime).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                      endTime={new Date(item.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      type="finished"
                    />
                  ))}
                </div> */}
                <ProgressTable sessions={filteredAssignments.finished} />
              </>
            ))}
          {activeTab === 0 && (
            <div className="space-y-6">
              {filteredAssignments.ongoing.length > 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[24px] border border-[#E8DEF8] bg-white px-4 py-3">
                  <label className="text-sm font-medium text-gray-700">
                    Видео хяналтын сесс
                    <select
                      className="ml-0 mt-2 block w-full rounded-xl border border-gray-200 bg-[#FCFBFF] px-3 py-2 text-sm text-gray-900 sm:ml-3 sm:mt-0 sm:inline-block sm:w-auto"
                      value={effectiveViewerSessionId ?? ""}
                      onChange={(e) =>
                        setPickedViewerSessionId(e.target.value || null)
                      }
                    >
                      {filteredAssignments.ongoing.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.description?.trim() || s.id.slice(0, 8)}…
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}

              {effectiveViewerSessionId ? (
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                  <div className="min-w-0 min-h-0 flex-1">
                    <ProctorVideoGrid
                      examSessionId={effectiveViewerSessionId}
                      examId={viewerSession?.exam?.id ?? null}
                      enabled={activeTab === 0}
                      studentNames={studentNamesById}
                    />
                  </div>
                  {proctorLogsAside}
                </div>
              ) : null}

              <div
                className={
                  effectiveViewerSessionId
                    ? "grid grid-cols-1 gap-6"
                    : "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
                }
              >
                {/* LEFT */}
                <div className="min-w-0">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[20px] font-semibold text-gray-900">
                      Эхэлсэн шалгалт
                    </p>
                    {proctorLoading && (
                      <span className="text-xs text-gray-400">
                        Ачааллаж байна...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredAssignments.ongoing.length === 0 ? (
                      <div className="col-span-full rounded-[24px] border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
                        <p className="font-medium text-gray-700">
                          Идэвхтэй ExamSession байхгүй
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                          Одоогоор эхэлсэн шалгалт харагдахгүй байна.
                        </p>
                      </div>
                    ) : (
                      filteredAssignments.ongoing.map((item) => (
                        <AssignmentCard
                          key={item.id}
                          title={item.description}
                          classInfo={item.class?.name || "Тодорхойгүй"}
                          date={new Date(item.startTime).toLocaleDateString()}
                          startTime={new Date(
                            item.startTime,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          endTime={new Date(item.endTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                          type="ongoing"
                        />
                      ))
                    )}
                  </div>
                </div>

                {!effectiveViewerSessionId ? proctorLogsAside : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <NewAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
