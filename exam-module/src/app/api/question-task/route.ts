import OpenAI from "openai";
import { z } from "zod";

export const runtime = "edge";

// ─── Request ──────────────────────────────────────────────────────────────────
const schema = z.object({
  questionId:    z.string(),
  questionText:  z.string(),
  correctAnswer: z.string(),
  wrongCount:    z.number(),
  totalStudents: z.number(),
  atRiskStudents:  z.array(z.string()),
  topStudents:     z.array(z.string()),
  allStudents:     z.array(z.string()),
});

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM = `Та математикийн туршлагатай багш AI юм.
Сурагчдын шалгалтын алдааг шинжлэж, тайлбар болон ижил төрлийн дасгал даалгавар бэлддэг.

ХАРИУЛТ: Зөвхөн дараах JSON. Markdown, тайлбар, нэмэлт текст бүү нэм.

{
  "rootCause": "Яагаад сурагчид энэ асуулт дээр алдсан — ойлголтын хоцрогдол, томьёоны алдаа гэх мэт (2-3 өгүүлбэр)",
  "commonError": "Сурагчдын хийдэг нийтлэг тооцооны буюу логикийн алдааны тодорхой тайлбар",
  "tasks": [
    {
      "title":          "Даалгаврын гарчиг",
      "why":            "Яагаад энэ даалгавар хийх хэрэгтэй вэ — алдааны аль хэсгийг засахад чиглэсэн",
      "problem":        "Бодит бодлогын текст — тоо, томьёо, нөхцөл бүхий конкрет даалгавар",
      "hint":           "Зааварчилгаа — эхлэх арга, ямар томьёо ашиглах, алхамуудын санаа",
      "difficulty":     "easy",
      "targetStudents": ["сурагчийн нэр", ...]
    },
    {
      "title":          "...",
      "why":            "...",
      "problem":        "...",
      "hint":           "...",
      "difficulty":     "medium",
      "targetStudents": [...]
    },
    {
      "title":          "...",
      "why":            "...",
      "problem":        "...",
      "hint":           "...",
      "difficulty":     "hard",
      "targetStudents": [...]
    }
  ]
}

ДҮРМҮҮД:
- "problem" талбарт бодит тоо, тэмдэг бүхий конкрет бодлого бичих (жишээ: "3x + 7 = 22 бол x = ?")
- "easy" даалгавар → алдсан сурагчидад (atRiskStudents), "medium" → дундаж сурагчидад, "hard" → топ сурагчидад
- Монгол хэлээр бичих
- ЗӨВХӨН JSON буцаа`;

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: Request): Promise<Response> {
  try {
    const body   = await req.json();
    const parsed = schema.parse(body);
    const {
      questionId, questionText, correctAnswer,
      wrongCount, totalStudents,
      atRiskStudents, topStudents, allStudents,
    } = parsed;

    const pct = Math.round((wrongCount / totalStudents) * 100);

    const userPrompt = `АСУУЛТ: ${questionId}
Асуултын текст: "${questionText}"
Зөв хариулт: ${correctAnswer}
Алдсан: ${wrongCount}/${totalStudents} сурагч (${pct}%)

Сурагчдын мэдээлэл:
- Бүх сурагчид: ${allStudents.join(", ")}
- Хоцрогдсон (score<80): ${atRiskStudents.join(", ") || "байхгүй"}
- Топ (score≥85): ${topStudents.join(", ") || "байхгүй"}

Дээрх асуулт дээр яагаад ${pct}% сурагч алдсан болохыг шинжилж:
1. rootCause — үндсэн шалтгааныг тайлбарла
2. commonError — нийтлэг хийдэг алдааг тодорхойл
3. tasks — 3 түвшний ижил бодлого бэлд (easy/medium/hard)

JSON форматаар хариул.`;

    const client = new OpenAI({
      apiKey:  process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const stream = await client.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      temperature: 0.4,
      stream:      true,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user",   content: userPrompt },
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
    console.error("[question-tasks]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Тодорхойгүй алдаа" },
      { status: 500 },
    );
  }
}
