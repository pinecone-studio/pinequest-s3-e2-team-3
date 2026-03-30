"use client";

interface AddCardProps {
  onClick: () => void;
}

export default function AddCard({ onClick }: AddCardProps) {
  return (
    // <div
    //   onClick={onClick}
    //   className="rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center min-h-[200px] cursor-pointer hover:border-gray-400 transition-colors bg-white"
    // >
    //   <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    //     <path d="M12 5v14M5 12h14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
    //   </svg>
    // </div>
    <div
      onClick={onClick}
      className="group relative  w-[283px]  cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-transform active:scale-[0.98]"
    >
      <div
        className="absolute inset-0 bg-[#F5F8FF] border border-blue-400 rounded-[20px]"
        style={{
          clipPath:
            "polygon(0% 0%, 38% 0%, 48% 18%, 100% 18%, 100% 100%, 0% 100%)",
        }}
      />

      <div
        className="absolute inset-0 border border-blue-400 rounded-[20px] pointer-events-none"
        style={{
          clipPath:
            "polygon(0% 0%, 38% 0%, 48% 18%, 100% 18%, 100% 100%, 0% 100%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center pb-4">
        <div className="w-12 h-12 rounded-full border border-[#A2BBFF] bg-white flex items-center justify-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A2BBFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}
