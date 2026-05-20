import { Resend } from "resend";

let cached: Resend | null | undefined;

export function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

export function getAudienceId(): string | null {
  return process.env.RESEND_AUDIENCE_ID || null;
}

export function isResendConfigured(): boolean {
  return getResend() !== null && getAudienceId() !== null;
}
