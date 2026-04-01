import { Clock } from "lucide-react";

interface AssignmentCardProps {
  title: string;
  classInfo: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "upcoming" | "ongoing" | "finished";
}

function FolderCard({
  classInfo,
  title,
  footerText,
}: {
  classInfo: string;
  title: string;
  footerText: string;
}) {
  return (
    <div className="flex w-full max-w-[283px] flex-col gap-2">
      <div className="relative w-full">
        {/* Folder body + tab (clip matches reference: tab left, notch, flat top) */}
        <div
          className="relative aspect-[283/163] w-full overflow-hidden rounded-2xl border border-[#D1D1FF] bg-[#F0F0FF] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          style={{
            clipPath:
              "polygon(0% 0%, 28% 0%, 38% 18%, 100% 18%, 100% 100%, 0% 100%)",
          }}
        >
          {/* Faint table / grid inside folder */}
          {/* <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(147 112 219 / 0.45) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(147 112 219 / 0.45) 1px, transparent 1px)
              `,
              backgroundSize: "28px 22px",
              backgroundPosition: "center",
            }}
          /> */}
          {/* Soft center “document” blur like reference */}
          <div className="pointer-events-none absolute left-1/2 border border top-[12%] h-[45%] w-[62%] -translate-x-1/2 rounded-md bg-white/25 blur-[1px]" />

          {/* Pills — bottom-left */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-2">
            <span className="rounded-full border border-[#D1D1FF] bg-white px-3 py-0.5 text-sm font-bold text-gray-900">
              {classInfo}
            </span>
            <span className="rounded-full border border-[#D1D1FF] bg-white px-4 py-1 text-[12px] leading-snug text-gray-900">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* Footer — clock + schedule line */}
      <div className="flex items-center gap-2 pl-0.5 text-sm font-medium text-[#2D3748]">
        <Clock
          className="h-4 w-4 shrink-0 text-[#4FD1C5]"
          strokeWidth={2}
          aria-hidden
        />
        <span>{footerText}</span>
      </div>
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
  const footerText = `${date} ${startTime}-д эхэлнэ`;

  if (type === "upcoming" || type === "ongoing") {
    return (
      <FolderCard classInfo={classInfo} title={title} footerText={footerText} />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-sm text-gray-600">{classInfo}</p>
      <div className="space-y-1 text-xs text-gray-500">
        <p>Шалгалт авах огноо: {date}</p>
        <p>
          Эхлэх цаг: {startTime} Дуусах цаг: {endTime}
        </p>
      </div>
    </div>
  );
}
