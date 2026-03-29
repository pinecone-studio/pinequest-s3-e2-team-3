"use client";

import { Material } from "./mock";

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="#6B7280" />
      <circle cx="12" cy="12" r="1.5" fill="#6B7280" />
      <circle cx="12" cy="19" r="1.5" fill="#6B7280" />
    </svg>
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
      className="rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer"
    >
      <div className="h-40" style={{ background: material.gradient }} />
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{material.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{material.date}</p>
        </div>
       <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-md hover:bg-gray-100">
          <DotsIcon />
        </button>
      </div>
    </div>
  );
}
