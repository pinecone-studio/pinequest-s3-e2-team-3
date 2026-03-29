import { ExternalLink, Folder, MoreVertical } from "lucide-react";
import Link from "next/link";

interface ClassCardProps {
  name: string;
  id: string;
  index: number;
  studentCount: number;
}

export const ClassCard = ({
  name,
  id,
  index,
  studentCount,
}: ClassCardProps) => {
  const colors = [
    "from-[#c9d1fb] to-[#7f88f5]",
    "from-[#b6c2f3] to-[#7888e2]",
    "from-[#b2dbe2] to-[#6297a7]",
    "from-[#d8d1fb] to-[#9c89f5]",
  ];

  const avatarColors = [
    "bg-purple-200 text-purple-800",
    "bg-blue-200 text-blue-800",
    "bg-green-200 text-green-800",
    "bg-pink-200 text-pink-800",
  ];

  return (
    <Link href={`/classes-detail/${id}`}>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer">
        <div
          className={`h-40 bg-gradient-to-br ${
            colors[index % colors.length]
          } p-5 rounded-b-2xl flex flex-col justify-between relative`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#1a054d] font-bold text-lg">{name}</h3>

              <span className="text-xs bg-white/70 backdrop-blur px-2 py-1 rounded-md text-[#1a054d] font-medium shadow-sm mt-2 inline-block">
                {studentCount} сурагч
              </span>
            </div>

            {index === 0 && (
              <span className="text-xs font-semibold text-[#1a054d]/60">
                Математик
              </span>
            )}
          </div>

          <div className="absolute bottom-0 right-0 p-4 opacity-20">
            <div className="w-24 h-24 bg-white/30 rounded-full -mr-10 -mb-10 blur-xl"></div>
          </div>
        </div>

        <div className="p-4 flex justify-between items-center">
          <div className="flex -space-x-2">
            {studentCount > 0 ? (
              [...Array(Math.min(studentCount, 3))].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${
                    avatarColors[i % avatarColors.length]
                  } text-xs flex items-center justify-center border-2 border-white font-medium hover:scale-110 transition`}
                >
                  {name.charAt(0)}
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">Сурагч байхгүй</span>
            )}

            {studentCount > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-xs flex items-center justify-center border-2 border-white">
                +{studentCount - 3}
              </div>
            )}
          </div>

          <div className="flex gap-3 text-gray-400">
            <ExternalLink
              size={18}
              className="hover:text-blue-600 transition"
            />
            <Folder size={18} className="hover:text-blue-600 transition" />
            <MoreVertical
              size={18}
              className="hover:text-blue-600 transition"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};
