"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  useGetClassesQuery,
  useAssignTeacherToClassMutation,
  GetStaffUsersDocument,
} from "@/gql/graphql";

interface AddClassModalProps {
  open: boolean;
  onClose: () => void;
  teacherId?: string;
}

export function AddClassModal({ open, onClose, teacherId }: AddClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState("");

  const { data: classesData, refetch } = useGetClassesQuery();
  const allClasses = classesData?.getClasses ?? [];

  const [assignTeacher, { loading }] = useAssignTeacherToClassMutation({
    refetchQueries: [{ query: GetStaffUsersDocument }],
    onCompleted: () => { refetch(); handleClose(); },
  });

  const handleClose = () => {
    setSelectedClassId("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedClassId || !teacherId) return;
    await assignTeacher({ variables: { teacherId, classId: selectedClassId } });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
          <button onClick={handleClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Анги нэмэх</h2>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Анги сонгох</label>
            {allClasses.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">Үүсгэсэн анги байхгүй байна.</p>
            ) : (
              <div className="relative">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                >
                  <option value="">Ангиа сонгоно уу</option>
                  {allClasses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button onClick={handleClose} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
              Буцах
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedClassId}
              className="px-6 py-2.5 bg-[#5136a8] hover:bg-[#432c8a] text-white text-sm font-semibold rounded-xl transition shadow-md shadow-purple-200 disabled:opacity-50"
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
