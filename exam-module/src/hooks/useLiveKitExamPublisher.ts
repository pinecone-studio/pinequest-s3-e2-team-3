"use client";

import { useEffect, useRef } from "react";
import {
  DefaultReconnectPolicy,
  Room,
  RoomEvent,
  Track,
  type DisconnectReason,
} from "livekit-client";

const LOW_VIDEO_ENCODING = {
  maxBitrate: 280_000,
  maxFramerate: 10,
} as const;

const examReconnectPolicy = new DefaultReconnectPolicy([
  0, 300, 600, 1_200, 2_400, 4_800, 7_000, ...Array(24).fill(7_000),
]);

async function postLiveKitToken(body: {
  roomName: string;
  identity: string;
  role: "student" | "teacher";
}): Promise<string> {
  const res = await fetch("/api/livekit/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `LiveKit token ${res.status}`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("LiveKit token missing in response");
  return data.token;
}

export type UseLiveKitExamPublisherOptions = {
  roomName: string | null;
  identity: string;
  mediaStream: MediaStream | null;
  enabled: boolean;
};

/**
 * Publishes the existing camera {@link MediaStream} to a LiveKit room at ~360p-class bitrate / 10fps.
 * Proctor AI and Pusher logging stay on the same stream and are unchanged.
 */
export function useLiveKitExamPublisher({
  roomName,
  identity,
  mediaStream,
  enabled,
}: UseLiveKitExamPublisherOptions) {
  const roomRef = useRef<Room | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const teardownRef = useRef(false);

  useEffect(() => {
    teardownRef.current = false;
    if (!enabled || !roomName || !identity || !mediaStream) return;

    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (!serverUrl?.trim()) {
      console.warn(
        "NEXT_PUBLIC_LIVEKIT_URL is not set; exam LiveKit publish skipped.",
      );
      return;
    }

    const videoTrack = mediaStream.getVideoTracks()[0];
    if (!videoTrack) return;

    let cancelled = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const disposeRoom = async () => {
      clearReconnectTimer();
      const r = roomRef.current;
      roomRef.current = null;
      if (r) {
        r.removeAllListeners();
        await r.disconnect();
      }
    };

    const scheduleFullReconnect = (reason: DisconnectReason | undefined) => {
      if (cancelled || teardownRef.current) return;
      const n = ++attemptRef.current;
      if (n > 12) {
        console.error("LiveKit: giving up after repeated disconnects", reason);
        return;
      }
      const delay = Math.min(12_000, 800 * 2 ** Math.min(n, 4));
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        void runSession();
      }, delay);
    };

    const runSession = async () => {
      if (cancelled) return;
      await disposeRoom();
      if (cancelled) return;

      const room = new Room({
        reconnectPolicy: examReconnectPolicy,
        disconnectOnPageLeave: false,
        adaptiveStream: false,
        dynacast: true,
      });
      roomRef.current = room;

      room.on(RoomEvent.Disconnected, (reason) => {
        if (cancelled || teardownRef.current) return;
        room.removeAllListeners();
        if (roomRef.current === room) roomRef.current = null;
        scheduleFullReconnect(reason);
      });

      try {
        const token = await postLiveKitToken({
          roomName,
          identity,
          role: "student",
        });
        if (cancelled) return;

        await room.connect(serverUrl, token, {
          autoSubscribe: false,
          maxRetries: 3,
        });
        if (cancelled) return;

        await room.localParticipant.publishTrack(videoTrack, {
          name: "camera",
          source: Track.Source.Camera,
          simulcast: false,
          videoCodec: "vp8",
          videoEncoding: LOW_VIDEO_ENCODING,
        });
        attemptRef.current = 0;
      } catch (e) {
        console.error("LiveKit exam publisher:", e);
        if (!cancelled && !teardownRef.current) {
          if (roomRef.current === room) {
            room.removeAllListeners();
            roomRef.current = null;
            await room.disconnect().catch(() => {});
          }
          scheduleFullReconnect(undefined);
        }
      }
    };

    void runSession();

    return () => {
      cancelled = true;
      teardownRef.current = true;
      void disposeRoom();
    };
  }, [enabled, roomName, identity, mediaStream]);
}
