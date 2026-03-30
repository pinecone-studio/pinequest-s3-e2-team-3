"use client";

import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle, Zap, Send, CheckCircle, ChevronDown, ChevronUp,
  Brain, Sparkles, X, BarChart2, Users, FileText, Lightbulb,
  RefreshCw, Target, BookOpen,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from "recharts";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
interface Student      { id: string; name: string; score: number; variant: string }
interface Question     { no: number; text: string; score: number; options: string[]; correct: string }
interface QuestionStat { q: string; wrong: number }

interface GeneratedTask {
  title:          string;
  why:            string;   // Яагаад алдсан тайлбар
  problem:        string;   // Бодит даалгаварын текст
  hint:           string;   // Зааварчилгаа
  difficulty:     "easy" | "medium" | "hard";
  targetStudents: string[];
}

interface QuestionAnalysis {
  rootCause:    string;        // Үндсэн алдааны шалтгаан
  commonError:  string;        // Нийтлэг алдаа
  tasks:        GeneratedTask[];
}

interface HardQuestion {
  stat:      QuestionStat;
  question?: Question;
  analysis?: QuestionAnalysis;   // AI-ийн generate хийсэн
  loading:   boolean;
  error:     string;
}

interface AIReport {
  summary: string; weakTopic: string; weakTopicReason: string;
  recommendation: string; positiveNote: string; trendingMisconception: string;
  classHealthScore: number; nextLessonPlan: string;
  atRiskStudents: { name: string; reason: string }[];
  studentDiagnostics: {
    name: string; score: number; riskLevel: "high" | "medium" | "low";
    knowledgeGaps: string[]; trendingMisconception: string; strengths: string[];
    learningPath: { step: number; action: string; type: "practice" | "review" | "challenge" }[];
  }[];
}

interface MaterialTabProps { classId: string; className?: string; students?: { id: string; name: string }[] }

// ═══════════════════════════════════════════════════════════
// MOCK DATA  (зөвхөн шалгалтын өгөгдөл — tasks байхгүй)
// ═══════════════════════════════════════════════════════════
const STUDENTS: Student[] = [
  { id: "1", name: "А.Анужин",  score: 95, variant: "А" },
  { id: "2", name: "Г.Анужин",  score: 80, variant: "Б" },
  { id: "3", name: "Батбаяр",   score: 73, variant: "А" },
  { id: "4", name: "Барсболд",  score: 81, variant: "Б" },
  { id: "5", name: "Д.Анужин",  score: 67, variant: "А" },
];

const QUESTIONS: Question[] = [
  { no: 1,  text: "21×10⁷ × (12×10⁻⁸) утгыг ол.",        score: 2, options: ["А. 14.2","Б. 15","В. 25.2","Г. 14"],              correct: "В" },
  { no: 2,  text: "Квадрат функцийн графикийг сонгоорой.", score: 1, options: ["А. Гипербол","Б. Парабол","В. Шулуун","Г. Тойрог"], correct: "Б" },
  { no: 3,  text: "log₂(8) = ?",                           score: 1, options: ["А. 2","Б. 4","В. 3","Г. 8"],                      correct: "В" },
  { no: 8,  text: "sin(90°) + cos(0°) = ?",                score: 2, options: ["А. 0","Б. 1","В. 2","Г. √2"],                     correct: "В" },
  { no: 12, text: "2x + 5 = 13 бол x = ?",                 score: 1, options: ["А. 3","Б. 4","В. 5","Г. 9"],                      correct: "Б" },
];

const Q_STATS: QuestionStat[] = [
  { q:"А-1",  wrong:8  }, { q:"А-2",  wrong:15 }, { q:"А-3",  wrong:3  },
  { q:"А-4",  wrong:4  }, { q:"А-5",  wrong:11 }, { q:"А-6",  wrong:6  },
  { q:"А-7",  wrong:5  }, { q:"А-8",  wrong:20 }, { q:"А-9",  wrong:12 },
  { q:"А-10", wrong:11 }, { q:"А-11", wrong:11 }, { q:"А-12", wrong:13 },
  { q:"А-13", wrong:4  }, { q:"А-14", wrong:13 }, { q:"А-15", wrong:11 },
];

