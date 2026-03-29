interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-all ${
        isActive
          ? "border-[#65558F] text-[#65558F] bg-gray-"
          : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
    </button>
  );
}