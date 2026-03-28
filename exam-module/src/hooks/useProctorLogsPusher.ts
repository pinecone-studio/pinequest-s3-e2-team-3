"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { PUSHER_CHANNELS, PUSHER_EVENTS } from "@/lib/constants";

export type ProctorLogPayload = {
  id: string;
  examId: string | null;
  studentId: string;
  eventType: string;
  createdAt: string;
  updatedAt: string;
};

const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap1";

function normalizeProctorLogPayload(raw: unknown): ProctorLogPayload | null {
  let v: Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      v = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (raw && typeof raw === "object") {
    v = raw as Record<string, unknown>;
  } else {
    return null;
  }
  const id = v.id != null ? String(v.id) : "";
  const studentId = v.studentId != null ? String(v.studentId) : "";
  const eventType = v.eventType != null ? String(v.eventType) : "";
  const createdAt = v.createdAt != null ? String(v.createdAt) : "";
  const updatedAtRaw = v.updatedAt != null ? String(v.updatedAt) : "";
  const updatedAt = updatedAtRaw || createdAt;
  if (!id || !studentId || !eventType || !createdAt) return null;
  const examIdRaw = v.examId;
  const examId =
    examIdRaw === null || examIdRaw === undefined ? null : String(examIdRaw);
  return { id, examId, studentId, eventType, createdAt, updatedAt };
}

/**
 * Subscribes to Pusher when createProctorLog inserts a row (server triggers NEW_LOG).
 */
export function useProctorLogsPusher(
  enabled: boolean,
  onNewLog?: (log: ProctorLogPayload) => void,
) {
  const [connected, setConnected] = useState(false);
  const onNewLogRef = useRef(onNewLog);

  useEffect(() => {
    onNewLogRef.current = onNewLog;
  });

  useEffect(() => {
    if (!enabled) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    if (!key) {
      console.warn(
        "NEXT_PUBLIC_PUSHER_KEY is not set; proctor live feed disabled.",
      );
      return;
    }

    const pusher = new Pusher(key, { cluster });

    const onConnected = () => setConnected(true);
    const onDisconnected = () => setConnected(false);
    pusher.connection.bind("connected", onConnected);
    pusher.connection.bind("disconnected", onDisconnected);

    const channel = pusher.subscribe(PUSHER_CHANNELS.EXAM_FEED);

    const onNewLogEvent = (raw: unknown) => {
      const data = normalizeProctorLogPayload(raw);
      if (data) onNewLogRef.current?.(data);
    };

    channel.bind(PUSHER_EVENTS.NEW_LOG, onNewLogEvent);

    return () => {
      channel.unbind(PUSHER_EVENTS.NEW_LOG, onNewLogEvent);
      pusher.unsubscribe(PUSHER_CHANNELS.EXAM_FEED);
      pusher.connection.unbind("connected", onConnected);
      pusher.connection.unbind("disconnected", onDisconnected);
      pusher.disconnect();
      setConnected(false);
    };
  }, [enabled]);

  return { connected };
}
