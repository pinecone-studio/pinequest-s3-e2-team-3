interface AssignmentCardProps {
  title: string;
  classInfo: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "upcoming" | "ongoing" | "finished";
}

export default function AssignmentCard({
  title,
  classInfo,
  date,
  startTime,
  endTime,
}: AssignmentCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{classInfo}</p>

      <div className="text-xs text-gray-500 space-y-1">
        <p>Шалгалт авах огноо: {date}</p>
        <p>
          Эхлэх цаг: {startTime} Дуусах цаг: {endTime}
        </p>
      </div>
    </div>
  );
}
