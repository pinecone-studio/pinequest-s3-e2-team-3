import { NextResponse } from "next/server";

type StoredAnswer = {
  id: number;
  studentName: string;
  questionId: string;
  answer: string;
  synced: boolean;
};

type SubmitAnswerBody = {
  studentName: string;
  questionId: string;
  answer: string;
};

const answers: StoredAnswer[] = [];

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isSubmitAnswerBody(value: unknown): value is SubmitAnswerBody {
  if (typeof value !== "object" || value === null) return false;

  const body = value as Record<string, unknown>;

  return (
    typeof body.studentName === "string" &&
    typeof body.questionId === "string" &&
    typeof body.answer === "string"
  );
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (!isSubmitAnswerBody(body)) {
      return NextResponse.json(
        { ok: false, message: "Invalid body" },
        { status: 400 },
      );
    }

    const newAnswer: StoredAnswer = {
      id: Date.now(),
      studentName: body.studentName,
      questionId: body.questionId,
      answer: body.answer,
      synced: true,
    };

    answers.push(newAnswer);

    return NextResponse.json({ ok: true, answer: newAnswer });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request" },
      { status: 400 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { answers },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