const CLASS_AVG = Math.round(STUDENTS.reduce((s, g) => s + g.score, 0) / STUDENTS.length);

function getTopHard(n = 3): HardQuestion[] {
  return [...Q_STATS]
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, n)
    .map((stat) => {
      const qNo     = parseInt(stat.q.replace("А-", ""), 10);
      const question = QUESTIONS.find((q) => q.no === qNo);
      return { stat, question, analysis: undefined, loading: false, error: "" };
    });
}

// ═══════════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════════
const DiffBadge = ({ level }: { level: "easy" | "medium" | "hard" }) => {
  const map = {
    easy:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    hard:   "bg-orange-50 text-orange-700 border-orange-200",
  };
  const label = { easy: "Хялбар", medium: "Дунд", hard: "Хэцүү" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[level]}`}>{label[level]}</span>;
};

const ScorePill = ({ score }: { score: number }) => {
  const cls = score>=85 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : score>=70 ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200";
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${cls}`}>{score}%</span>;
};

const SectionTitle = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-[#5136a8]/8 flex items-center justify-center text-[#5136a8]">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// Streaming cursor
const Cursor = () => <span className="inline-block w-0.5 h-3.5 bg-[#5136a8] ml-0.5 align-middle animate-pulse" />;

// ═══════════════════════════════════════════════════════════
// COMPONENT A — ExamChart
// ═══════════════════════════════════════════════════════════
const ExamChart = ({ className, topHard }: { className: string; topHard: HardQuestion[] }) => {
  const hardest = Q_STATS.reduce((a, b) => (a.wrong > b.wrong ? a : b));
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <SectionTitle icon={<BarChart2 size={18} />} title={`${className || "12А"} — Явцын шалгалтын анализ`} sub="Асуулт бүрээр алдсан сурагчдын тоо" />
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label:"Хамгийн хэцүү", val:hardest.q,  sub:`${hardest.wrong} алдсан`, cls:"bg-purple-50 border-purple-100 text-[#5136a8]" },
          { label:"Дундаж дүн",    val:`${CLASS_AVG}%`, sub:`${STUDENTS.length} сурагч`, cls:"border-gray-100 text-gray-800" },
          { label:"Тэнцсэн",      val:`${STUDENTS.filter(s=>s.score>=70).length}`, sub:"сурагч", cls:"bg-emerald-50 border-emerald-100 text-emerald-700" },
          { label:"Хоцрогдсон",   val:`${STUDENTS.filter(s=>s.score<70).length}`,  sub:"сурагч", cls:"bg-red-50 border-red-100 text-red-700" },
        ].map(c=>(
          <div key={c.label} className={`border rounded-xl px-4 py-2.5 text-center ${c.cls}`}>
            <p className="text-[10px] text-gray-400 mb-0.5">{c.label}</p>
            <p className="text-lg font-black">{c.val}</p>
            <p className="text-[10px] text-gray-400">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={Q_STATS} margin={{top:8,right:8,left:-24,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="q" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{borderRadius:10,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",fontSize:12}} formatter={v=>[`${v} сурагч`,"Алдсан"]} />
            <ReferenceLine y={hardest.wrong} stroke="#fca5a5" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="wrong" stroke="#7165a3" strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isHard = topHard.some(h => h.stat.q === payload.q);
                return <circle key={payload.q} cx={cx} cy={cy} r={isHard?6:4} fill={isHard?"#ef4444":"#7165a3"} stroke={isHard?"#fca5a5":"none"} strokeWidth={isHard?2:0} />;
              }}
              activeDot={{r:6,fill:"#5136a8"}}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Хамгийн их алдаа — улаан цэг</p>
        <div className="flex gap-2 flex-wrap">
          {topHard.map(({stat})=>(
            <div key={stat.q} className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-xs font-bold text-red-700">{stat.q}</span>
              <span className="text-[10px] text-red-400">{stat.wrong} алдсан</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENT B — StudentGradeList
// ═══════════════════════════════════════════════════════════
const StudentGradeList = ({ selected, onSelect, className }: { selected: Student; onSelect: (s:Student)=>void; className:string }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <SectionTitle icon={<Users size={18}/>} title={`${className||"12А"} анги`} sub="Сурагч дарж асуултыг харна уу"/>
    <div className="h-20 mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={STUDENTS} margin={{top:0,right:0,left:-30,bottom:0}}>
          <XAxis dataKey="name" tick={{fontSize:9,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
          <Bar dataKey="score" radius={[4,4,0,0]}>
            {STUDENTS.map(s=><Cell key={s.id} fill={s.score>=85?"#34d399":s.score>=70?"#fbbf24":"#f87171"}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="space-y-1">
      {STUDENTS.map(g=>(
        <button key={g.id} onClick={()=>onSelect(g)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all border ${selected.id===g.id?"bg-[#5136a8]/8 border-[#5136a8]/30 text-[#5136a8]":"hover:bg-gray-50 text-gray-700 border-transparent"}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white ${g.score>=85?"bg-emerald-400":g.score>=70?"bg-amber-400":"bg-red-400"}`}>{g.name.charAt(0)}</div>
            <span className="font-medium">{g.name}</span>
            <span className="text-[10px] text-gray-400">{g.variant}</span>
          </div>
          <ScorePill score={g.score}/>
        </button>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// COMPONENT C — QuestionDetail
// ═══════════════════════════════════════════════════════════
const QuestionDetail = ({ student }: { student: Student }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <SectionTitle icon={<FileText size={18}/>} title={student.name} sub={`${student.variant} Вариант · ${student.score}% оноо`}/>
    <div className="space-y-3">
      {QUESTIONS.map(q=>{
        const stat   = Q_STATS.find(s=>s.q===`А-${q.no}`);
        const isHard = stat && stat.wrong>=10;
        return (
          <div key={q.no} className={`rounded-xl p-4 border ${isHard?"bg-red-50/50 border-red-100":"bg-gray-50/50 border-gray-100"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2">
                {isHard && <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0"/>}
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.no}. {q.text}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isHard && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">{stat?.wrong} алдсан</span>}
                <span className="text-[10px] text-gray-400">{q.score}п</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {q.options.map(opt=>(
                <div key={opt} className={`px-2.5 py-2 rounded-lg text-xs text-center font-semibold border ${opt.charAt(0)===q.correct?"bg-emerald-100 text-emerald-700 border-emerald-200":"bg-white text-gray-500 border-gray-200"}`}>{opt}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// COMPONENT D — AI-generated TaskCard
// ═══════════════════════════════════════════════════════════
const TaskCard = ({ task, taskKey, onSend, sent }: { task:GeneratedTask; taskKey:string; onSend:(k:string,t:GeneratedTask)=>void; sent:boolean }) => (
  <div className={`rounded-xl border p-4 transition-all ${sent?"bg-emerald-50 border-emerald-200":"bg-white border-gray-100 hover:border-[#5136a8]/30 hover:shadow-sm"}`}>
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-bold text-gray-800">{task.title}</p>
        <DiffBadge level={task.difficulty}/>
      </div>
      <button onClick={()=>onSend(taskKey,task)} disabled={sent}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sent?"text-emerald-600 cursor-default":"bg-[#5136a8] text-white hover:bg-[#3e2880]"}`}>
        {sent ? <><CheckCircle size={12}/> Илгээсэн</> : <><Send size={12}/> Илгээх</>}
      </button>
    </div>
    {/* Why */}
    <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Яагаад алдсан бэ?</p>
      <p className="text-xs text-amber-800 leading-relaxed">{task.why}</p>
    </div>
    {/* Problem */}
    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Даалгавар</p>
      <p className="text-xs text-blue-800 font-medium leading-relaxed whitespace-pre-line">{task.problem}</p>
    </div>
    {/* Hint */}
    <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 mb-3">
      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">💡 Зааварчилгаа</p>
      <p className="text-xs text-purple-800 leading-relaxed">{task.hint}</p>
    </div>
    {/* Target students */}
    <div className="flex flex-wrap gap-1">
      {task.targetStudents.map(s=>(
        <span key={s} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">{s}</span>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// COMPONENT E — HardQuestionAccordion (AI generate on open)
// ═══════════════════════════════════════════════════════════
const HardQuestionAccordion = ({
  hq, sentTasks, onSend, onAnalysisReady, defaultOpen = false,
}: {
  hq:               HardQuestion;
  sentTasks:        Set<string>;
  onSend:           (k:string, t:GeneratedTask) => void;
  onAnalysisReady:  (qId:string, analysis:QuestionAnalysis) => void;
  defaultOpen?:     boolean;
}) => {
  const [open, setOpen]           = useState(defaultOpen);
  const [streaming, setStreaming] = useState("");
  const abortRef                  = useRef<AbortController | null>(null);

  // Auto-generate when first opened
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

    // Signal parent: loading started
    onAnalysisReady(hq.stat.q, null as unknown as QuestionAnalysis); // triggers loading state

    try {
      const atRisk = STUDENTS.filter(s => s.score < 80).map(s => s.name);
      const topStudents = STUDENTS.filter(s => s.score >= 85).map(s => s.name);

      const res = await fetch("/api/question-tasks", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  abortRef.current.signal,
        body: JSON.stringify({
          questionId:   hq.stat.q,
          questionText: hq.question?.text ?? "",
          correctAnswer: hq.question
            ? hq.question.options.find(o => o.charAt(0) === hq.question!.correct) ?? ""
            : "",
          wrongCount:   hq.stat.wrong,
          totalStudents: STUDENTS.length,
          atRiskStudents:  atRisk,
          topStudents:     topStudents,
          allStudents:     STUDENTS.map(s => s.name),
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
      {/* Header */}
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50/80 transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-red-500"/>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-gray-800">{hq.stat.q}</span>
              <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                {hq.stat.wrong}/{STUDENTS.length} алдсан ({Math.round(hq.stat.wrong/STUDENTS.length*100)}%)
              </span>
              {hq.analysis && (
                <span className="text-[10px] bg-emerald-100 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  ✓ AI бэлэн
                </span>
              )}
            </div>
            {hq.question && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{hq.question.text}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hq.loading && <RefreshCw size={14} className="text-[#5136a8] animate-spin"/>}
          {open ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Correct answer */}
          {hq.question && (
            <div className="px-5 pt-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <CheckCircle size={14} className="text-emerald-600 mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Зөв хариулт</p>
                  <p className="text-xs text-emerald-800 font-medium">
                    {hq.question.options.find(o=>o.charAt(0)===hq.question!.correct)}
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
                    <Brain size={13} className="text-[#5136a8] animate-pulse"/>
                    <span className="text-xs font-bold text-[#5136a8]">AI тайлбар болон даалгавар бэлдэж байна...</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono leading-relaxed line-clamp-4">
                    {streaming}<Cursor/>
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-pulse">
                  <div className="h-16 bg-amber-50 border border-amber-100 rounded-xl"/>
                  {[...Array(3)].map((_,i)=><div key={i} className="h-28 bg-gray-50 border border-gray-100 rounded-xl"/>)}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {hq.error && (
            <div className="px-5 pt-4 pb-5">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={14} className="text-red-500"/>
                <div className="flex-1">
                  <p className="text-xs text-red-700">{hq.error}</p>
                </div>
                <button onClick={generateAnalysis}
                  className="text-xs text-red-600 font-bold hover:underline">Дахин оролдох</button>
              </div>
            </div>
          )}

          {/* Analysis ready */}
          {hq.analysis && !hq.loading && (
            <div className="p-5 space-y-4">
              {/* Root cause + common error */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Brain size={10}/> Үндсэн алдааны шалтгаан
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed">{hq.analysis.rootCause}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertTriangle size={10}/> Нийтлэг алдаа
                  </p>
                  <p className="text-xs text-orange-800 leading-relaxed">{hq.analysis.commonError}</p>
                </div>
              </div>

              {/* Tasks */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  AI-ийн санал болгосон 3 ижил даалгавар
                </p>
                <div className="space-y-3">
                  {hq.analysis.tasks.map((task, i) => {
                    const key = `${hq.stat.q}-${i}`;
                    return (
                      <TaskCard key={key} task={task} taskKey={key} onSend={onSend} sent={sentTasks.has(key)}/>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Retry button if no analysis and not loading */}
          {!hq.analysis && !hq.loading && !hq.error && (
            <div className="p-5">
              <button onClick={generateAnalysis}
                className="w-full flex items-center justify-center gap-2 bg-[#5136a8]/8 hover:bg-[#5136a8]/12 text-[#5136a8] border border-[#5136a8]/20 px-4 py-3 rounded-xl text-sm font-bold transition">
                <Sparkles size={14}/> AI тайлбар болон даалгавар үүсгэх
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPONENT F — AI Class Report Cards
// ═══════════════════════════════════════════════════════════
const AIReportCards = ({ report }: { report: AIReport }) => {
  const hc = report.classHealthScore;
  const healthCls = hc>=75?"text-emerald-400":hc>=55?"text-amber-400":"text-red-400";
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#5136a8] to-[#3e2880] text-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-purple-300 rounded-full"/>
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200">AI Шинжээчийн тайлан</p>
          <div className="ml-auto bg-white/10 rounded-lg px-3 py-1 flex items-center gap-1.5">
            <span className="text-[10px] text-purple-200">Эрүүл мэнд</span>
            <span className={`text-sm font-black ${healthCls}`}>{hc}%</span>
          </div>
        </div>
        <p className="text-sm font-light leading-relaxed text-purple-50 mb-4">{report.summary}</p>
        <div className="pt-4 border-t border-white/10">
          <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Lightbulb size={11}/> Маргаашийн хичээл
          </p>
          <p className="text-xs text-purple-100 leading-relaxed">{report.nextLessonPlan}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5"><AlertTriangle size={11}/> Аюултай сэдэв</p>
          <p className="text-xl font-black text-red-600 mb-2">{report.weakTopic}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{report.weakTopicReason}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5"><Target size={11}/> Зөвлөмж</p>
          <p className="text-xs text-gray-700 leading-relaxed">{report.recommendation}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-3">🌟 Сайн тал</p>
          <p className="text-xs text-gray-700 leading-relaxed">{report.positiveNote}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm sm:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1.5"><Brain size={11}/> Нийтлэг логик алдаа</p>
          <p className="text-xs text-amber-800 leading-relaxed">{report.trendingMisconception}</p>
        </div>
        {report.atRiskStudents?.map(s=>(
          <div key={s.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-3">👤 Тусламж хэрэгтэй</p>
            <p className="text-lg font-black text-orange-600 mb-1.5">{s.name}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{s.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN — MaterialTab
// ═══════════════════════════════════════════════════════════
export const MaterialTab = ({ classId, className = "" }: MaterialTabProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(STUDENTS[0]);
  const [topHard, setTopHard]     = useState<HardQuestion[]>(getTopHard(3));
  const [sentTasks, setSentTasks] = useState<Set<string>>(new Set());
  const [toast,     setToast]     = useState<string | null>(null);

  // Class-level AI report (optional deep analysis)
  const [aiReport,   setAiReport]   = useState<AIReport | null>(null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiError,    setAiError]    = useState("");
  const [streamText, setStreamText] = useState("");
  const classAbortRef = useRef<AbortController | null>(null);

  // Called by accordion: update a single question's analysis state
  const handleAnalysisReady = (qId: string, analysis: QuestionAnalysis | null) => {
    setTopHard(prev => prev.map(h => {
      if (h.stat.q !== qId) return h;
      if (analysis === null) return { ...h, loading: true,  error: "",    analysis: undefined };
      if (!analysis.tasks?.length) return { ...h, loading: false, error: "AI хариулт буруу формат байна.", analysis: undefined };
      return { ...h, loading: false, error: "", analysis };
    }));
  };

  const handleSend = (key: string, task: GeneratedTask) => {
    setSentTasks(prev => new Set([...prev, key]));
    const names = task.targetStudents.slice(0, 2).join(", ");
    const extra = task.targetStudents.length > 2 ? ` +${task.targetStudents.length - 2}` : "";
    setToast(`"${task.title}" — ${names}${extra}-д илгээлээ ✓`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleClassAI = async () => {
    if (classAbortRef.current) classAbortRef.current.abort();
    classAbortRef.current = new AbortController();
    setAiLoading(true); setAiReport(null); setAiError(""); setStreamText("");
    try {
      const res = await fetch("/api/exam-result", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: classAbortRef.current.signal,
        body: JSON.stringify({ classId, className, students: STUDENTS, questions: QUESTIONS, stats: Q_STATS }),
      });
      if (!res.ok) { const e = await res.json() as { error?: string }; throw new Error(e.error ?? "Сервер алдаа"); }
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let raw = "";
      while (true) { const { value, done } = await reader.read(); if (done) break; raw += decoder.decode(value); setStreamText(raw); }
      setAiReport(JSON.parse(raw.replace(/```json|```/g, "").trim()) as AIReport);
      setStreamText("");
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") setAiError(e instanceof Error ? e.message : "Алдаа");
    } finally { setAiLoading(false); }
  };

  const totalSent = sentTasks.size;

  return (
    <div className="space-y-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#5136a8] text-white px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-300">
          <CheckCircle size={15}/><span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)}><X size={13} className="opacity-60 hover:opacity-100"/></button>
        </div>
      )}

      {/* A — Chart */}
      <ExamChart className={className} topHard={topHard}/>

      {/* B+C — Students & Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentGradeList selected={selectedStudent} onSelect={setSelectedStudent} className={className}/>
        <QuestionDetail student={selectedStudent}/>
      </div>

      {/* E — Hard Question Accordions (AI generate on open) */}
      <div>
        <SectionTitle
          icon={<Zap size={18}/>}
          title="Алдсан асуулт — AI тайлбар + ижил даалгавар"
          sub="Accordion нээхэд AI автоматаар тайлбар болон 3 түвшний даалгавар бэлдэнэ"
        />

        {/* Legend */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <BookOpen size={14} className="text-blue-500 flex-shrink-0"/>
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
            <CheckCircle size={16} className="text-emerald-600"/>
            <p className="text-sm text-emerald-700 font-medium">
              Нийт <strong>{totalSent}</strong> даалгавар сурагчдад илгээгдлээ.
            </p>
          </div>
        )}
      </div>

      {/* F — Optional deep class analysis */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <SectionTitle icon={<Brain size={18}/>} title="AI Ангийн Гүнзгий Шинжилгээ" sub="Streaming · сурагч бүрийн оношилгоо + сурах зам"/>
          <div className="flex gap-2 -mt-5">
            {aiLoading && (
              <button onClick={() => classAbortRef.current?.abort()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition">
                <RefreshCw size={13} className="animate-spin"/> Зогсоох
              </button>
            )}
            <button onClick={handleClassAI} disabled={aiLoading}
              className="flex items-center gap-2 bg-[#5136a8] hover:bg-[#3e2880] text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-sm shadow-purple-200">
              <Sparkles size={14}/>
              {aiLoading ? "Шинжилж байна..." : "AI шинжилгээ ✨"}
            </button>
          </div>
        </div>

        {aiLoading && (
          <div className="mb-4 bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={13} className="text-[#5136a8] animate-pulse"/>
              <span className="text-xs font-bold text-[#5136a8]">AI боловсруулж байна...</span>
            </div>
            {streamText
              ? <p className="text-[11px] text-gray-500 font-mono leading-relaxed line-clamp-3">{streamText}<Cursor/></p>
              : <div className="flex gap-1.5">{[40,60,35].map((w,i)=><div key={i} className="h-1.5 rounded-full bg-[#5136a8]/30 animate-pulse" style={{width:`${w}%`,animationDelay:`${i*0.2}s`}}/>)}</div>
            }
          </div>
        )}

        {aiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm flex items-center gap-2">
            <AlertTriangle size={15}/> {aiError}
          </div>
        )}

        {aiReport && <AIReportCards report={aiReport}/>}

        {!aiReport && !aiLoading && (
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-dashed border-purple-200 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#5136a8]/8 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={22} className="text-[#5136a8]"/>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Ангийн гүнзгий шинжилгээ хийгдээгүй</h4>
            <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">
              Сурагч бүрийн оношилгоо, мэдлэгийн цоорхой, personalized сурах замыг авахын тулд дарна уу.
            </p>
            <button onClick={handleClassAI}
              className="inline-flex items-center gap-2 bg-[#5136a8] hover:bg-[#3e2880] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm shadow-purple-200">
              <Sparkles size={14}/> AI шинжилгээ эхлүүлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
