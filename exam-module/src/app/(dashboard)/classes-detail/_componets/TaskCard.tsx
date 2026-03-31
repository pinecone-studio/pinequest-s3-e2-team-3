"use client";

import { Send, CheckCircle } from "lucide-react";
import { DiffBadge } from "./atoms";
import type { GeneratedTask } from "./mock";

interface TaskCardProps {
  task:    GeneratedTask;
  taskKey: string;
  onSend:  (k: string, t: GeneratedTask) => void;
  sent:    boolean;
}

export const TaskCard = ({ task, taskKey, onSend, sent }: TaskCardProps) => (
  <div className={`rounded-xl border p-4 transition-all ${
    sent ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-100 hover:border-[#5136a8]/30 hover:shadow-sm"
  }`}>
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-bold text-gray-800">{task.title}</p>
        <DiffBadge level={task.difficulty} />
      </div>
      <button
        onClick={() => onSend(taskKey, task)}
        disabled={sent}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          sent ? "text-emerald-600 cursor-default" : "bg-[#5136a8] text-white hover:bg-[#3e2880]"
        }`}
      >
        {sent ? <><CheckCircle size={12} /> Илгээсэн</> : <><Send size={12} /> Илгээх</>}
      </button>
    </div>

    <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Яагаад алдсан бэ?</p>
      <p className="text-xs text-amber-800 leading-relaxed">{task.why}</p>
    </div>

    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Даалгавар</p>
      <p className="text-xs text-blue-800 font-medium leading-relaxed whitespace-pre-line">{task.problem}</p>
    </div>

    <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 mb-3">
      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">💡 Зааварчилгаа</p>
      <p className="text-xs text-purple-800 leading-relaxed">{task.hint}</p>
    </div>

    <div className="flex flex-wrap gap-1">
      {task.targetStudents.map(s => (
        <span key={s} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
          {s}
        </span>
      ))}
    </div>
  </div>
);
