import { Plus } from "lucide-react";
import { MaterialCard } from "./MaterialCard";


const MOCK_MATERIALS = [
  { id: "1", title: "Логарифм функц - Теорем ба тодорхойлолт", date: "2024.03.20", type: "PDF" },
  { id: "2", title: "Уламжлал бодох үндсэн аргачлал", date: "2024.03.18", type: "Doc" },
  { id: "3", title: "Бие даалтын удирдамж #4", date: "2024.03.15", type: "PDF" },
  { id: "4", title: "Тригонометрийн томъёонууд", date: "2024.03.12", type: "Image" },
  { id: "5", title: "Интеграл бодох хичээл", date: "2024.03.10", type: "PDF" },
  { id: "6", title: "Шалгалтын бэлтгэл материал", date: "2024.03.05", type: "PDF" },
];

export const MaterialTab = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
  
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Хичээлийн материалууд</h3>
          <p className="text-sm text-gray-400">Нийт {MOCK_MATERIALS.length} материал байна</p>
        </div>
        <button className="bg-[#5136a8] hover:bg-[#432c8a] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-purple-100 font-medium">
          <Plus size={20} />
          Материал нэмэх
        </button>
      </div>

   
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {MOCK_MATERIALS.map((m, index) => (
          <MaterialCard
            key={m.id}
            title={m.title}
            date={m.date}
            type={m.type}
            index={index}
          />
        ))}
      </div>

  
      {MOCK_MATERIALS.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl border-gray-100">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Plus className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-400 font-medium">Материал оруулаагүй байна</p>
        </div>
      )}
    </div>
  );
};