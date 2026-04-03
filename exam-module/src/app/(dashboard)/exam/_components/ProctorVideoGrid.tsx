"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  TrackLoop,
  VideoTrack,
  useTrackRefContext,
  useTracks,
} from "@livekit/components-react";
import { isTrackReference } from "@livekit/components-core";
import { DefaultReconnectPolicy, RoomEvent, Track } from "livekit-client";
import { useProctorLogsPusher } from "@/hooks/useProctorLogsPusher";
import { cn } from "@/lib/utils";

const teacherReconnectPolicy = new DefaultReconnectPolicy([
  0,
  300,
  600,
  1_200,
  2_400,
  4_800,
  7_000,
  ...Array(20).fill(7_000),
]);

const HIGHLIGHT_MS = 14_000;

type ProctorVideoGridProps = {
  examSessionId: string;
  /** If set, Pusher highlights only apply when the log matches this exam */
  examId?: string | null;
  enabled?: boolean;
  className?: string;
  /** Maps LiveKit participant identity (student id) to display name */
  studentNames?: Map<string, string>;
};

function GridTile({
  highlightedIds,
  studentNames,
}: {
  highlightedIds: Set<string>;
  studentNames?: Map<string, string>;
}) {
  const trackRef = useTrackRefContext();
  const identity = trackRef.participant.identity;
  const label = studentNames?.get(identity) ?? identity;
  const highlighted = highlightedIds.has(identity);

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-[20px] border-2 bg-gray-900 transition-[border-color] duration-300",
        highlighted ? "border-red-500" : "border-[#E8DEF8]",
      )}
    >
      {isTrackReference(trackRef) ? (
        <VideoTrack
          trackRef={trackRef}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-[10px] text-gray-500">
          Камер хүлээгдэж байна
        </div>
      )}
      {highlighted ? (
        <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] rounded-lg bg-black/60 px-3 py-2 shadow-sm backdrop-blur-[2px]">
          <p className="truncate text-left text-base font-semibold leading-tight text-white sm:text-lg">
            {label}
          </p>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-6 pb-4 pt-6">
          <p className="truncate text-[16px] font-semibold text-white">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

function RemoteCameraGrid({
  highlightedIds,
  studentNames,
}: {
  highlightedIds: Set<string>;
  studentNames?: Map<string, string>;
}) {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    {
      onlySubscribed: true,
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.TrackSubscribed,
        RoomEvent.TrackUnsubscribed,
        RoomEvent.Reconnected,
      ],
    },
  );

  const remote = tracks.filter(
    (t) => isTrackReference(t) && !t.participant.isLocal,
  );

  if (remote.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-[18px] border border-dashed border-[#E8DEF8] bg-[#F7F7FB] text-sm text-gray-500">
        Сурагчдын камер хүлээгдэж байна…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid max-h-[min(82vh,980px)] grid-cols-2 gap-1.5 overflow-y-auto pr-1",
        remote.length >= 3 && "xl:grid-cols-3",
        remote.length >= 5 && "xl:grid-cols-4",
      )}
    >
      <TrackLoop tracks={remote}>
        <GridTile highlightedIds={highlightedIds} studentNames={studentNames} />
      </TrackLoop>
    </div>
  );
}

type LiveKitSessionProps = {
  examSessionId: string;
  teacherIdentity: string;
  serverUrl: string;
  highlightedIds: Set<string>;
  className?: string;
  studentNames?: Map<string, string>;
};

function ProctorLiveKitSession({
  examSessionId,
  teacherIdentity,
  serverUrl,
  highlightedIds,
  className,
  studentNames,
}: LiveKitSessionProps) {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: examSessionId,
            identity: teacherIdentity,
            role: "teacher",
          }),
        });
        const raw = await res.text();
        if (!res.ok) {
          if (!cancelled) setTokenError(raw || `HTTP ${res.status}`);
          return;
        }
        const data = JSON.parse(raw) as { token?: string };
        if (cancelled) return;
        if (data.token) setToken(data.token);
        else setTokenError("Missing token");
      } catch (e) {
        if (!cancelled) {
          setTokenError(
            e instanceof Error ? e.message : "Token request failed",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [examSessionId, serverUrl, teacherIdentity]);

  if (tokenError) {
    return (
      <div
        className={cn(
          "rounded-[24px] border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800",
          className,
        )}
      >
        LiveKit token: {tokenError}
      </div>
    );
  }

  if (!token) {
    return (
      <div
        className={cn(
          "flex min-h-50 items-center justify-center rounded-[24px] border border-[#E8DEF8] bg-white text-sm text-gray-500",
          className,
        )}
      >
        Видео сүлжээнд холбогдож байна…
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        audio={false}
        video={true}
        options={{
          adaptiveStream: true,
          dynacast: true,
          reconnectPolicy: teacherReconnectPolicy,
          disconnectOnPageLeave: true,
        }}
        connectOptions={{ autoSubscribe: true, maxRetries: 4 }}
        className="min-w-0"
      >
        <div className="rounded-[24px] border border-[#E8DEF8] bg-[#FCFBFF] p-3">
          <p className="mb-2 text-sm font-semibold text-gray-900">
            Сурагчдын шууд видео (LiveKit)
          </p>
          <RemoteCameraGrid
            highlightedIds={highlightedIds}
            studentNames={studentNames}
          />
          {highlightedIds.size === 0 ? null : (
            <p className="mt-3 text-xs text-gray-500">
              Улаан хүрээтэй тайл нь сүүлийн AI/Pusher анхааруулгатай таарсан
              сурагчийн ID-тай таарна.
            </p>
          )}
        </div>
      </LiveKitRoom>
    </div>
  );
}

export function ProctorVideoGrid({
  examSessionId,
  examId,
  enabled = true,
  className,
  studentNames,
}: ProctorVideoGridProps) {
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() ?? "";
  const [teacherIdentity] = useState(
    () => `teacher-${crypto.randomUUID().replace(/-/g, "")}`,
  );

  const [highlightedIds, setHighlightedIds] = useState(() => new Set<string>());
  const highlightTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const addHighlight = useCallback((studentId: string) => {
    setHighlightedIds((prev) => {
      const next = new Set(prev);
      next.add(studentId);
      return next;
    });
    const existing = highlightTimers.current.get(studentId);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      highlightTimers.current.delete(studentId);
      setHighlightedIds((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }, HIGHLIGHT_MS);
    highlightTimers.current.set(studentId, t);
  }, []);

  useEffect(() => {
    const timers = highlightTimers.current;
    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  const onPusherLog = useCallback(
    (log: { studentId: string; examId: string | null }) => {
      if (
        examId != null &&
        examId !== "" &&
        log.examId != null &&
        log.examId !== examId
      ) {
        return;
      }
      addHighlight(log.studentId);
    },
    [examId, addHighlight],
  );

  useProctorLogsPusher(enabled, onPusherLog);

  if (!serverUrl) {
    return (
      <div
        className={cn(
          "rounded-[24px] border border-dashed border-amber-200 bg-amber-50/80 px-4 py-8 text-center text-sm text-amber-900",
          className,
        )}
      >
        LiveKit URL тохируулаагүй байна (NEXT_PUBLIC_LIVEKIT_URL).
      </div>
    );
  }

  if (!enabled) return null;

  return (
    <ProctorLiveKitSession
      key={examSessionId}
      examSessionId={examSessionId}
      teacherIdentity={teacherIdentity}
      serverUrl={serverUrl}
      highlightedIds={highlightedIds}
      className={className}
      studentNames={studentNames}
    />
  );
}
