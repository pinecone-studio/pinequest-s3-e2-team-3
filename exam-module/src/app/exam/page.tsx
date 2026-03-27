"use client";

import { useState, useMemo, useCallback } from "react";
import TabButton from "./_components/TabButton";
import AssignmentCard from "./_components/Assignment.Card";
import NewAssignmentModal from "./_components/NewAssigmentModal";
import ProgressTable from "./_components/Progresstable";
import { tabs } from "./_components/mock";
import {
  useGetActiveSessionQuery,
  useGetProctorLogsQuery,
} from "@/gql/graphql";
import {
  useProctorLogsPusher,
  type ProctorLogPayload,
} from "@/hooks/useProctorLogsPusher";

export default function ShalgaltPage() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pusherLogs, setPusherLogs] = useState<ProctorLogPayload[]>([]);

  const { data, loading, error } = useGetActiveSessionQuery();
  const { data: proctorData, loading: proctorLoading } = useGetProctorLogsQuery(
    {
      fetchPolicy: "cache-and-network",
      pollInterval: 5000,
    },
  );

  const sessions = useMemo(
    () => data?.getActiveSessions ?? [],
    [data?.getActiveSessions],
  );

  const seedLogs = useMemo(() => {
    const rows = proctorData?.proctorLogs ?? [];
    return rows.map((r) => ({
      id: r.id,
      examId: r.examId ?? null,
      studentId: r.studentId,
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

  const getStudentShort = (studentId: string) => {
    return `ID ${studentId.slice(0, 8)}`;
  };

  //duusla

  useProctorLogsPusher(true, onNewLog);

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

  const ongoingExamIds = useMemo(() => {
    const ids = filteredAssignments.ongoing
      .map((s) => s.exam?.id)
      .filter((id): id is string => Boolean(id));
    return new Set(ids);
  }, [filteredAssignments.ongoing]);

  /**
   * Prefer logs for current ongoing exams when we can resolve exam ids.
   * If we cannot (no sessions, missing exam on session, or ID mismatch), show all live logs so Pusher still appears.
   */
  const ongoingLogs = useMemo(() => {
    if (liveLogs.length === 0) return [];
    if (ongoingExamIds.size === 0) return liveLogs;
    const scoped = liveLogs.filter(
      (log) => !log.examId || ongoingExamIds.has(log.examId),
    );
    return scoped.length > 0 ? scoped : liveLogs;
  }, [liveLogs, ongoingExamIds]);

  if (loading)
    return <div className="p-8 text-center text-gray-500">Уншиж байна...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Алдаа: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Шалгалт</h1>
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
          {activeTab === 0 &&
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

          {activeTab === 1 &&
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
                <ProgressTable />
              </>
            ))}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                        <div
                          key={item.id}
                          className="rounded-[24px] border border-[#E8DEF8] bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                          <AssignmentCard
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
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <aside className="rounded-[28px] bg-[#F7F7FB] p-4 xl:sticky xl:top-6 xl:h-[calc(100vh-120px)] xl:overflow-hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#36C38A]" />
                      <span className="font-medium">Үлдсэн хугацаа: 25:00</span>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-[#65558F] bg-white px-4 py-2 text-sm font-medium text-[#65558F]"
                    >
                      Зөрчил
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-[#E8DEF8] bg-[#FCFBFF] px-4 py-2 text-sm font-medium text-gray-500"
                    >
                      Ирц
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto xl:max-h-[calc(100%-92px)] pr-1">
                    {ongoingLogs.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
                        {filteredAssignments.ongoing.length === 0
                          ? "Эхэлсэн шалгалт байхгүй."
                          : "Хяналтын бүртгэл олдсонгүй."}
                      </div>
                    ) : (
                      ongoingLogs.map((row) => (
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
                    )}
                  </div>
                </aside>
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
