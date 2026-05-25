import { NextResponse } from "next/server";
import {
  getAudienceId,
  getResend,
  getResendApiKey,
  getSegmentId,
  isResendConfigured,
} from "@/lib/resend";
import { sendSubscriberNotificationEmail, sendWelcomeEmail } from "@/lib/emails/welcome";
import { addSubscriber } from "@/lib/subscribers-store";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_API_BASE = "https://api.resend.com";

type ContactCaptureResult =
  | { ok: true; isNewContact: boolean; mode: "resend_contacts" | "resend_audience" }
  | { ok: false; error: unknown; mode: "resend_contacts" | "resend_audience" };

function isAlreadyExistsError(error: unknown): boolean {
  const raw =
    typeof error === "string"
      ? error
      : error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : JSON.stringify(error ?? "");
  const msg = raw.toLowerCase();
  return msg.includes("already") || msg.includes("exists") || msg.includes("duplicate");
}

async function resendFetch(path: string, init: RequestInit = {}) {
  const key = getResendApiKey();
  if (!key) throw new Error("missing_resend_api_key");
  return fetch(`${RESEND_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function parseResendResponse(res: Response): Promise<unknown> {
  return res.json().catch(() => ({ message: `Resend returned ${res.status}` }));
}

async function addGlobalContactToSegment(email: string, segmentId: string): Promise<void> {
  const res = await resendFetch(
    `/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`,
    { method: "POST" }
  );
  if (res.ok) return;
  const body = await parseResendResponse(res);
  if (isAlreadyExistsError(body)) return;
  throw body;
}

async function createGlobalContact(email: string): Promise<ContactCaptureResult> {
  const segmentId = getSegmentId();
  const body: Record<string, unknown> = {
    email,
    unsubscribed: false,
  };
  if (segmentId) {
    body.segments = [{ id: segmentId }];
  }

  const res = await resendFetch("/contacts", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await parseResendResponse(res);

  if (res.ok && !(data && typeof data === "object" && "error" in data && data.error)) {
    return { ok: true, isNewContact: true, mode: "resend_contacts" };
  }

  if (isAlreadyExistsError(data)) {
    if (segmentId) {
      try {
        await addGlobalContactToSegment(email, segmentId);
      } catch (err) {
        console.error("[subscribe] resend segment add failed for existing contact", err);
      }
    }
    return { ok: true, isNewContact: false, mode: "resend_contacts" };
  }

  return { ok: false, error: data, mode: "resend_contacts" };
}

async function createLegacyAudienceContact(email: string): Promise<ContactCaptureResult> {
  const resend = getResend()!;
  const audienceId = getAudienceId()!;

  try {
    const created = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    if (created.error) {
      if (isAlreadyExistsError(created.error)) {
        return { ok: true, isNewContact: false, mode: "resend_audience" };
      }
      return { ok: false, error: created.error, mode: "resend_audience" };
    }
    return { ok: true, isNewContact: true, mode: "resend_audience" };
  } catch (err) {
    return { ok: false, error: err, mode: "resend_audience" };
  }
}

async function createResendContact(email: string): Promise<ContactCaptureResult> {
  if (getAudienceId()) {
    return createLegacyAudienceContact(email);
  }
  return createGlobalContact(email);
}

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

  const captureMode = isResendConfigured() ? "resend" : "fallback";
  try {
    await addSubscriber(email, captureMode);
  } catch (err) {
    console.error("[subscribe] subscribers store threw", err);
  }

  if (!isResendConfigured()) {
    console.log("[subscribe] mode=fallback email=", email);
    await pingDiscord(email, "fallback");
    return NextResponse.json({ ok: true });
  }

  const contactResult = await createResendContact(email);
  if (!contactResult.ok) {
    console.error(`[subscribe] ${contactResult.mode} create error`, contactResult.error);
    await pingDiscord(email, "resend_error");
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 });
  }

  if (contactResult.isNewContact) {
    const sendResult = await sendWelcomeEmail(email);
    if (!sendResult.ok) {
      console.error("[subscribe] welcome email failed but contact is stored", sendResult.error);
    }

    const notifyResult = await sendSubscriberNotificationEmail(email);
    if (!notifyResult.ok) {
      console.error("[subscribe] subscriber notification failed but contact is stored", notifyResult.error);
    }
  }

  console.log(`[subscribe] mode=${contactResult.mode} new=${contactResult.isNewContact} email=`, email);
  await pingDiscord(email, contactResult.isNewContact ? "resend_new" : "resend_repeat");

  return NextResponse.json({ ok: true });
}
