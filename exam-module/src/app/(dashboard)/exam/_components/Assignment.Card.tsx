interface AssignmentCardProps {
  title: string;
  classInfo: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "upcoming" | "ongoing" | "finished";
}
function FileSheet({ className }: { className?: string }) {
  return (
    <div
      className={`absolute w-[40%] aspect-[3/4] bg-white rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 p-[4%] flex flex-col gap-[10%] transition-transform duration-300 ${className}`}
    >
      <div className="h-[4%] w-full bg-gray-300 rounded-full" />
      <div className="h-[4%] w-full bg-gray-300 rounded-full" />
      <div className="h-[4%] w-full bg-gray-300 rounded-full" />
      <div className="h-[4%] w-full bg-gray-300 rounded-full opacity-50" />
      <div className="h-[4%] w-full bg-gray-300 rounded-full opacity-50" />
    </div>
  );
}
export default function AssignmentCard({
  title,
  classInfo,
  date,
  startTime,
  endTime,
  type,
}: AssignmentCardProps) {
  if (type === "upcoming") {
    return (
      <div className="flex flex-col gap-2 w-[283px]">
  <div className="relative h-[150px] w-full flex items-end">
    
    {/* 📄 Papers (SUBTLE, hidden behind) */}
    <div className="absolute inset-0 flex justify-center items-start overflow-hidden">
      <FileSheet className="-rotate-1 -translate-x-10 -translate-y-3 opacity-40 scale-90" />
      <FileSheet className="rotate-1 translate-x-10 -translate-y-3 opacity-40 scale-90" />
      <FileSheet className="z-10 -translate-y-10 opacity-50 scale-95" />
    </div>

    {/* 📁 Folder */}
    <div className="relative z-20 w-full h-[163px]">
      <div
        className="absolute inset-0 bg-[#EDE7F6] border border-[#D6CCF5] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
        style={{
          clipPath:
            "polygon(0% 0%, 28% 0%, 38% 18%, 100% 18%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2 px-4 pt-16">
        <span className="w-fit px-3 py-2 text-sm bg-purple-50 rounded-xl text-gray-900 font-medium">
          {classInfo}
        </span>

        <span className="w-fit px-3 py-2 text-sm  bg-purple-50 rounded-xl text-gray-800">
          {title}
        </span>
      </div>
    </div>
  </div>

        {/* Date below card */}
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 ml-1">
          <span className="inline-block w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center text-[8px]">○</span>
          {date} {startTime}-д эхэлнэ
        </p>
      </div>
    );
  }

  // finished type
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{classInfo}</p>
      <div className="text-xs text-gray-500 space-y-1">
        <p>Шалгалт авах огноо: {date}</p>
        <p>
          Эхлэх цаг: {startTime} Дуусах цаг: {endTime}
        </p>
      </div>
    </div>
  );
}
