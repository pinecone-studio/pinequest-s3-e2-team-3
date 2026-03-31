"use client";

import { useRef, useState, useEffect } from "react";
import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  Brain, Sparkles, RefreshCw,
} from "lucide-react";
import { Cursor } from "./atoms";
import { TaskCard } from "./TaskCard";
import { STUDENTS } from "./mock";
import type { HardQuestion, QuestionAnalysis, GeneratedTask } from "./mock";

interface HardQuestionAccordionProps {
  hq:              HardQuestion;
  sentTasks:       Set<string>;
  onSend:          (k: string, t: GeneratedTask) => void;
  onAnalysisReady: (qId: string, analysis: QuestionAnalysis | null) => void;
  defaultOpen?:    boolean;
}

export const HardQuestionAccordion = ({
  hq, sentTasks, onSend, onAnalysisReady, defaultOpen = false,
}: HardQuestionAccordionProps) => {
  const [open, setOpen]           = useState(defaultOpen);
  const [streaming, setStreaming] = useState("");
  const abortRef                  = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open && !hq.analysis && !hq.loading && !hq.error) {
      generateAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const generateAnalysis = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setStreaming("");
    onAnalysisReady(hq.stat.q, null);

    try {
      const atRisk     = STUDENTS.filter(s => s.score < 80).map(s => s.name);
      const topStudents = STUDENTS.filter(s => s.score >= 85).map(s => s.name);

      const res = await fetch("/api/exam-result", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  abortRef.current.signal,
        body: JSON.stringify({
          mode:          "question",          // ← шинэ талбар
          questionId:    hq.stat.q,
          questionText:  hq.question?.text ?? "",
          correctAnswer: hq.question
            ? hq.question.options.find(o => o.charAt(0) === hq.question!.correct) ?? ""
            : "",
          wrongCount:    hq.stat.wrong,
          totalStudents: STUDENTS.length,
          atRiskStudents:  atRisk,
          topStudents,
          allStudents:   STUDENTS.map(s => s.name),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let raw = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += decoder.decode(value);
        setStreaming(raw);
      }

      const cleaned  = raw.replace(/```json[\s\S]*?```|```/g, "").trim();
      const analysis = JSON.parse(cleaned) as QuestionAnalysis;
      onAnalysisReady(hq.stat.q, analysis);
      setStreaming("");
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        onAnalysisReady(hq.stat.q, { rootCause: "", commonError: "", tasks: [] });
      }
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* ── Header ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-gray-800">{hq.stat.q}</span>
              <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                {hq.stat.wrong}/{STUDENTS.length} алдсан ({Math.round(hq.stat.wrong / STUDENTS.length * 100)}%)
              </span>
              {hq.analysis && (
                <span className="text-[10px] bg-emerald-100 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  ✓ AI бэлэн
                </span>
              )}
            </div>
            {hq.question && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{hq.question.text}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hq.loading && <RefreshCw size={14} className="text-[#5136a8] animate-spin" />}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Correct answer */}
          {hq.question && (
            <div className="px-5 pt-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <CheckCircle size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Зөв хариулт</p>
                  <p className="text-xs text-emerald-800 font-medium">
                    {hq.question.options.find(o => o.charAt(0) === hq.question!.correct)}
                    {" · "}
                    <span className="text-emerald-600">({hq.question.correct})</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading / streaming */}
          {hq.loading && (
            <div className="px-5 pt-4 pb-5">
              {streaming ? (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={13} className="text-[#5136a8] animate-pulse" />
                    <span className="text-xs font-bold text-[#5136a8]">AI тайлбар болон даалгавар бэлдэж байна...</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono leading-relaxed line-clamp-4">
                    {streaming}<Cursor />
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-pulse">
                  <div className="h-16 bg-amber-50 border border-amber-100 rounded-xl" />
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 bg-gray-50 border border-gray-100 rounded-xl" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {hq.error && (
            <div className="px-5 pt-4 pb-5">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="flex-1 text-xs text-red-700">{hq.error}</p>
                <button onClick={generateAnalysis} className="text-xs text-red-600 font-bold hover:underline">
                  Дахин оролдох
                </button>
              </div>
            </div>
          )}

          {/* Analysis ready */}
          {hq.analysis && !hq.loading && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Brain size={10} /> Үндсэн алдааны шалтгаан
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed">{hq.analysis.rootCause}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertTriangle size={10} /> Нийтлэг алдаа
                  </p>
                  <p className="text-xs text-orange-800 leading-relaxed">{hq.analysis.commonError}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  AI-ийн санал болгосон 3 ижил даалгавар
                </p>
                <div className="space-y-3">
                  {hq.analysis.tasks.map((task, i) => {
                    const key = `${hq.stat.q}-${i}`;
                    return (
                      <TaskCard
                        key={key}
                        task={task}
                        taskKey={key}
                        onSend={onSend}
                        sent={sentTasks.has(key)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Retry — no analysis, not loading */}
          {!hq.analysis && !hq.loading && !hq.error && (
            <div className="p-5">
              <button
                onClick={generateAnalysis}
                className="w-full flex items-center justify-center gap-2 bg-[#5136a8]/8 hover:bg-[#5136a8]/12 text-[#5136a8] border border-[#5136a8]/20 px-4 py-3 rounded-xl text-sm font-bold transition"
              >
                <Sparkles size={14} /> AI тайлбар болон даалгавар үүсгэх
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
