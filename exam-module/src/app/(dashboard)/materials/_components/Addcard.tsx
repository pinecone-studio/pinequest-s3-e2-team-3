"use client";

const folderClip =
  "polygon(0% 0%, 38% 0%, 48% 16%, 100% 16%, 100% 100%, 0% 100%)";

interface AddCardProps {
  onClick: () => void;
}

export default function AddCard({ onClick }: AddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative mx-auto flex h-[173px] w-full max-w-[283px] cursor-pointer flex-col justify-end rounded-[20px] border border-[#B0C4DE] bg-[#E0E7FF] shadow-[0_8px_24px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5D3FD3] focus-visible:ring-offset-2"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px] bg-[#E0E7FF]"
        style={{ clipPath: folderClip }}
      />
      <div className="relative flex flex-1 flex-col items-center justify-center pb-2 pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#93C5FD] bg-[#C7D2FE] text-[#2563EB] shadow-sm transition-colors group-hover:bg-[#BFDBFE]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
      <span className="sr-only">Шинэ материал үүсгэх</span>
    </button>
  );
}
