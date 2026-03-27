/**
 * Sends per-student exam links via [Resend](https://resend.com/docs/api-reference/emails/send-email) (HTTP, Edge-safe).
 */
export type ExamInviteRecipient = {
  email: string;
  name: string;
  studentId: string;
};

function resolveInviteBaseUrl(explicit?: string | null): string {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed.replace(/\/$/, "");
  return (
    process.env.EXAM_APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function sendExamInviteEmails(params: {
  recipients: ExamInviteRecipient[];
  examId: string;
  examSessionId: string;
  examName: string;
  sessionDescription: string;
  /** Origin of the HTTP request (e.g. from `new URL(request.url).origin`); preferred over env defaults. */
  baseUrl?: string | null;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = "Pinequest <noreply@pinequest.winnerscourse.com>";
  const baseUrl = resolveInviteBaseUrl(params.baseUrl);

  if (!apiKey) {
    console.warn(
      "[exam-invite] RESEND_API_KEY is not set; skipping invite emails.",
    );
    return;
  }

  const { recipients, examId, examSessionId, examName, sessionDescription } =
    params;
  if (recipients.length === 0) return;

  const results = await Promise.allSettled(
    recipients.map(async ({ email, name, studentId }) => {
      const examUrl = `${baseUrl}/active-exam?studentId=${encodeURIComponent(studentId)}&examId=${encodeURIComponent(examId)}&examSessionId=${encodeURIComponent(examSessionId)}`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: `Шалгалт: ${sessionDescription || examName}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 20px auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; color: #333; line-height: 1.6;">
    <h2 style="color: #1a73e8; margin-top: 0;">Сайн байна уу, ${escapeHtml(name)}!</h2>
    
    <p style="font-size: 16px; color: #5f6368;">
        Танд шалгалтын урилга ирлээ. Та доорх товчлуур дээр дарж эсвэл линкээр орж шалгалтаа өгнө үү.
    </p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="${escapeHtml(examUrl)}" 
           style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; transition: background-color 0.3s;">
           Шалгалт эхлүүлэх
        </a>
    </div>

    <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">

    <p style="font-size: 12px; color: #888; word-break: break-all;">
        Хэрэв дээрх товчлуур ажиллахгүй бол энэ холбоосыг хуулж хөтөч дээрээ нээнэ үү:<br>
        <a href="${escapeHtml(examUrl)}" style="color: #1a73e8;">${escapeHtml(examUrl)}</a>
    </p>
</div>
          `,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Resend failed for ${email}: ${res.status} ${text}`);
      }
    }),
  );

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[exam-invite]", r.reason);
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
