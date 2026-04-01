"use client";

import { Material } from "./mock";


function FileSheet({ className }: { className?: string }) {
  return (
    <div
      className={`absolute w-[45%] h-[75%] bg-white rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 p-3 flex flex-col gap-2 transition-transform duration-300 ${className}`}
    >
      <div className="h-1 w-full bg-gray-200 rounded-full" />
      <div className="h-1 w-full bg-gray-200 rounded-full" />
      <div className="h-1 w-full bg-gray-200 rounded-full" />
      <div className="h-1 w-full bg-gray-200 rounded-full" />
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
      className="group relative w-full h-[180px] cursor-pointer flex items-end transition-transform active:scale-[0.98]"
    >
      <div className="absolute inset-0 top-6">
        <svg className="w-full h-full" viewBox="0 0 280 150" fill="none">
          <path
            d="M0 16C0 7.16344 7.16344 0 16 0H110.835C118.067 0 124.629 4.3486 127.438 11.0113L131.562 20.5432C132.966 23.8746 136.247 26.0545 139.863 26.0545H264C272.837 26.0545 280 33.2177 280 42.0545V134C280 142.837 272.837 150 264 150H16C7.16344 150 0 142.837 0 134V16Z"
            fill="#E0E9FF"
          />
        </svg>
      </div>

      <div className="absolute inset-0 flex justify-center items-start pt-2 pointer-events-none z-10">
        <FileSheet className="-rotate-[12deg] -translate-x-12 translate-y-2 opacity-90 scale-95" />
        <FileSheet className="rotate-[12deg] translate-x-12 translate-y-2 opacity-90 scale-95" />
        <FileSheet className="z-10 -translate-y-2 shadow-lg" />
      </div>

      <div className="absolute inset-0 top-[48px] z-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 280 132"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 16C0 7.16344 7.16344 0 16 0H110.835C118.067 0 124.629 4.3486 127.438 11.0113L131.562 20.5432C132.966 23.8746 136.247 26.0545 139.863 26.0545H264C272.837 26.0545 280 33.2177 280 42.0545V116C280 124.837 272.837 132 264 132H16C7.16344 132 0 124.837 0 116V16Z"
            fill="#DDE7FF"
            stroke="#B0C4DE"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute bottom-5 inset-x-4">
          <div className="w-full rounded-xl border border-[#B0C4DE] bg-white/95 py-2 px-4 shadow-sm">
            <span className="text-[14px] font-medium text-gray-800 truncate block text-center">
              {material.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
