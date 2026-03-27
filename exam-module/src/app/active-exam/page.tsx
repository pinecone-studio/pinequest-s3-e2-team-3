"use client";

export const runtime = "edge";

import { useProctor } from "@/providers/ProctorProvider";
import { useAudioProctor } from "@/providers/SpeechRecognizeProvider";

import { useRef, useCallback, useEffect, useState, use } from "react";
import { ProctoringDashboard } from "./_components/ProctoringDashboard";
import {
  useCreateProctorLogMutation,
  useGetExamSessionForActiveExamQuery,
} from "@/gql/graphql";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ExamPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = use(searchParams);
  const studentId =
    typeof resolved.studentId === "string" ? resolved.studentId : "";
  const examId = typeof resolved.examId === "string" ? resolved.examId : "";
  const examSessionId =
    typeof resolved.examSessionId === "string" ? resolved.examSessionId : "";

  const legacyLink = Boolean(studentId && examId && !examSessionId);
  const sessionLink = Boolean(studentId && examSessionId);
  const linkValid = Boolean(studentId && (examSessionId || examId));

  const { data: sessionData, loading: sessionLoading, error: sessionError } =
    useGetExamSessionForActiveExamQuery({
      variables: { id: examSessionId },
      skip: !examSessionId,
    });

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!examSessionId) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [examSessionId]);

  const session = sessionData?.examSession ?? null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastFlagTime = useRef<Record<string, number>>({});
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [createProctorLogMutation, {}] = useCreateProctorLogMutation();

  const effectiveExamId = session?.examId ?? examId;

  // 1. Initialize Hardware (Camera & Mic)
  useEffect(() => {
    const currentVideo = videoRef.current;
    async function setupHardware() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });

        if (currentVideo) {
          currentVideo.srcObject = stream;
          currentVideo.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error("Camera/Mic Access Denied:", err);
        alert(
          "Please allow camera and microphone access to continue the exam.",
        );
      }
    }

    setupHardware();

    return () => {
      if (currentVideo?.srcObject) {
        const tracks = (currentVideo.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Reporting Logic with Cooldown
  const reportFlag = useCallback(
    async (type: string) => {
      const nowMs = Date.now();
      const cooldown = 2000;

      if (nowMs - (lastFlagTime.current[type] || 0) < cooldown) return;

      lastFlagTime.current[type] = nowMs;
      console.warn(`[PROCTOR ALERT] ${type}`);

      await createProctorLogMutation({
        variables: {
          eventType: type,
          studentId,
          examId: effectiveExamId || undefined,
        },
      });
    },
    [studentId, effectiveExamId, createProctorLogMutation],
  );

  // 3. Session time window (null until session row is loaded for session links)
  const sessionTimeState =
    session && examSessionId
      ? (() => {
          const start = Date.parse(session.startTime);
          const end = Date.parse(session.endTime);
          if (now < start) return "not_started" as const;
          if (now > end) return "ended" as const;
          return "active" as const;
        })()
      : null;

  const examWindowActive =
    legacyLink || sessionTimeState === "active";

  useProctor(videoRef, examWindowActive ? reportFlag : () => {});
  useAudioProctor(
    examWindowActive ? reportFlag : () => {},
    audioCanvasRef,
  );

  if (!linkValid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалтын холбоос буруу байна.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          И-мэйлээр ирсэн холбоосоор орно уу (studentId болон examId эсвэл
          examSessionId заавал байх ёстой).
        </p>
      </div>
    );
  }

  if (sessionLink && sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-400">Шалгалтын хуваарь ачаалж байна…</p>
      </div>
    );
  }

  if (sessionLink && (sessionError || !session)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалтын сесс олдсонгүй.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Холбоос хүчингүй эсвэл хугацаа дууссан байж магадгүй. Багшид хандана уу.
        </p>
      </div>
    );
  }

  if (sessionLink && examId && session && session.examId !== examId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Холбоосын өгөгдөл таарахгүй байна.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          examId болон examSessionId зөрчилтэй байна.
        </p>
      </div>
    );
  }

  if (sessionLink && session && sessionTimeState === "not_started") {
    const startMs = Date.parse(session.startTime);
    const untilStart = startMs - now;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалт одоогоор эхлээгүй байна.</p>
        <p className="mt-4 text-3xl font-mono tabular-nums text-blue-400">
          {formatCountdown(untilStart)}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Эхлэх цаг: {new Date(session.startTime).toLocaleString()}
        </p>
      </div>
    );
  }

  if (sessionLink && session && sessionTimeState === "ended") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white">
        <p className="text-lg font-medium">Шалгалтын хугацаа дууссан.</p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Дуусах цаг: {new Date(session.endTime).toLocaleString()}
        </p>
      </div>
    );
  }

  const headerTitle = session?.description?.trim()
    ? session.description
    : "Midterm Exam: System Architecture";

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-black text-white font-sans">
      {/* Page Header */}
      <header className="w-full max-w-7xl flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            {headerTitle}
          </h1>
          <p className="text-xs text-slate-400">
            Сурагч: {studentId} · Шалгалт: {effectiveExamId}
            {examSessionId ? ` · Сесс: ${examSessionId}` : null}
          </p>
          {session && (
            <p className="text-xs text-slate-500 mt-1">
              Дуусах хүртэл:{" "}
              {formatCountdown(Math.max(0, Date.parse(session.endTime) - now))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isCameraReady && (
            <span className="text-xs text-yellow-500 animate-pulse">
              Initializing AI Sensors...
            </span>
          )}
          <div
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
              isCameraReady
                ? "bg-red-900/20 border-red-500 text-red-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-500"
            }`}
          >
            {isCameraReady ? "● LIVE MONITORING" : "OFFLINE"}
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full max-w-7xl">
        {/* Left: Exam Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
            <label className="block text-slate-400 text-sm mb-4 uppercase tracking-widest font-semibold">
              Question 1
            </label>
            <p className="text-xl leading-relaxed mb-6">
              Explain why **Drizzle ORM** is specifically advantageous when
              building for **Cloudflare D1** compared to traditional ORMs like
              Prisma?
            </p>
            <textarea
              disabled={!isCameraReady}
              placeholder={
                isCameraReady
                  ? "Type your answer..."
                  : "Connecting to proctoring service..."
              }
              className="w-full h-64 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-lg text-slate-200"
            />
          </div>
        </div>

        {/* Right: The Proctoring Sidebar */}
        <ProctoringDashboard
          videoRef={videoRef}
          audioCanvasRef={audioCanvasRef}
          isReady={isCameraReady}
        />
      </main>
    </div>
  );
}
