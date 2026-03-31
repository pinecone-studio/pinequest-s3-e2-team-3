import OpenAI from "openai";
import { z } from "zod";

export const runtime = "edge";

// ─── Schemas ──────────────────────────────────────────────────────────────────
const studentSchema  = z.object({ id: z.string(), name: z.string(), score: z.number(), variant: z.string() });
const questionSchema = z.object({ no: z.number(), text: z.string(), score: z.number(), options: z.array(z.string()), correct: z.string() });
const statSchema     = z.object({ q: z.string(), wrong: z.number() });

const classSchema = z.object({
  mode:      z.literal("class"),
  classId:   z.string(),
  className: z.string().default(""),
  students:  z.array(studentSchema),
  questions: z.array(questionSchema),
  stats:     z.array(statSchema),
});

const questionModeSchema = z.object({
  mode:          z.literal("question"),
  questionId:    z.string(),
  questionText:  z.string(),
  correctAnswer: z.string(),
  wrongCount:    z.number(),
  totalStudents: z.number(),
  atRiskStudents:  z.array(z.string()),
  topStudents:     z.array(z.string()),
  allStudents:     z.array(z.string()),
});

const bodySchema = z.discriminatedUnion("mode", [classSchema, questionModeSchema]);

// ─── Prompts: CLASS mode ──────────────────────────────────────────────────────
function classSystemPrompt(className: string): string {
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
  "atRiskStudents": [{ "name": "...", "reason": "..." }],
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

function classUserPrompt(
  students:  z.infer<typeof studentSchema>[],
  questions: z.infer<typeof questionSchema>[],
  stats:     z.infer<typeof statSchema>[],
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

// ─── Prompts: QUESTION mode ───────────────────────────────────────────────────
const QUESTION_SYSTEM = `Та математикийн туршлагатай багш AI юм.
Сурагчдын шалгалтын алдааг шинжлэж, тайлбар болон ижил төрлийн дасгал даалгавар бэлддэг.

ХАРИУЛТ: Зөвхөн дараах JSON. Markdown, тайлбар, нэмэлт текст бүү нэм.

{
  "rootCause": "Яагаад сурагчид энэ асуулт дээр алдсан — ойлголтын хоцрогдол, томьёоны алдаа гэх мэт (2-3 өгүүлбэр)",
  "commonError": "Сурагчдын хийдэг нийтлэг тооцооны буюу логикийн алдааны тодорхой тайлбар",
  "tasks": [
    {
      "title":          "Даалгаврын гарчиг",
      "why":            "Яагаад энэ даалгавар хийх хэрэгтэй вэ",
      "problem":        "Бодит бодлогын текст — тоо, томьёо, нөхцөл бүхий конкрет даалгавар",
      "hint":           "Зааварчилгаа — эхлэх арга, ямар томьёо ашиглах",
      "difficulty":     "easy",
      "targetStudents": ["сурагчийн нэр"]
    },
    { "difficulty": "medium", ... },
    { "difficulty": "hard",   ... }
  ]
}

ДҮРМҮҮД:
- "problem" талбарт бодит тоо, тэмдэг бүхий конкрет бодлого бичих (жишээ: "3x + 7 = 22 бол x = ?")
- "easy" → atRiskStudents, "medium" → дундаж, "hard" → топ сурагчид
- Монгол хэлээр бичих
- ЗӨВХӨН JSON буцаа`;

function questionUserPrompt(parsed: z.infer<typeof questionModeSchema>): string {
  const {
    questionId, questionText, correctAnswer,
    wrongCount, totalStudents,
    atRiskStudents, topStudents, allStudents,
  } = parsed;
  const pct = Math.round((wrongCount / totalStudents) * 100);

  return `АСУУЛТ: ${questionId}
Асуултын текст: "${questionText}"
Зөв хариулт: ${correctAnswer}
Алдсан: ${wrongCount}/${totalStudents} сурагч (${pct}%)

Сурагчдын мэдээлэл:
- Бүх сурагчид: ${allStudents.join(", ")}
- Хоцрогдсон (score<80): ${atRiskStudents.join(", ") || "байхгүй"}
- Топ (score≥85): ${topStudents.join(", ") || "байхгүй"}

Дээрх асуулт дээр яагаад ${pct}% сурагч алдсан болохыг шинжилж JSON форматаар хариул.`;
}

// ─── Shared streaming helper ──────────────────────────────────────────────────
async function streamGroq(
  system: string,
  user:   string,
  temp:   number,
): Promise<Response> {
  const client = new OpenAI({
    apiKey:  process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const stream = await client.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    temperature: temp,
    stream:      true,
    messages: [
      { role: "system", content: system },
      { role: "user",   content: user   },
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
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: Request): Promise<Response> {
  try {
    const body   = await req.json();
    const parsed = bodySchema.parse(body);

    if (parsed.mode === "class") {
      return streamGroq(
        classSystemPrompt(parsed.className),
        classUserPrompt(parsed.students, parsed.questions, parsed.stats),
        0.3,
      );
    }

    // mode === "question"
    return streamGroq(
      QUESTION_SYSTEM,
      questionUserPrompt(parsed),
      0.4,
    );
  } catch (err: unknown) {
    console.error("[exam-result]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" },
      { status: 500 },
    );
  }
}
