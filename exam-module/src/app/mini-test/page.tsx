"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";

async function syncAnswers() {
  const unsynced = await db.answers.filter((a) => !a.synced).toArray();

  for (const ans of unsynced) {
    try {
      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: ans.studentName,
          questionId: ans.questionId,
          answer: ans.answer,
        }),
      });

      if (!res.ok) throw new Error("submit failed");

      await db.answers.update(ans.id!, { synced: true });
    } catch {
      break;
    }
  }
}

export default function StudentPage() {
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [online, setOnline] = useState(false);
  const [status, setStatus] = useState("");

  const checkOnline = async () => {
    try {
      const res = await fetch(`/api/ping?ts=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setOnline(false);
        return;
      }

      const data = (await res.json()) as { ok?: boolean };
      setOnline(data.ok === true);
    } catch {
      setOnline(false);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem("student-name");
    const savedAnswer = localStorage.getItem("student-answer");

    if (savedName) setName(savedName);
    if (savedAnswer) setAnswer(savedAnswer);

    checkOnline();

    const onOnline = () => checkOnline();
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const interval = setInterval(checkOnline, 3000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("student-name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("student-answer", answer);
  }, [answer]);

  useEffect(() => {
    if (!online) return;
    syncAnswers();
  }, [online]);

  const handleSend = async () => {
    if (!name.trim() || !answer.trim()) {
      setStatus("Нэр болон хариултаа бичнэ үү");
      return;
    }

    setStatus("Хадгалж байна...");

    try {
      if (online) {
        const res = await fetch("/api/submit-answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName: name,
            questionId: "q1",
            answer,
          }),
        });

        if (!res.ok) throw new Error("submit failed");

        setStatus("Амжилттай илгээгдлээ");
      } else {
        await db.answers.add({
          studentName: name,
          questionId: "q1",
          answer,
          synced: false,
        });

        setStatus("OFFLINE: Локалд хадгаллаа");
      }
    } catch {
      await db.answers.add({
        studentName: name,
        questionId: "q1",
        answer,
        synced: false,
      });

      setStatus("OFFLINE: Локалд хадгаллаа");
    }

    setAnswer("");
    localStorage.removeItem("student-answer");
  };

  return (
    <main className="p-10 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">📝 Сурагчийн хэсэг</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Таны нэр"
          className="w-full p-3 border rounded mb-2 text-black"
          required
        />

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Хариугаа бичнэ үү"
          className="w-full p-3 border rounded mb-4 text-black min-h-[120px]"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-bold"
        >
          Илгээх
        </button>
      </form>

      <div className="mt-4 text-xs font-bold uppercase">
        ТӨЛӨВ:{" "}
        <span className={online ? "text-green-500" : "text-red-500"}>
          {online ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      <div className="mt-2 text-sm">{status}</div>
    </main>
  );
}
