/**
 * Sends teacher credentials (username + password) via Resend API.
 * Edge-safe — uses raw fetch, no npm dependency.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendTeacherCredentialsEmail(params: {
  email: string;
  name: string;
  lastName: string;
  username: string;
  password: string;
  loginUrl?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = "Pinequest <noreply@pinequest.winnerscourse.com>";

  if (!apiKey) {
    console.warn(
      "[send-teacher-creds] RESEND_API_KEY is not set; skipping credentials email.",
    );
    return;
  }

  const { email, name, lastName, username, password } = params;
  const loginUrl =
    params.loginUrl ?? "https://pinequest.winnerscourse.com/login";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Таны нэвтрэх мэдээлэл — Learning Management System",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 20px auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; color: #333;">
          <div style="background: linear-gradient(135deg, #21005D 0%, #5136a8 100%); padding: 30px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">Learning Management System</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Багшийн нэвтрэх мэдээлэл</p>
          </div>

          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-top: 0;">Сайн байна уу, <strong>${escapeHtml(name)} ${escapeHtml(lastName)}</strong>!</p>
            <p style="font-size: 14px; color: #5f6368; line-height: 1.6;">
              Таны бүртгэл амжилттай үүслээ. Доорх мэдээллийг ашиглан системд нэвтэрнэ үү.
            </p>

            <div style="background: #f8f9fa; border: 1px solid #e8eaed; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #5f6368; width: 120px;">Нэвтрэх нэр:</td>
                  <td style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #1a73e8; letter-spacing: 0.5px;">${escapeHtml(username)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #5f6368;">Нууц үг:</td>
                  <td style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #1a73e8; letter-spacing: 0.5px;">${escapeHtml(password)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${escapeHtml(loginUrl)}" 
                 style="background: linear-gradient(135deg, #21005D, #5136a8); color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                Нэвтрэх
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">

            <p style="font-size: 12px; color: #999; line-height: 1.5;">
              ⚠️ Аюулгүй байдлын үүднээс нэвтэрсний дараа нууц үгээ солихыг зөвлөж байна.<br>
              Энэ имэйлийг хүлээн авах ёсгүй бол үл тоомсорлоно уу.
            </p>
          </div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `[send-teacher-creds] Resend failed for ${email}: ${res.status} ${text}`,
    );
  }
}
