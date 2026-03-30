"use client";

import { useState } from "react";
import { ExternalLink, Folder, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import {  useGetClassesQuery } from "@/gql/graphql";

interface ClassCardProps {
  name: string;
  id: string;
  index: number;
  studentCount: number;
}

function parseName(raw: string) {
  const parts = raw.split(" · ");
  return {
    className: parts[0] ?? raw,
    subject:   parts[1] ?? "",
  };
}

export const ClassCard = ({ name, id, index, studentCount }: ClassCardProps) => {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { refetch } = useGetClassesQuery();
  // const [deleteClass, { loading }] =  useDeleteClassMutation({
  //   onCompleted: () => refetch(),
  // });

  const { className, subject } = parseName(name);

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

  // const handleDelete = async () => {
  //   await deleteClass({ variables: { id } });
  //   setConfirmOpen(false);
  // };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg">
        <Link href={`/classes-detail/${id}`}>
          <div
            className={`h-40 bg-gradient-to-br ${colors[index % colors.length]} p-5 rounded-b-2xl flex flex-col justify-between relative`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[#1a054d] font-bold text-lg">{className}</h3>
                <span className="text-xs bg-white/70 backdrop-blur px-2 py-1 rounded-md text-[#1a054d] font-medium shadow-sm mt-2 inline-block">
                  {studentCount} сурагч
                </span>
              </div>
              {subject && (
                <span className="text-xs font-semibold text-[#1a054d]/60">{subject}</span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 p-4 opacity-20">
              <div className="w-24 h-24 bg-white/30 rounded-full -mr-10 -mb-10 blur-xl" />
            </div>
          </div>
        </Link>

        <div className="p-4 flex justify-between items-center">
          <div className="flex -space-x-2">
            {studentCount > 0 ? (
              [...Array(Math.min(studentCount, 3))].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} text-xs flex items-center justify-center border-2 border-white font-medium hover:scale-110 transition`}
                >
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

          <div className="flex gap-3 text-gray-400 items-center">
            <ExternalLink size={18} className="hover:text-blue-600 transition" />
            <Folder size={18} className="hover:text-blue-600 transition" />

            {/* ⋮ Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
                className="hover:text-gray-700 transition"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 bottom-7 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[120px]">
                    {/* <button
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        setConfirmOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
                      Устгах
                    </button> */}
                    {/* Delete button disabled */}
<button
  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
  disabled
>
  <Trash2 size={14} />
  Устгах
</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setConfirmOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="font-bold text-gray-800 mb-2">Анги устгах уу?</h3>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-gray-700">{className}</span> ангийг устгавал буцаан сэргээх боломжгүй.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Болих
                </button>
                {/* <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Устгаж байна..." : "Устгах"}
                </button> */}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};