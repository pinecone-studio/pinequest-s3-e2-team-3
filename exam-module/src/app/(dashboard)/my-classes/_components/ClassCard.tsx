"use client";

import { useState } from "react";
import { ExternalLink, Folder, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  useGetClassesQuery,
  useRemoveTeacherFromClassMutation,
  GetStaffUsersDocument,
} from "@/gql/graphql";

interface ClassCardProps {
  name: string;
  id: string;
  index: number;
  studentCount: number;
  teacherId?: string;
  onRemoved?: (classId: string) => void;
}

function parseName(raw: string) {
  const parts = raw.split(" · ");
  // "11А - 201 тоот · Математик · 2025-2026"
  // parts[0] = "11А - 201 тоот" → зөвхөн "-" өмнөх хэсгийг авна
  const classRaw = parts[0] ?? raw;
  const className = classRaw.split(" - ")[0]?.trim() ?? classRaw;
  
  return { className };
}

export const ClassCard = ({ name, id, index, studentCount, teacherId, onRemoved }: ClassCardProps) => {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useGetClassesQuery();

  const [removeTeacher, { loading }] = useRemoveTeacherFromClassMutation({
    refetchQueries: [{ query: GetStaffUsersDocument }],
    onCompleted: () => {
      setConfirmOpen(false);
      onRemoved?.(id);
    },
  });

  const { className,  } = parseName(name);

  const colors      = ["bg-[#c9d1fb]", "bg-[#b6c2f3]", "bg-[#b2dbe2]", "bg-[#d8d1fb]"];
  const avatarColors = [
    "bg-purple-200 text-purple-800",
    "bg-blue-200 text-blue-800",
    "bg-green-200 text-green-800",
    "bg-pink-200 text-pink-800",
  ];

  const handleRemove = async () => {
    if (!teacherId) return;
    await removeTeacher({ variables: { teacherId, classId: id } });
  };

  return (
    <>
      <div className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-xl bg-white">
        <Link href={`/classes-detail/${id}`}>
          <div className={`h-38 ${colors[index % colors.length]} p-6 flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
              <h3 className="font-black text-2xl text-slate-800 tracking-tighter">{className}</h3>
              <span className="bg-white/80 backdrop-blur-sm text-[11px] px-3 py-1 rounded-full font-bold text-slate-600 shadow-sm">
                {studentCount} сурагч
              </span>
            </div>
           
          </div>
        </Link>

        <div className="p-4 bg-white flex justify-between items-center border-t border-slate-50">
          <div className="flex -space-x-2">
            {studentCount > 0 ? (
              [...Array(Math.min(studentCount, 3))].map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} text-xs flex items-center justify-center border-2 border-white font-medium hover:scale-110 transition`}>
                  {className.charAt(0)}
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

          <div className="flex gap-4 text-slate-300 items-center">
            <ExternalLink size={20} className="hover:text-blue-500 transition-colors" />
            <Folder       size={20} className="hover:text-blue-500 transition-colors" />

            {teacherId && (
              <div className="relative">
                <button onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }} className="hover:text-slate-500 transition-colors">
                  <MoreVertical size={20} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 bottom-7 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[130px]">
                      <button
                        onClick={(e) => { e.preventDefault(); setMenuOpen(false); setConfirmOpen(true); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 size={14} /> Анги устгах
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setConfirmOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="font-bold text-gray-800 mb-2">Ангиас гарах уу?</h3>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-gray-700">{className}</span> ангиас гарвал дахин нэмүүлэх хүртэл харагдахгүй болно.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">Болих</button>
                <button onClick={handleRemove} disabled={loading} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
                  {loading ? "Гарч байна..." : "Гарах"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
