"use client";

import { useState, useMemo } from "react";
import TabButton from "./_components/TabButton";
import AssignmentCard from "./_components/Assignment.Card";
import NewAssignmentModal from "./_components/NewAssigmentModal";

import { tabs } from "./_components/mock";
import { useGetActiveSessionQuery } from "@/gql/graphql";

export default function ShalgaltPage() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error } = useGetActiveSessionQuery();
  console.log(data, "data");
  const sessions = data?.getActiveSessions || [];
  console.log("sessions", sessions);

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

  if (loading)
    return <div className="p-8 text-center text-gray-500">Уншиж байна...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Алдаа: {error.message}
      </div>
    );
  console.log("ended", filteredAssignments.finished);

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
          {activeTab === 0 && (
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
              {/* <ProgressTable /> */}
            </>
          )}

          {activeTab === 2 && (
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
