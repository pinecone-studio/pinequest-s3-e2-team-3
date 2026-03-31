"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Answer, ProctorLogEntry } from "@/lib/db";

// Lazy-load Dexie db only in browser — never imported at module level
// so Edge Runtime SSR never sees BroadcastChannel
async function getDb() {
  const { db } = await import("@/lib/db");
  return db;
}
// ─── Types ───────────────────────────────────────────────────────────────────

type ReportFlag = (type: string) => Promise<void>;

interface UseExamIntegrityOptions {
  active: boolean;
  reportFlag: ReportFlag;
  studentId: string;
  examId?: string;

  sessionId?: string;
  /** Current online status setter (optional — component can track it). */
  onOnlineChange?: (online: boolean) => void;
}

// ─── Offline answer sync (from mini-test) ────────────────────────────────────

export async function syncOfflineAnswers() {
  try {
    const db = await getDb();
    const unsynced = await db.answers
      .filter((a: Answer) => !a.synced)
      .toArray();
    if (unsynced.length === 0) return;

    // Group answers by studentId + examId + sessionId key
    const grouped = new Map<string, Answer[]>();
    for (const ans of unsynced) {
      const key = `${ans.studentName}__${ans.examId ?? ""}__${ans.sessionId ?? ""}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(ans);
    }

    for (const answers of grouped.values()) {
      const first = answers[0]!;
      try {
        const answersPayload = answers.map((a: Answer) => ({
          questionId: a.questionId,
          answerIndex: Number(a.answer),
        }));

        console.log(
          "[syncOfflineAnswers] Attempting sync for",
          first.studentName,
          "examId:",
          first.examId,
          "sessionId:",
          first.sessionId,
        );

        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation SubmitExamAnswers($studentId: ID!, $examId: ID!, $sessionId: ID, $answers: [StudentExamAnswerInput!]!) {
              submitExamAnswers(studentId: $studentId, examId: $examId, sessionId: $sessionId, answers: $answers) { success submittedCount }
            }`,
            variables: {
              studentId: first.studentName,
              examId: first.examId ?? "",
              sessionId: first.sessionId ?? undefined,
              answers: answersPayload,
            },
          }),
        });

        if (!res.ok) throw new Error(`sync failed: HTTP ${res.status}`);
        const json = (await res.json()) as {
          data?: { submitExamAnswers?: { success: boolean } };
          errors?: unknown;
        };
        console.log("[syncOfflineAnswers] Response:", JSON.stringify(json));
        if (json.errors)
          throw new Error(`graphql error: ${JSON.stringify(json.errors)}`);
        if (!json.data?.submitExamAnswers?.success)
          throw new Error("submit returned success=false");

        for (const ans of answers) {
          await db.answers.update(ans.id!, { synced: true });
        }
        console.log(
          `[syncOfflineAnswers] ✅ Synced ${answers.length} answers for ${first.studentName}`,
        );
      } catch (err) {
        console.warn(
          "[syncOfflineAnswers] ❌ group failed, will retry later:",
          err,
        );
      }
    }
  } catch (e) {
    console.warn("[syncOfflineAnswers]", e);
  }
}

// ─── Ping-based online check (from mini-test) ───────────────────────────────

