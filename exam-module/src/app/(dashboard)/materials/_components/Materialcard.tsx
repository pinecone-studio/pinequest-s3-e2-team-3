"use client";

import { Material } from "./mock";

function DotsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-500"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
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

interface MaterialCardProps {
  material: Material;
  onClick?: () => void;
}

export default function MaterialCard({ material, onClick }: MaterialCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className="group relative w-[283px] h-[173px] cursor-pointer flex flex-col justify-end"
    >
      <div className="absolute inset-0 flex justify-center items-start pt-4">
        <FileSheet className="-rotate-15 -translate-x-15 -translate-y-2 opacity-80" />

        <FileSheet className="rotate-15 translate-x-15 -translate-y-2 opacity-80" />

        <FileSheet className="z-10 -translate-y-5 shadow-md border-gray-200/50" />
      </div>

      <div className="relative h-[120px] w-full z-20">
        <div
          className="absolute inset-0 bg-[#E8EFFF]/60 backdrop-blur-[2px] border border-blue-400 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          style={{
            clipPath:
              "polygon(0% 0%, 28% 0%, 38% 18%, 100% 18%, 100% 100%, 0% 100%)",
          }}
        />
        <div className="absolute bottom-4 inset-x-3 h-[28px] bg-white/80 backdrop-blur-md rounded-lg flex items-center justify-between px-3 border border-[#A2BBFF]/30 shadow-sm transition-all group-hover:bg-white">
          <span className="text-[13px] font-bold text-gray-800 truncate pr-2 tracking-tight">
            {material.title}
          </span>

          <div className="flex items-center gap-2 shrink-0 border-l border-gray-100 pl-2">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <DotsIcon />
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 -z-10 opacity-10 blur-[30px] rounded-full scale-75"
        style={{ background: material.gradient || "#5136a8" }}
      />
    </div>
  );
}
