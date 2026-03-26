"use client";

interface AddCardProps {
  onClick: () => void;
}

export default function AddCard({ onClick }: AddCardProps) {
  return (
    <div
      onClick={onClick}
      className="rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center min-h-[200px] cursor-pointer hover:border-gray-400 transition-colors bg-white"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
