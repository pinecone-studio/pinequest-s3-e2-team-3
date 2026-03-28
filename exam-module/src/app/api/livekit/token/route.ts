import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { SignJWT } from "jose";

export const runtime = "edge";

type TokenBody = {
  roomName?: unknown;
  identity?: unknown;
  role?: unknown;
};

function isValidIdSegment(s: string): boolean {
  return /^[a-zA-Z0-9_-]{1,128}$/.test(s);
}

function getLiveKitCredentials(): { apiKey: string; apiSecret: string } | null {
  try {
    void getRequestContext<{
      LIVEKIT_API_KEY?: string;
      LIVEKIT_API_SECRET?: string;
    }>();
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (apiKey && apiSecret) return { apiKey, apiSecret };
  } catch {
    /* local Next dev without CF bindings */
  }
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (apiKey && apiSecret) return { apiKey, apiSecret };
  return null;
}

export async function POST(request: Request) {
  let body: TokenBody;
  try {
    body = (await request.json()) as TokenBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const roomName =
    typeof body.roomName === "string" ? body.roomName.trim() : "";
  const identity =
    typeof body.identity === "string" ? body.identity.trim() : "";
  const role =
    body.role === "student" || body.role === "teacher" ? body.role : null;

  if (!roomName || !identity || !role) {
    return NextResponse.json(
      { error: "roomName, identity, and role (student|teacher) are required" },
      { status: 400 },
    );
  }

  if (!isValidIdSegment(roomName) || !isValidIdSegment(identity)) {
    return NextResponse.json(
      { error: "Invalid roomName or identity format" },
      { status: 400 },
    );
  }

  const creds = getLiveKitCredentials();
  if (!creds) {
    return NextResponse.json(
      {
        error:
          "LiveKit is not configured (LIVEKIT_API_KEY / LIVEKIT_API_SECRET)",
      },
      { status: 503 },
    );
  }

  const videoGrant =
    role === "student"
      ? {
          roomJoin: true,
          room: roomName,
          canPublish: true,
          canSubscribe: false,
          canPublishData: false,
        }
      : {
          roomJoin: true,
          room: roomName,
          canPublish: false,
          canSubscribe: true,
          canPublishData: false,
        };

  const secret = new TextEncoder().encode(creds.apiSecret);
  const token = await new SignJWT({ video: videoGrant })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(creds.apiKey)
    .setSubject(identity)
    .setExpirationTime("6h")
    .setNotBefore(0)
    .sign(secret);

  return NextResponse.json({ token });
}
