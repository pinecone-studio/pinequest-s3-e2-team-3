import { Card } from "@/components/ui/card";
import { MoreVertical, Folder, ExternalLink } from "lucide-react";

export function ClassCard({
  grade,
  count,
  color,
}: {
  grade: string;
  count: number;
  color: string;
}) {
  return (
    <Card className="group  overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition-all p-0 rounded-xl bg-white">
      <div className={`h-38 ${color} p-6 flex flex-col justify-between `}>
        <div className="flex justify-between items-start">
          <h3 className="font-black text-2xl text-slate-800 tracking-tighter">
            {grade}
          </h3>
          <span className="bg-white/80 backdrop-blur-sm text-[11px] px-3 py-1 rounded-full font-bold text-slate-600 shadow-sm">
            {count} бүлэг
          </span>
        </div>
      </div>

      <div className="p-4 bg-white flex justify-end gap-4 text-slate-300 border-t border-slate-50">
        <ExternalLink className="w-5 h-5 hover:text-blue-500 transition-colors" />
        <Folder className="w-5 h-5 hover:text-blue-500 transition-colors" />
        <MoreVertical className="w-5 h-5 hover:text-blue-500 transition-colors" />
      </div>
    </Card>
  );
}
