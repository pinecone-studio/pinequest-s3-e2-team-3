import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("submitted answer:", body);

    return NextResponse.json({
      ok: true,
      message: "Answer received",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid body" },
      { status: 400 },
    );
  }
}
