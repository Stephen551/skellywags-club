import { NextResponse } from "next/server";
import { getResend, getAudienceId, isResendConfigured } from "@/lib/resend";
import { sendWelcomeEmail } from "@/lib/emails/welcome";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function pingDiscord(email: string, mode: string) {
  const webhook = process.env.DISCORD_NOTIFY_WEBHOOK;
  if (!webhook) {
    console.log(`[subscribe] mode=${mode} no DISCORD_NOTIFY_WEBHOOK set, email captured:`, email);
    return;
  }
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "skellywags.club",
        avatar_url: "https://skellywags.club/favicon.svg",
        content: `📩 new email subscription (${mode}): \`${email}\``,
      }),
    });
    if (!res.ok) {
      console.error("[subscribe] discord webhook failed", res.status);
    }
  } catch (err) {
    console.error("[subscribe] discord webhook threw", err);
  }
}

export async function POST(request: Request) {
  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  if (!isResendConfigured()) {
    console.log("[subscribe] mode=fallback email=", email);
    await pingDiscord(email, "fallback");
    return NextResponse.json({ ok: true });
  }

  const resend = getResend()!;
  const audienceId = getAudienceId()!;

  let isNewContact = false;
  try {
    const created = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    if (created.error) {
      const msg = created.error.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("exists")) {
        isNewContact = false;
      } else {
        console.error("[subscribe] resend contacts.create error", created.error);
        await pingDiscord(email, "resend_error");
        return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 });
      }
    } else {
      isNewContact = true;
    }
  } catch (err) {
    console.error("[subscribe] resend contacts.create threw", err);
    await pingDiscord(email, "resend_error");
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 });
  }

  if (isNewContact) {
    const sendResult = await sendWelcomeEmail(email);
    if (!sendResult.ok) {
      console.error("[subscribe] welcome email failed but contact is stored", sendResult.error);
    }
  }

  console.log(`[subscribe] mode=resend new=${isNewContact} email=`, email);
  await pingDiscord(email, isNewContact ? "resend_new" : "resend_repeat");

  return NextResponse.json({ ok: true });
}
