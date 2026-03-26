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
  const { data: proctorData, loading: proctorLoading } =
    useGetProctorLogsQuery({
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
          {activeTab === 1 && (
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
          )}

          {activeTab === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAssignments.finished.map((item) => (
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
                    type="finished"
                  />
                ))}
              </div>
              <ProgressTable />
            </>
          )}

          {activeTab === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAssignments.ongoing.map((item) => (
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
                    type="ongoing"
                  />
                ))}
              </div>

              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Хяналтын бүртгэл (шууд)
                    </h2>
                    <p className="text-sm text-gray-500">
                      Эхэлсэн шалгалтуудын хяналтын үйл явдлууд шууд
                      шинэчлэгдэнэ.
                    </p>
                  </div>
                  {proctorLoading && (
                    <span className="text-xs text-gray-400">
                      Ачааллаж байна...
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white sticky top-0 border-b border-gray-100 z-10">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-600">
                          Огноо
                        </th>
                        <th className="px-6 py-3 font-medium text-gray-600">
                          Сурагч ID
                        </th>
                        <th className="px-6 py-3 font-medium text-gray-600">
                          Үйл явдал
                        </th>
                        <th className="px-6 py-3 font-medium text-gray-600">
                          Шалгалт ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ongoingLogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-gray-400"
                          >
                            {filteredAssignments.ongoing.length === 0
                              ? "Одоогоор эхэлсэн шалгалт байхгүй; хяналтын бүртгэл ирэхэд энд харагдана."
                              : "Хяналтын бүртгэл олдсонгүй."}
                          </td>
                        </tr>
                      ) : (
                        ongoingLogs.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-50 hover:bg-gray-50/80"
                          >
                            <td className="px-6 py-3 text-gray-700 whitespace-nowrap">
                              {new Date(row.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 font-mono text-xs text-gray-800">
                              {row.studentId}
                            </td>
                            <td className="px-6 py-3 text-gray-800">
                              {row.eventType}
                            </td>
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">
                              {row.examId ?? "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
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
