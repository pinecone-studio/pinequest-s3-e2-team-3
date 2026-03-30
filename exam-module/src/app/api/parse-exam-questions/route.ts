import { NextResponse } from "next/server";

export const runtime = "edge";

interface ParsedQuestion {
  question: string;
  answers: string[];
  imageMarker: string | null;
}

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  return key || null;
}

/** Default when GEMINI_MODEL is unset; override if free-tier quota differs by model. */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiModelId(): string {
  const raw = process.env.GEMINI_MODEL?.trim();
  const id = raw || DEFAULT_GEMINI_MODEL;
  if (!/^[a-zA-Z0-9._-]+$/.test(id)) {
    return DEFAULT_GEMINI_MODEL;
  }
  return id;
}

const SYSTEM_PROMPT = `You are an exam question parser. You receive raw text extracted from a Word document containing multiple-choice test questions. Your job is to extract every question and its answer options into a structured JSON array.

Rules:
- Each question has a question text and 2 or more answer options (choices).
- Questions may be numbered (1, 2, 3… or I, II, III… etc.) or lettered. Strip the numbering from the question text.
- Answer options are typically labeled A, B, C, D (or А, Б, В, Г in Cyrillic, or 1, 2, 3, 4). Strip the option labels.
- If the text contains image markers like [IMAGE_1], [IMAGE_2], associate the marker with the question it appears closest to (usually the question right before or right after the marker).
- Do NOT guess which answer is correct. Only extract the question text and options.
- Preserve the original language of the questions (they may be in Mongolian, English, or other languages).
- Return ONLY a JSON array, no markdown fences, no extra text.

Output format (JSON array):
[
  {
    "question": "What is 2+2?",
    "answers": ["3", "4", "5", "6"],
    "imageMarker": null
  },
  {
    "question": "Identify the shape shown in the image",
    "answers": ["Circle", "Square", "Triangle"],
    "imageMarker": "[IMAGE_1]"
  }
]`;

export async function POST(request: Request) {
  let body: { text?: unknown };
  try {
    body = (await request.json()) as { text?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      { error: "No text content provided" },
      { status: 400 },
    );
  }

  if (text.length > 100_000) {
    return NextResponse.json(
      { error: "Text content too large (max 100,000 characters)" },
      { status: 400 },
    );
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured (GEMINI_API_KEY)" },
      { status: 503 },
    );
  }

  const modelId = getGeminiModelId();
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${apiKey}`;

  let geminiRes: Response;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            parts: [
              {
                text: `Extract the multiple-choice questions from the following exam document text:\n\n${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: `Failed to reach Gemini API: ${e instanceof Error ? e.message : "unknown error"}`,
      },
      { status: 502 },
    );
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Gemini API error (${geminiRes.status}): ${errText.slice(0, 500)}`,
      },
      { status: 502 },
    );
  }

  let geminiData: GeminiResponse;
  try {
    geminiData = (await geminiRes.json()) as GeminiResponse;
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Gemini response" },
      { status: 502 },
    );
  }

  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let questions: ParsedQuestion[];
  try {
    const parsed: unknown = JSON.parse(rawText);
    if (!Array.isArray(parsed)) {
      throw new Error("Expected a JSON array");
    }
    questions = (parsed as Record<string, unknown>[]).map((item) => ({
      question: typeof item.question === "string" ? item.question : "",
      answers: Array.isArray(item.answers)
        ? (item.answers as unknown[]).filter(
            (a): a is string => typeof a === "string",
          )
        : [],
      imageMarker:
        typeof item.imageMarker === "string" ? item.imageMarker : null,
    }));
  } catch {
    return NextResponse.json(
      {
        error: "Failed to parse questions from LLM response",
        raw: rawText.slice(0, 2000),
      },
      { status: 422 },
    );
  }

  return NextResponse.json({ questions });
}
