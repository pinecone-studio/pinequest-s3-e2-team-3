"use client";

import { useRef, useState } from "react";
import {
  CheckCircle, X, Zap, Brain, Sparkles, AlertTriangle, BookOpen, RefreshCw,
} from "lucide-react";
import { SectionTitle, Cursor } from "./atoms";
import { ExamChart }              from "./Examchart";
import { StudentGradeList }       from "./StudentGradeList";
import { QuestionDetail }         from "./QuestionDetail";
import { HardQuestionAccordion }  from "./HardQuestionAccordion";
import { AIReportCards }          from "./AiReportCards";
import {
  STUDENTS, QUESTIONS, Q_STATS,
  getTopHard,
} from "./mock";
import type {
  Student, AIReport, QuestionAnalysis, GeneratedTask, HardQuestion, MaterialTabProps,
} from "./mock";

export const MaterialTab = ({ classId, className = "" }: MaterialTabProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(STUDENTS[0]);
  const [topHard,   setTopHard]   = useState<HardQuestion[]>(getTopHard(3));
  const [sentTasks, setSentTasks] = useState<Set<string>>(new Set());
  const [toast,     setToast]     = useState<string | null>(null);

  const [aiReport,   setAiReport]   = useState<AIReport | null>(null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiError,    setAiError]    = useState("");
  const [streamText, setStreamText] = useState("");
  const classAbortRef = useRef<AbortController | null>(null);

  // ── Accordion callback ──────────────────────────────────────────────────────
  const handleAnalysisReady = (qId: string, analysis: QuestionAnalysis | null) => {
    setTopHard(prev => prev.map(h => {
      if (h.stat.q !== qId) return h;
      if (analysis === null)          return { ...h, loading: true,  error: "",    analysis: undefined };
      if (!analysis.tasks?.length)    return { ...h, loading: false, error: "AI хариулт буруу формат байна.", analysis: undefined };
      return                                 { ...h, loading: false, error: "",    analysis };
    }));
  };

  // ── Send task ───────────────────────────────────────────────────────────────
  const handleSend = (key: string, task: GeneratedTask) => {
    setSentTasks(prev => new Set([...prev, key]));
    const names = task.targetStudents.slice(0, 2).join(", ");
    const extra = task.targetStudents.length > 2 ? ` +${task.targetStudents.length - 2}` : "";
    setToast(`"${task.title}" — ${names}${extra}-д илгээлээ ✓`);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Class AI (mode=class) ───────────────────────────────────────────────────
  const handleClassAI = async () => {
    if (classAbortRef.current) classAbortRef.current.abort();
    classAbortRef.current = new AbortController();
    setAiLoading(true); setAiReport(null); setAiError(""); setStreamText("");

    try {
      const res = await fetch("/api/exam-result", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  classAbortRef.current.signal,
        body: JSON.stringify({
          mode: "class",                // ← шинэ талбар
          classId, className,
          students:  STUDENTS,
          questions: QUESTIONS,
          stats:     Q_STATS,
        }),
      });

      if (!res.ok) {
        const e = await res.json() as { error?: string };
        throw new Error(e.error ?? "Сервер алдаа");
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let raw = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += decoder.decode(value);
        setStreamText(raw);
      }

      setAiReport(JSON.parse(raw.replace(/```json|```/g, "").trim()) as AIReport);
      setStreamText("");
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError")
        setAiError(e instanceof Error ? e.message : "Алдаа");
    } finally {
      setAiLoading(false);
    }
  };

  const totalSent = sentTasks.size;

  return (
    <div className="space-y-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#5136a8] text-white px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-300">
          <CheckCircle size={15} />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)}>
            <X size={13} className="opacity-60 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* A — Chart */}
      <ExamChart className={className} topHard={topHard} />

      {/* B + C — Students & Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentGradeList
          selected={selectedStudent}
          onSelect={setSelectedStudent}
          className={className}
        />
        <QuestionDetail student={selectedStudent} />
      </div>

      {/* E — Hard Question Accordions */}
      <div>
        <SectionTitle
          icon={<Zap size={18} />}
          title="Алдсан асуулт — AI тайлбар + ижил даалгавар"
          sub="Accordion нээхэд AI автоматаар тайлбар болон 3 түвшний даалгавар бэлдэнэ"
        />

        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <BookOpen size={14} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Асуулт нээгдэх үед <strong>AI автоматаар</strong> тухайн асуултын алдааны шалтгаан + 3 түвшний ижил даалгавар бэлдэж, сурагчдад шууд илгээх боломжтой.
          </p>
        </div>

        <div className="space-y-4">
          {topHard.map((hq, i) => (
            <HardQuestionAccordion
              key={hq.stat.q}
              hq={hq}
              sentTasks={new Set([...sentTasks].filter(k => k.startsWith(hq.stat.q)))}
              onSend={handleSend}
              onAnalysisReady={handleAnalysisReady}
              defaultOpen={i === 0}
            />
          ))}
        </div>

        {totalSent > 0 && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={16} className="text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">
              Нийт <strong>{totalSent}</strong> даалгавар сурагчдад илгээгдлээ.
            </p>
          </div>
        )}
      </div>

      {/* F — Optional deep class analysis */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <SectionTitle
            icon={<Brain size={18} />}
            title="AI Ангийн Гүнзгий Шинжилгээ"
            sub="Streaming · сурагч бүрийн оношилгоо + сурах зам"
          />
          <div className="flex gap-2 -mt-5">
            {aiLoading && (
              <button
                onClick={() => classAbortRef.current?.abort()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition"
              >
                <RefreshCw size={13} className="animate-spin" /> Зогсоох
              </button>
            )}
            <button
              onClick={handleClassAI}
              disabled={aiLoading}
              className="flex items-center gap-2 bg-[#5136a8] hover:bg-[#3e2880] text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-sm shadow-purple-200"
            >
              <Sparkles size={14} />
              {aiLoading ? "Шинжилж байна..." : "AI шинжилгээ ✨"}
            </button>
          </div>
        </div>

        {aiLoading && (
          <div className="mb-4 bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={13} className="text-[#5136a8] animate-pulse" />
              <span className="text-xs font-bold text-[#5136a8]">AI боловсруулж байна...</span>
            </div>
            {streamText
              ? <p className="text-[11px] text-gray-500 font-mono leading-relaxed line-clamp-3">{streamText}<Cursor /></p>
              : (
                <div className="flex gap-1.5">
                  {[40, 60, 35].map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full bg-[#5136a8]/30 animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              )
            }
          </div>
        )}

        {aiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm flex items-center gap-2">
            <AlertTriangle size={15} /> {aiError}
          </div>
        )}

        {aiReport && <AIReportCards report={aiReport} />}

        {!aiReport && !aiLoading && (
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-dashed border-purple-200 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#5136a8]/8 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={22} className="text-[#5136a8]" />
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Ангийн гүнзгий шинжилгээ хийгдээгүй</h4>
            <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
              Сурагч бүрийн оношилгоо, мэдлэгийн цоорхой, personalized сурах замыг авахын тулд дарна уу.
            </p>
            <button
              onClick={handleClassAI}
              className="inline-flex items-center gap-2 bg-[#5136a8] hover:bg-[#3e2880] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm shadow-purple-200"
            >
              <Sparkles size={14} /> AI шинжилгээ эхлүүлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
