import { FileText, Download, Eye, MoreVertical } from "lucide-react";

interface MaterialCardProps {
  title: string;
  date: string;
  type: string;
  index: number;
}

export const MaterialCard = ({
  title,
  date,
  type,
  index,
}: MaterialCardProps) => {
  const colors = [
   "from-[#b1a5e3] to-[#7165a3]", 
  "from-[#919ceb] to-[#5161d6]", 
  "from-[#a3d9e2] to-[#68a9b5]",
  "from-[#d1c9f0] to-[#a195d4]", 
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md group">
      <div
        className={`h-38 bg-gradient-to-br ${colors[index % colors.length]} p-4 flex rounded-b-2xl flex-col justify-between relative`}
      >
        <div className="flex justify-between items-start">
          <div className="bg-white/30 p-1.5 rounded-lg backdrop-blur-sm text-white">
            <FileText size={18} />
          </div>
          <span className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded-full text-white uppercase tracking-wider">
            {type}
          </span>
        </div>
        <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 pr-4">
          {title}
        </h4>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform" />
      </div>

      <div className="p-3">
        <p className="text-[11px] text-gray-400 mb-3">{date}</p>
        <div className="flex justify-end gap-3 text-gray-400">
          <Eye size={16} className="cursor-pointer hover:text-[#5136a8]" />
          <Download size={16} className="cursor-pointer hover:text-[#5136a8]" />
          <MoreVertical
            size={16}
            className="cursor-pointer hover:text-[#5136a8]"
          />
        </div>
      </div>
    </div>
  );
};
