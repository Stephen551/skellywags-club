import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim() : undefined;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const webhook = process.env.DISCORD_NOTIFY_WEBHOOK;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "skellywags.club",
          avatar_url: "https://skellywags.club/favicon.svg",
          content: `📩 new email subscription: \`${email}\``,
        }),
      });
      if (!res.ok) {
        console.error("[subscribe] discord webhook failed", res.status);
      }
    } catch (err) {
      console.error("[subscribe] discord webhook threw", err);
    }
  } else {
    console.log("[subscribe] no DISCORD_NOTIFY_WEBHOOK set, email captured:", email);
  }

  return NextResponse.json({ ok: true });
}
