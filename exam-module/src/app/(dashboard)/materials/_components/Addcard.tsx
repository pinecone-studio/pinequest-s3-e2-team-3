"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PenLine, ArrowUpRight } from "lucide-react";

interface AddCardProps {
  onClick: () => void;
}

export default function AddCard({ onClick }: AddCardProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="group relative w-[283px] h-[180px] cursor-pointer transition-transform active:scale-[0.98]">
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

          <div className="absolute inset-0 flex items-center justify-center">
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
      </PopoverTrigger>

      <PopoverContent
        className="w-[240px] p-1 rounded-xl"
        align="start"
        sideOffset={10}
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-sm text-slate-700"
          >
            <PenLine size={18} className="text-slate-900" />
            Материал үүсгэх
          </button>

          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";

              input.click();

              input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log("Selected file:", file);
                }
              };
            }}
            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-sm text-slate-700"
          >
            <ArrowUpRight size={18} className="text-slate-900" />
            Файлаар үүсгэх
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
