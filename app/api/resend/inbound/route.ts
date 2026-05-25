import { NextResponse } from "next/server";
import {
  getInboundForwardEmail,
  getInboundWebhookToken,
  getResend,
  getResendApiKey,
} from "@/lib/resend";
import { getWelcomeEmail } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_API_BASE = "https://api.resend.com";
const SKELLY_ADDRESS = "skelly@skellywags.club";

type InboundEvent = {
  type?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    subject?: string;
    message_id?: string;
  };
};

type ReceivedEmail = {
  from?: string;
  to?: string[];
  cc?: string[];
  subject?: string;
  html?: string | null;
  text?: string | null;
  headers?: Record<string, string>;
  message_id?: string;
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function forwardedHtml(email: ReceivedEmail): string {
  const subject = email.subject || "(no subject)";
  const from = email.headers?.from || email.from || "(unknown sender)";
  const to = (email.to ?? []).join(", ") || SKELLY_ADDRESS;
  const body = email.html || `<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(email.text || "")}</pre>`;

  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">
      <p><strong>Forwarded inbound mail for ${SKELLY_ADDRESS}</strong></p>
      <p>
        <strong>From:</strong> ${escapeHtml(from)}<br>
        <strong>To:</strong> ${escapeHtml(to)}<br>
        <strong>Subject:</strong> ${escapeHtml(subject)}
      </p>
      <hr>
      ${body}
    </div>
  `;
}

function forwardedText(email: ReceivedEmail): string {
  return [
    `Forwarded inbound mail for ${SKELLY_ADDRESS}`,
    `From: ${email.headers?.from || email.from || "(unknown sender)"}`,
    `To: ${(email.to ?? []).join(", ") || SKELLY_ADDRESS}`,
    `Subject: ${email.subject || "(no subject)"}`,
    "",
    email.text || "",
  ].join("\n");
}

async function getReceivedEmail(emailId: string): Promise<ReceivedEmail> {
  const key = getResendApiKey();
  if (!key) throw new Error("missing_resend_api_key");

  const res = await fetch(`${RESEND_API_BASE}/emails/receiving/${encodeURIComponent(emailId)}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.error) {
    throw new Error(body?.error?.message || body?.message || `Resend returned ${res.status}`);
  }
  return body?.data ?? body;
}

export async function POST(request: Request) {
  const configuredToken = getInboundWebhookToken();
  const token = new URL(request.url).searchParams.get("token");
  if (configuredToken && token !== configuredToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const event = (await request.json().catch(() => null)) as InboundEvent | null;
  if (event?.type !== "email.received") {
    return NextResponse.json({ ok: true, skipped: "unsupported_event" });
  }

  const emailId = event.data?.email_id;
  if (!emailId) {
    return NextResponse.json({ ok: false, error: "missing_email_id" }, { status: 400 });
  }

  const recipients = event.data?.to ?? [];
  const isForSkelly = recipients.some((to) => to.toLowerCase() === SKELLY_ADDRESS);
  if (!isForSkelly) {
    return NextResponse.json({ ok: true, skipped: "not_skelly_address" });
  }

  try {
    const inboundEmail = await getReceivedEmail(emailId);
    const resend = getResend();
    if (!resend) {
      throw new Error("missing_resend_client");
    }

    const welcomeConfig = getWelcomeEmail();
    const sender = inboundEmail.headers?.from || inboundEmail.from;
    const subject = inboundEmail.subject || "(no subject)";
    const result = await resend.emails.send({
      from: `${welcomeConfig.from_name} <${welcomeConfig.from_address}>`,
      to: getInboundForwardEmail(),
      replyTo: sender,
      subject: `[skelly@skellywags.club] ${subject}`,
      html: forwardedHtml(inboundEmail),
      text: forwardedText(inboundEmail),
    });

    if (result.error) {
      console.error("[inbound] forward failed", result.error);
      return NextResponse.json({ ok: false, error: "forward_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inbound] webhook threw", err);
    return NextResponse.json({ ok: false, error: "inbound_failed" }, { status: 500 });
  }
}
