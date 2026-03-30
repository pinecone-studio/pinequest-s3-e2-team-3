import OpenAI from "openai";
import { z } from "zod";

export const runtime = "edge";

// ─── Request schema ───────────────────────────────────────────────────────────
const requestSchema = z.object({
  classId:   z.string(),
  className: z.string().default(""),
  students:  z.array(z.object({ id:z.string(), name:z.string(), score:z.number(), variant:z.string() })),
  questions: z.array(z.object({ no:z.number(), text:z.string(), score:z.number(), options:z.array(z.string()), correct:z.string() })),
  stats:     z.array(z.object({ q:z.string(), wrong:z.number() })),
});

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildSystemPrompt(className: string): string {
  return `Та боловсролын мэргэжлийн дата шинжээч AI багш юм.
Зорилт: Математикийн шалгалтын өгөгдлийг шинжилж, Монгол хэлээр тайлан гаргах.

ХАРИУЛТЫН ХЭЛБЭР: Зөвхөн дараах JSON структурыг буцааж бол. Markdown, тайлбар, нэмэлт текст бүү нэм.

{
  "summary": "Ангийн нийт гүйцэтгэлийн тойм (3-4 өгүүлбэр)",
  "weakTopic": "Хамгийн хоцрогдсон сэдвийн нэр",
  "weakTopicReason": "Яагаад хоцрогдсон тайлбар",
  "recommendation": "Дараагийн хичээлд хийх тодорхой арга хэмжээ",
  "positiveNote": "Ангийн сайн тал",
  "trendingMisconception": "Сурагчдын нийтлэг гаргаж буй логик алдаа",
  "classHealthScore": 0-100,
  "nextLessonPlan": "Маргаашийн хичээлийн action plan",
  "atRiskStudents": [
    { "name": "...", "reason": "..." }
  ],
  "studentDiagnostics": [
    {
      "name": "...",
      "score": 0,
      "riskLevel": "high|medium|low",
      "knowledgeGaps": ["...", "..."],
      "trendingMisconception": "...",
      "strengths": ["...", "..."],
      "learningPath": [
        { "step": 1, "action": "...", "type": "practice|review|challenge" },
        { "step": 2, "action": "...", "type": "practice|review|challenge" },
        { "step": 3, "action": "...", "type": "practice|review|challenge" }
      ]
    }
  ]
}

Анги: ${className || "Тодорхойгүй"}
Хэл: Монгол
ЧУХАЛ: Зөвхөн JSON, өөр юу ч бүү бич.`;
}

function buildUserPrompt(
  students: z.infer<typeof requestSchema>["students"],
  questions: z.infer<typeof requestSchema>["questions"],
  stats: z.infer<typeof requestSchema>["stats"],
): string {
  const avg     = Math.round(students.reduce((s, g) => s + g.score, 0) / students.length);
  const hardest = stats.reduce((a, b) => (a.wrong > b.wrong ? a : b));
  const atRisk  = students.filter(s => s.score < 70);

  return `ӨГӨГДӨЛ:
Дундаж: ${avg}%
Хамгийн хэцүү асуулт: ${hardest.q} (${hardest.wrong} алдсан)
Эрсдэлтэй: ${atRisk.map(s => s.name).join(", ") || "байхгүй"}

СУРАГЧИД:
${students.map(s => `${s.name}: ${s.score}% (${s.variant})`).join("\n")}

АСУУЛТУУД:
${questions.map(q => `${q.no}. ${q.text} [зөв: ${q.correct}]`).join("\n")}

АЛДАЛТЫН СТАТИСТИК:
${stats.map(s => `${s.q}: ${s.wrong} алдсан`).join("\n")}

Дээрх өгөгдлөөр бүрэн JSON тайлан гарга.`;
}

// ─── Route ───────────────────────────────────────────────────────────────────
export async function POST(req: Request): Promise<Response> {
  try {
    const body   = await req.json();
    const parsed = requestSchema.parse(body);
    const { className, students, questions, stats } = parsed;

    const client = new OpenAI({
      apiKey:  process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Use streaming so the client can show progress
    const stream = await client.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      temperature: 0.3,
      stream:      true,
      messages: [
        { role: "system", content: buildSystemPrompt(className) },
        { role: "user",   content: buildUserPrompt(students, questions, stats) },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type":      "text/plain; charset=utf-8",
        "Cache-Control":     "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    console.error("[exam-result]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" },
      { status: 500 },
    );
  }
}
