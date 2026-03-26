import md5 from "md5";
import { getDb } from "@/db";
import { proctorLogs as proctorLogsTable } from "@/db/schema";
import { PUSHER_CHANNELS, PUSHER_EVENTS } from "@/lib/constants";
import { MutationResolvers } from "@/gql/graphql";

type PusherBroadcastPayload = {
  id: string;
  examId: string | null;
  studentId: string;
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

// --- EDGE-COMPATIBLE PUSHER SIGNING (No Node.js Crypto) ---
async function triggerPusherEdge(
  channel: string,
  event: string,
  data: PusherBroadcastPayload,
) {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = "ap1"; // Singapore cluster for low latency in Mongolia

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

  // Pusher requires body_md5; Web Crypto does not support MD5 in Node/Edge — use a portable hash.
  const body_md5 = md5(body);

  const queryString = `auth_key=${key}&auth_timestamp=${auth_timestamp}&auth_version=1.0&body_md5=${body_md5}`;
  const auth_string = `POST\n${path}\n${queryString}`;

  // 2. HMAC-SHA256 Signing
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

  return fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });
}

// --- UTILS ---
const epochToISOString = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid epoch timestamp");
  const ms = n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
};

// --- MUTATION ---
export const createProctorLog: MutationResolvers["createProctorLog"] = async (
  _parent,
  { examId, studentId, eventType },
  context,
) => {
  const db = getDb(context.db);

  // 1. Insert into D1 Database via Drizzle
  const result = await db
    .insert(proctorLogsTable)
    .values({
      studentId,
      eventType,
      examId,
    })
    .returning();

  const created = result[0];

  const formattedLog: PusherBroadcastPayload = {
    id: created.id,
    examId: created.examId ?? null,
    studentId: created.studentId,
    eventType: created.eventType,
    createdAt: epochToISOString(created.createdAt),
    updatedAt: epochToISOString(created.updatedAt),
  };

  // 2. Trigger Real-time broadcast to the Teacher's Dashboard
  const pusherPromise = triggerPusherEdge(
    PUSHER_CHANNELS.EXAM_FEED,
    PUSHER_EVENTS.NEW_LOG,
    formattedLog,
  );

  // Use context.waitUntil to keep the Cloudflare Worker alive
  // without delaying the student's GraphQL response.
  if (hasCfWaitUntil(context)) {
    context.cfWaitUntil(pusherPromise);
  } else {
    // For local dev where waitUntil might not exist
    await pusherPromise.catch((err) =>
      console.error("Pusher Broadcast Error:", err),
    );
  }

  return formattedLog;
};
