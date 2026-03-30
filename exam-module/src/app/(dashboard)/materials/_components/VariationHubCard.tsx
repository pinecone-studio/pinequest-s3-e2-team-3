"use client";

interface VariationHubCardProps {
  label: string;
  questionCount: number;
  gradient: string;
  onOpen: () => void;
  onDeleteVariation: () => void;
  deleteDisabled?: boolean;
  deleteLoading?: boolean;
  duplicateBusy?: boolean;
}

export default function VariationHubCard({
  label,
  questionCount,
  onOpen,
  onDeleteVariation,
  deleteDisabled,
  deleteLoading,
  duplicateBusy,
}: VariationHubCardProps) {
  return (
    <div className="relative w-full max-w-[320px] aspect-[1.4/1] group">
      <div className="absolute inset-0 flex justify-center items-start pt-4">
        <div className="w-[50%] h-[70%] mt-10  bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm flex flex-col p-4 gap-2">
          <div className="h-1.5 w-full bg-gray-300 rounded-full" />
          <div className="h-1.5 w-full bg-gray-300 rounded-full" />
          <div className="h-1.5 w-full bg-gray-300 rounded-full" />
          <div className="h-1.5 w-2/3 bg-gray-300 rounded-full" />
        </div>
      </div>

      <div
        onClick={onOpen}
        className="absolute bottom-0 w-full h-[82%] cursor-pointer z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-[#D7E2FF]/30 backdrop-blur-[2px] border border-[#A2BBFF] rounded-[28px] shadow-lg transition-all group-hover:bg-[#D7E2FF]/40"
          style={{
            clipPath:
              "polygon(0% 0%, 40% 0%, 50% 15%, 100% 15%, 100% 100%, 0% 100%)",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center -translate-y-2">
          <div className="bg-white border border-[#A2BBFF] px-6 py-1 rounded-full shadow-sm">
            <span className="text-sm font-medium text-black">
              Вариант {label}
            </span>
          </div>
        </div>

        <div className="absolute bottom-5 inset-x-4  bg-white backdrop-blur-sm rounded-xl flex items-center justify-center px-4 border border-[#A2BBFF] shadow-sm">
          <span className="text-sm font-medium py-1 text-black">
            {questionCount} асуулт
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={deleteDisabled || deleteLoading || duplicateBusy}
        onClick={(e) => {
          e.stopPropagation();
          onDeleteVariation();
        }}
        className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/50 border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
        title="Хувилбарыг устгах"
      >
        {deleteLoading ? (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent animate-spin rounded-full" />
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        )}
      </button>

      <div className="absolute inset-0 -z-10 bg-blue-400/5 blur-3xl rounded-full scale-75" />
    </div>
  );
}