async function checkOnlineStatus(): Promise<boolean> {
  try {
    const res = await fetch(`/api/ping?ts=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}

// ─── Sync offline proctor logs via GraphQL ───────────────────────────────────

async function syncOfflineProctorLogs() {
  try {
    const db = await getDb();
    const unsynced = await db.proctorLogs
      .filter((l: ProctorLogEntry) => !l.synced)
      .toArray();
    for (const log of unsynced) {
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation CreateProctorLog($eventType: String!, $studentId: ID!, $examId: ID, $sessionId: ID) {
              createProctorLog(eventType: $eventType, studentId: $studentId, examId: $examId, sessionId: $sessionId) { id }
            }`,
            variables: {
              eventType: log.eventType,
              studentId: log.studentId,
              examId: log.examId || undefined,
              sessionId: log.sessionId || undefined,
            },
          }),
        });
        if (!res.ok) throw new Error("sync failed");
        await db.proctorLogs.update(log.id!, { synced: true });
      } catch {
        break; // stop on first failure, retry later
      }
    }
  } catch (e) {
    console.warn("[syncOfflineProctorLogs]", e);
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useExamIntegrity({
  active,
  reportFlag,
  studentId,
  examId,
  sessionId,
  onOnlineChange,
}: UseExamIntegrityOptions) {
  const isOnlineRef = useRef(navigator.onLine);
  const lastActivityRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleFlaggedRef = useRef(false);
  const IDLE_THRESHOLD_MS = 60_000; // 1 minute idle → flag

  // ── Smart reportFlag: try server, fallback to local Dexie ─────────────────

  const reportFlagSafe = useCallback(
    async (eventType: string) => {
      // Always try the real reportFlag first
      try {
        if (isOnlineRef.current) {
          await reportFlag(eventType);
          return; // success — done
        }
      } catch {
        // failed — fall through to offline save
      }
      // Offline or failed → save to IndexedDB
      try {
        const db = await getDb();
        await db.proctorLogs.add({
          eventType,
          studentId,
          examId,
          sessionId,
          timestamp: Date.now(),
          synced: false,
        });
        console.log(`[offline] Saved proctor log: ${eventType}`);
      } catch (e) {
        console.warn("[reportFlagSafe] Failed to save locally:", e);
      }
    },
    [reportFlag, studentId, examId, sessionId],
  );

  // ── 1. Offline / Online detection ──────────────────────────────────────────

  useEffect(() => {
    if (!active) return;

    const handleOnline = async () => {
      const reallyOnline = await checkOnlineStatus();
      if (reallyOnline && !isOnlineRef.current) {
        isOnlineRef.current = true;
        onOnlineChange?.(true);
        void reportFlagSafe("network_restored");
        // Sync offline-saved answers AND proctor logs
        void syncOfflineAnswers();
        void syncOfflineProctorLogs();
      }
    };

    const handleOffline = () => {
      if (isOnlineRef.current) {
        isOnlineRef.current = false;
        onOnlineChange?.(false);
        void reportFlagSafe("network_lost");
      }
    };

    // Initial check
    void (async () => {
      const online = await checkOnlineStatus();
      isOnlineRef.current = online;
      onOnlineChange?.(online);
      if (online) {
        void syncOfflineAnswers();
        void syncOfflineProctorLogs();
      }
    })();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic ping every 5s
    const pingInterval = setInterval(async () => {
      const online = await checkOnlineStatus();
      if (online !== isOnlineRef.current) {
        isOnlineRef.current = online;
        onOnlineChange?.(online);
        if (online) {
          void reportFlagSafe("network_restored");
          void syncOfflineAnswers();
          void syncOfflineProctorLogs();
        } else {
          void reportFlagSafe("network_lost");
        }
      }
    }, 5_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pingInterval);
    };
  }, [active, reportFlagSafe, onOnlineChange]);

  // ── 2. Tab / Visibility change detection ───────────────────────────────────

  useEffect(() => {
    if (!active) return;

    const handleVisibility = () => {
      if (document.hidden) {
        void reportFlagSafe("tab_hidden");
      } else {
        void reportFlagSafe("tab_visible");
      }
    };

    const handleBlur = () => {
      void reportFlagSafe("window_blur");
    };

    const handleFocus = () => {
      void reportFlagSafe("window_focus");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [active, reportFlagSafe]);

  // ── 3. Block copy / paste / cut ────────────────────────────────────────────

  useEffect(() => {
    if (!active) return;

    const block = (e: ClipboardEvent) => {
      e.preventDefault();
      void reportFlagSafe(`clipboard_${e.type}`);
    };

    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("cut", block);

    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      void reportFlagSafe("context_menu_blocked");
    };
    document.addEventListener("contextmenu", blockContext);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", blockContext);
    };
  }, [active, reportFlagSafe]);

  // ── 4. Idle detection ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!active) return;

    // Initialize timestamps when becoming active
    lastActivityRef.current = Date.now();
    idleFlaggedRef.current = false;

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      if (idleFlaggedRef.current) {
        idleFlaggedRef.current = false;
        void reportFlagSafe("user_active_again");
      }
    };

    // Any of these events count as "user is active"
    const events: (keyof DocumentEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    for (const ev of events) {
      document.addEventListener(ev, resetActivity, { passive: true });
    }

    // Check idle every 10 seconds
    idleTimerRef.current = setInterval(() => {
      const idleDuration = Date.now() - lastActivityRef.current;
      if (idleDuration >= IDLE_THRESHOLD_MS && !idleFlaggedRef.current) {
        idleFlaggedRef.current = true;
        void reportFlagSafe(`user_idle_${Math.round(idleDuration / 1000)}s`);
      }
    }, 10_000);

    return () => {
      for (const ev of events) {
        document.removeEventListener(ev, resetActivity);
      }
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [active, reportFlagSafe]);

  // ── 5. Answer speed tracking ───────────────────────────────────────────────
  // Call this when a choice changes to log how fast the student answers.

  const answerTimestampsRef = useRef<Record<string, number>>({});
  const examStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (active) {
      examStartTimeRef.current = Date.now();
      answerTimestampsRef.current = {};
    }
  }, [active]);

  const trackAnswerSelection = useCallback(
    (questionId: string) => {
      if (!active) return;
      const now = Date.now();
      const prevTimestamp = answerTimestampsRef.current[questionId];
      const sinceExamStart = Math.round(
        (now - examStartTimeRef.current) / 1000,
      );

      if (!prevTimestamp) {
        // First time answering this question
        void reportFlagSafe(
          `answer_selected:${questionId}:first:${sinceExamStart}s`,
        );
      } else {
        // Changed answer — how fast did they change it
        const sinceLastChange = Math.round((now - prevTimestamp) / 1000);
        void reportFlagSafe(
          `answer_changed:${questionId}:after:${sinceLastChange}s`,
        );
      }

      answerTimestampsRef.current[questionId] = now;
    },
    [active, reportFlagSafe],
  );

  return {
    /** Call this when a student selects/changes an answer. */
    trackAnswerSelection,
    /** Sync any offline answers manually (e.g. on submit). */
    syncOfflineAnswers,
    /** Check current online status. */
    checkOnlineStatus,
  };
}
