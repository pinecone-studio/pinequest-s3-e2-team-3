"use client";

import React from "react";

export const DiffBadge = ({ level }: { level: "easy" | "medium" | "hard" }) => {
  const map = {
    easy:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    hard:   "bg-orange-50 text-orange-700 border-orange-200",
  };
  const label = { easy: "Хялбар", medium: "Дунд", hard: "Хэцүү" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[level]}`}>
      {label[level]}
    </span>
  );
};

export const ScorePill = ({ score }: { score: number }) => {
  const cls =
    score >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : score >= 70 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${cls}`}>
      {score}%
    </span>
  );
};

export const SectionTitle = ({
  icon, title, sub,
}: {
  icon: React.ReactNode; title: string; sub?: string;
}) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-[#5136a8]/8 flex items-center justify-center text-[#5136a8]">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const Cursor = () => (
  <span className="inline-block w-0.5 h-3.5 bg-[#5136a8] ml-0.5 align-middle animate-pulse" />
);
