"use client";

interface AddCardProps {
  onClick: () => void;
}

export default function AddCard({ onClick }: AddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-[180px] w-full  cursor-pointer items-end transition-transform active:scale-[0.98] focus:outline-none"
    >
      <div className="relative w-full h-[172px]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 280 132"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 16C0 7.16344 7.16344 0 16 0H110.835C118.067 0 124.629 4.3486 127.438 11.0113L131.562 20.5432C132.966 23.8746 136.247 26.0545 139.863 26.0545H264C272.837 26.0545 280 33.2177 280 42.0545V116C280 124.837 272.837 132 264 132H16C7.16344 132 0 124.837 0 116V16Z"
            fill="#F8FAFF"
            stroke="#C6D7FF"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C6D7FF] bg-white transition-colors group-hover:bg-blue-50">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A5B4FC"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
