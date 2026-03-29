"use client";

interface VariationHubCardProps {
  label: string;
  questionCount: number;
  gradient: string;
  onOpen: () => void;
  onDeleteVariation: () => void;
  deleteDisabled?: boolean;
  deleteLoading?: boolean;
  /** True while this variation is the one being bulk-duplicated (disables delete). */
  duplicateBusy?: boolean;
}

export default function VariationHubCard({
  label,
  questionCount,
  gradient,
  onOpen,
  onDeleteVariation,
  deleteDisabled,
  deleteLoading,
  duplicateBusy,
}: VariationHubCardProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col">
      <button
        type="button"
        onClick={onOpen}
        className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-t-xl"
      >
        <div className="h-36" style={{ background: gradient }} />
        <div className="px-4 py-3">
          <p className="text-base font-semibold text-gray-900">Хувилбар {label}</p>
          <p className="text-sm text-gray-500 mt-1">
            {questionCount} асуулт
          </p>
        </div>
      </button>
      <div className="px-4 pb-4 pt-0 flex flex-col gap-2">
        <button
          type="button"
          disabled={deleteDisabled || deleteLoading || duplicateBusy}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteVariation();
          }}
          className="w-full text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 hover:bg-red-100 disabled:opacity-50 disabled:pointer-events-none"
        >
          {deleteLoading ? "Устгаж байна…" : "Хувилбарыг бүхэлд нь устгах"}
        </button>
      </div>
    </div>
  );
}
