"use client";

interface VariationHubCardProps {
  label: string;
  questionCount: number;
  onOpen: () => void;
  onDeleteVariation: () => void;
  deleteDisabled?: boolean;
  deleteLoading?: boolean;
  duplicateBusy?: boolean;
}

const folderClip =
  "polygon(0% 0%, 38% 0%, 48% 16%, 100% 16%, 100% 100%, 0% 100%)";

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
    <div className="relative w-full max-w-[280px] aspect-[1.45/1] group">
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end rounded-[20px] overflow-hidden border border-[#B0C4DE] bg-[#E0E7FF] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div
          className="absolute inset-0 bg-[#E0E7FF]"
          style={{ clipPath: folderClip }}
        />
        <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-6">
          <div className="rounded-lg border border-[#B0C4DE] bg-white px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-900">
              Вариант {label}
            </span>
          </div>
          {questionCount > 0 && (
            <span className="mt-2 text-xs text-gray-500">
              {questionCount} асуулт
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 cursor-pointer rounded-[20px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5D3FD3] focus-visible:ring-offset-2"
        aria-label={`Вариант ${label} нээх`}
      />

      <button
        type="button"
        disabled={deleteDisabled || deleteLoading || duplicateBusy}
        onClick={(e) => {
          e.stopPropagation();
          onDeleteVariation();
        }}
        className="absolute top-2 right-2 z-20 rounded-full border border-red-100 bg-white/90 p-1.5 text-red-500 shadow-sm hover:bg-red-50 disabled:pointer-events-none disabled:opacity-40 transition-colors"
        title="Хувилбарыг устгах"
      >
        {deleteLoading ? (
          <div className="h-4 w-4 border-2 border-red-500 border-t-transparent animate-spin rounded-full" />
        ) : (
          <svg
            width="14"
            height="14"
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
    </div>
  );
}
