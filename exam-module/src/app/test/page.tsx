"use client";

import { useProctor } from "@/providers/ProctorProvider";
import { useAudioProctor } from "@/providers/SpeechRecognizeProvider";

import { useRef, useCallback, useEffect, useState, use } from "react";
import { ProctoringDashboard } from "./_components/ProctoringDashboard";

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastFlagTime = useRef<Record<string, number>>({});
  const [isCameraReady, setIsCameraReady] = useState(false);

  // 1. Initialize Hardware (Camera & Mic)
  useEffect(() => {
    async function setupHardware() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
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
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Reporting Logic with Cooldown
  const reportFlag = useCallback(
    async (type: string) => {
      const now = Date.now();
      const cooldown = 2000;

      if (now - (lastFlagTime.current[type] || 0) < cooldown) return;

      lastFlagTime.current[type] = now;
      console.warn(`[PROCTOR ALERT] ${type}`);

      try {
        await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation { createFlag(attemptId: "${id}", type: "${type}") }`,
          }),
        });
      } catch (e) {
        console.error("Failed to report proctor flag:", e);
      }
    },
    [id],
  );

  // 3. Initialize AI Hooks
  useProctor(videoRef, reportFlag);
  useAudioProctor(reportFlag, audioCanvasRef);

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-black text-white font-sans">
      {/* Page Header */}
      <header className="w-full max-w-7xl flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Midterm Exam: System Architecture
          </h1>
          <p className="text-xs text-slate-400">Student Session ID: {id}</p>
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
