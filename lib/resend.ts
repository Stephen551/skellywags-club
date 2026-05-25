import { Resend } from "resend";

let cached: Resend | null | undefined;

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

export function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = getResendApiKey();
  cached = key ? new Resend(key) : null;
  return cached;
}

export function getAudienceId(): string | null {
  return process.env.RESEND_AUDIENCE_ID || null;
}

export function getSegmentId(): string | null {
  return process.env.RESEND_SEGMENT_ID || null;
}

export function getSubscriberNotifyEmail(): string {
  return process.env.SUBSCRIBER_NOTIFY_EMAIL || "skellysofficialemail@gmail.com";
}

export function getInboundForwardEmail(): string {
  return process.env.INBOUND_FORWARD_EMAIL || getSubscriberNotifyEmail();
}

export function getInboundWebhookToken(): string | null {
  return process.env.RESEND_INBOUND_WEBHOOK_TOKEN || null;
}

export function isResendConfigured(): boolean {
  return getResendApiKey() !== null;
}
