"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCreateClassMutation, useGetClassesQuery } from "@/gql/graphql";

interface AddClassModalProps {
  open: boolean;
  onClose: () => void;
}

const YEARS = ["2024 - 2025", "2025 - 2026", "2026 - 2027"];

const CLASS_OPTIONS = [
  "10А - 101 тоот", "10Б - 102 тоот", "10В - 103 тоот",
  "11А - 201 тоот", "11Б - 202 тоот", "11В - 203 тоот", "11Г - 204 тоот",
  "12А - 301 тоот", "12Б - 302 тоот",
];

export function AddClassModal({ open, onClose }: AddClassModalProps) {
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState(CLASS_OPTIONS[0]);
  const [year, setYear]     = useState(YEARS[1]);

  const { refetch } = useGetClassesQuery();
  const [addNewClass, { loading }] = useCreateClassMutation({
    onCompleted: () => {
      refetch();
      onClose();
      setSubject("");
    },
  });

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    // name-д бүгдийг нэгтгэж хадгална: "11А - 201 тоот · Математик · 2025-2026"
    const name = `${className} · ${subject.trim()} · ${year}`;
    await addNewClass({ variables: { name } });
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-6">Анги нэмэх</h2>

          <div className="space-y-5">
            {/* Хичээл */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Хичээл
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Математик"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition"
              />
            </div>

            {/* Анги */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Анги
              </label>
              <div className="relative">
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            </div>

            {/* Хичээлийн жил */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Хичээлийн жил
              </label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Буцах
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !subject.trim()}
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