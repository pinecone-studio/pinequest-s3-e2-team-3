import md5 from "md5";
import { getDb } from "@/db";
import { proctorLogs as proctorLogsTable } from "@/db/schema";
import {
  mapJoinedProctorRowToGraphQL,
  resolveExamIdForSession,
} from "@/app/api/graphql/proctor-log-map";
import { PUSHER_CHANNELS, PUSHER_EVENTS } from "@/lib/constants";
import { MutationResolvers } from "@/gql/graphql";

type PusherBroadcastPayload = {
  id: string;
  examId: string | null;
  studentId: string | null;
  eventType: string;
  createdAt: string;
  updatedAt: string;
};

function hasCfWaitUntil(
  ctx: unknown,
): ctx is { cfWaitUntil: (p: Promise<unknown>) => void } {
  return (
    typeof ctx === "object" &&
    ctx !== null &&
    "cfWaitUntil" in ctx &&
    typeof (ctx as { cfWaitUntil: unknown }).cfWaitUntil === "function"
  );
}

async function triggerPusherEdge(
  channel: string,
  event: string,
  data: PusherBroadcastPayload,
) {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster =
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim() || "ap1";

  if (!appId || !key || !secret) {
    console.warn("Pusher environment variables are missing.");
    return;
  }

  const path = `/apps/${appId}/events`;
  const body = JSON.stringify({
    name: event,
    channels: [channel],
    data: JSON.stringify(data),
  });

  const auth_timestamp = Math.floor(Date.now() / 1000);

  const body_md5 = md5(body);

  const queryString = `auth_key=${key}&auth_timestamp=${auth_timestamp}&auth_version=1.0&body_md5=${body_md5}`;
  const auth_string = `POST\n${path}\n${queryString}`;

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle
    .sign("HMAC", cryptoKey, encoder.encode(auth_string))
    .then((hash) =>
      Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    );

  const url = `https://api-${cluster}.pusher.com${path}?${queryString}&auth_signature=${signature}`;

  const res = await fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      "Pusher HTTP error:",
      res.status,
      text.slice(0, 200),
    );
  }
}

export const createProctorLog: MutationResolvers["createProctorLog"] = async (
  _parent,
  { sessionId, examId, studentId, eventType },
  context,
) => {
  if (!studentId) throw new Error("studentId is required");

  const db = getDb(context.db);

  const [created] = await db
    .insert(proctorLogsTable)
    .values({
      sessionId: sessionId ?? null,
      studentId,
      eventType,
    })
    .returning();

  if (!created) throw new Error("Proctor log not created");

  const examIdFromSession = await resolveExamIdForSession(
    db,
    created.sessionId,
  );
  const resolvedExamId = examIdFromSession ?? examId ?? null;

  const formattedLog = mapJoinedProctorRowToGraphQL({
    id: created.id,
    sessionId: created.sessionId,
    studentId: created.studentId,
    eventType: created.eventType,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    examIdFromSession: resolvedExamId,
  });

  const pusherPayload: PusherBroadcastPayload = {
    id: formattedLog.id,
    examId: formattedLog.examId,
    studentId: formattedLog.studentId,
    eventType: formattedLog.eventType,
    createdAt: formattedLog.createdAt,
    updatedAt: formattedLog.updatedAt,
  };

  const pusherPromise = triggerPusherEdge(
    PUSHER_CHANNELS.EXAM_FEED,
    PUSHER_EVENTS.NEW_LOG,
    pusherPayload,
  );

  if (hasCfWaitUntil(context)) {
    context.cfWaitUntil(pusherPromise);
  } else {
    void pusherPromise.catch((err) =>
      console.error("Pusher Broadcast Error:", err),
    );
  }

  return formattedLog;
};
