"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

const QUESTIONS = [
  { id: 1, q: "Cloudflare-ийн сервергүй бааз юу вэ?", a: "D1" },
  { id: 2, q: "Next.js-д ашигладаг ORM юу вэ?", a: "Drizzle" },
  { id: 3, q: "Оффлайн апп-ыг юу гэж нэрлэдэг вэ?", a: "PWA" },
  { id: 4, q: "Хөтөч доторх локал бааз юу вэ?", a: "IndexedDB" },
  { id: 5, q: "React-ийн төлөв удирдах Hook юу вэ?", a: "useState" },
];

export default function CompleteTestPage() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // 1. "Нууц хайрцаг"-аас илгээгдээгүй өгөгдлийг хянах
  const pendingAnswers = useLiveQuery(() => db.answers.where("status").equals("pending").toArray());

  // 2. Интернэт төлөв хянах
  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
  }, []);

  // 3. АВТОМАТ SYNC (Интернэт ормогц сервер рүү илгээх)
  useEffect(() => {
    if (isOnline && pendingAnswers && pendingAnswers.length > 0) {
      const syncData = async () => {
        for (const item of pendingAnswers) {
          console.log(`Илгээж байна: Асуулт ${item.questionId}`);
          // Энд чиний бодит API/GraphQL Mutation дуудагдана
          // await fetch('/api/sync', { method: 'POST', body: JSON.stringify(item) });
          
          // Амжилттай болбол статусыг нь өөрчилнө
          await db.answers.update(item.id!, { status: 'synced' });
        }
      };
      syncData();
    }
  }, [isOnline, pendingAnswers]);

  // 4. Хариулт хадгалах
  const handleSave = async () => {
    const correct = input.toLowerCase() === QUESTIONS[step].a.toLowerCase();
    
    await db.answers.add({
      questionId: QUESTIONS[step].id,
      userAnswer: input,
      isCorrect: correct,
      status: 'pending'
    });

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setInput("");
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const score = pendingAnswers?.filter(a => a.isCorrect).length || 0;
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-2xl text-center">
        <h1 className="text-2xl font-bold mb-4">Шалгалт дууслаа!</h1>
        <div className="text-6xl font-black text-blue-600 mb-6">{score} / 5</div>
        <button onClick={() => window.location.reload()} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold">Дахин эхлэх</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      {/* Төлөв харуулах */}
      <div className={`mb-6 p-3 rounded-2xl text-center text-xs font-bold transition-all ${isOnline ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700 animate-pulse"}`}>
        {isOnline ? "● СҮЛЖЭЭ ХЭВИЙН" : "● ОФФЛАЙН ГOРИМ (Локал хадгалалт идэвхтэй)"}
      </div>

      <div className="bg-slate-50 p-8 rounded-[32px] border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all" style={{ width: `${((step + 1) / 5) * 100}%` }} />
        <p className="text-blue-500 font-bold text-xs mb-2">АСУУЛТ {step + 1}</p>
        <h2 className="text-xl font-bold text-gray-800 mb-8 leading-tight">{QUESTIONS[step].q}</h2>
        
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-4 bg-white border border-gray-200 rounded-2xl mb-6 text-black outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Хариултаа бичнэ үү..."
        />

        <button onClick={handleSave} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-blue-200 active:scale-95 transition-all">
          {step === 4 ? "Дуусгах" : "Дараагийн асуулт"}
        </button>
      </div>

      {/* Sync Төлөв (Debug) */}
      {pendingAnswers && pendingAnswers.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Синк хийгдэхийг хүлээж буй ({pendingAnswers.length})</p>
          <div className="flex gap-2">
            {pendingAnswers.map(a => <div key={a.id} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />)}
          </div>
        </div>
      )}
    </div>
  );
}