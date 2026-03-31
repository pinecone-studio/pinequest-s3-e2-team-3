"use client";

import { Material } from "./mock";

function FileSheet({ className }: { className?: string }) {
  return (
    <div
      className={`absolute w-[40%] aspect-[3/4] bg-white rounded-md shadow-[0_2px_10px_rgba(15,23,42,0.06)] border border-gray-100/90 p-[4%] flex flex-col gap-[10%] transition-transform duration-300 ${className}`}
    >
      <div className="h-[4%] w-full bg-gray-200 rounded-full" />
      <div className="h-[4%] w-full bg-gray-200 rounded-full" />
      <div className="h-[4%] w-full bg-gray-200 rounded-full" />
      <div className="h-[4%] w-full bg-gray-200/70 rounded-full" />
      <div className="h-[4%] w-full bg-gray-200/70 rounded-full" />
    </div>
  );
}

const folderTabClip =
  "polygon(0% 0%, 28% 0%, 38% 18%, 100% 18%, 100% 100%, 0% 100%)";

interface MaterialCardProps {
  material: Material;
  onClick?: () => void;
}

export default function MaterialCard({ material, onClick }: MaterialCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className="group relative mx-auto w-full max-w-[283px] h-[173px] cursor-pointer flex flex-col justify-end transition-transform active:scale-[0.99]"
    >
      <div className="absolute inset-0 flex justify-center items-start pt-4 pointer-events-none">
        <FileSheet className="-rotate-15 -translate-x-[52%] -translate-y-2 opacity-90" />
        <FileSheet className="rotate-15 translate-x-[52%] -translate-y-2 opacity-90" />
        <FileSheet className="z-10 -translate-y-4 shadow-md border-gray-200/60" />
      </div>

      <div className="relative h-[120px] w-full z-20">
        <div
          className="absolute inset-0 rounded-xl border border-[#B0C4DE] bg-gradient-to-b from-[#E8EEFF] to-[#D8E4FF] shadow-[0_8px_24px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)]"
          style={{ clipPath: folderTabClip }}
        />
        <div className="absolute bottom-4 inset-x-3 flex justify-center">
          <div className="max-w-[calc(100%-8px)] rounded-full border border-[#B0C4DE]/80 bg-white px-4 py-1.5 shadow-sm">
            <span className="text-[13px] font-semibold text-gray-900 truncate block text-center">
              {material.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
