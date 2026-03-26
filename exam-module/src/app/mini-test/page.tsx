"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function StudentPage() {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(() => typeof window !== "undefined" ? navigator.onLine : true);
  
  const pending = useLiveQuery(() => db.answers.where("status").equals("pending").toArray());

  useEffect(() => {
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
  }, []);

  // Sync: Багшийн "сервер" рүү илгээх симуляци
  useEffect(() => {
    if (isOnline && pending?.length) {
      pending.forEach(async (item) => {
        await new Promise(r => setTimeout(r, 1000)); // Илгээж буй хугацаа
        await db.answers.update(item.id!, { status: 'synced' });
      });
    }
  }, [isOnline, pending]);

  const sendAnswer = async () => {
    if (!name || !input) return alert("Нэр болон хариултаа бичнэ үү!");
    await db.answers.add({ studentName: name, questionId: 1, text: input, status: 'pending' });
    setInput("");
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">📝 Сурагчийн хэсэг</h1>
      <input className="w-full p-3 border rounded mb-2 text-black" placeholder="Таны нэр" value={name} onChange={e => setName(e.target.value)} />
      <textarea className="w-full p-3 border rounded mb-4 text-black" placeholder="Хариулт..." value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendAnswer} className="w-full bg-blue-600 text-white py-3 rounded font-bold">Илгээх</button>
      
      <div className="mt-4 text-xs font-bold uppercase">
        Төлөв: <span className={isOnline ? "text-green-500" : "text-red-500"}>{isOnline ? "Online" : "Offline (Хүлээгдэж буй: " + pending?.length + ")"}</span>
      </div>
    </div>
  );
}