import { remark } from "remark";
import remarkHtml from "remark-html";
import { getResend } from "@/lib/resend";
import { getWelcomeEmail, getSite, getSocial } from "@/lib/content";

function buildTokenMap() {
  const site = getSite();
  const social = getSocial();
  const findUrl = (key: string) =>
    social.find((s) => s.key === key)?.url ?? "";
  return {
    "{youtube}": findUrl("youtube") || "https://www.youtube.com/@officiallyskelly",
    "{discord}": site.discord_invite_url || findUrl("discord") || "https://discord.gg/zpWv2cXxB9",
    "{shop}": "https://skellywags.club/shop",
    "{handle}": site.handle || "@OFFICIALLYSKELLY",
  };
}

function replaceTokens(input: string, tokens: Record<string, string>): string {
  let out = input;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.split(token).join(value);
  }
  return out;
}

async function renderHtml(markdown: string): Promise<string> {
  const file = await remark().use(remarkHtml).process(markdown);
  return String(file);
}

export type SendWelcomeResult =
  | { ok: true; skipped?: "disabled" | "no_resend" }
  | { ok: false; error: string };

export async function sendWelcomeEmail(toEmail: string): Promise<SendWelcomeResult> {
  const resend = getResend();
  if (!resend) return { ok: true, skipped: "no_resend" };

  const config = getWelcomeEmail();
  if (!config.enabled) return { ok: true, skipped: "disabled" };

  const tokens = buildTokenMap();
  const bodyMarkdown = replaceTokens(config.body, tokens);
  const subject = replaceTokens(config.subject, tokens);
  const preheader = replaceTokens(config.preheader, tokens);

  let html: string;
  try {
    const rendered = await renderHtml(bodyMarkdown);
    const preheaderHtml = preheader
      ? `<div style="display:none;opacity:0;max-height:0;overflow:hidden">${preheader}</div>`
      : "";
    html = `${preheaderHtml}${rendered}`;
  } catch (err) {
    console.error("[welcome] markdown render failed, falling back to plaintext", err);
    html = `<pre style="font-family:inherit;white-space:pre-wrap">${bodyMarkdown}</pre>`;
  }

  try {
    const res = await resend.emails.send({
      from: `${config.from_name} <${config.from_address}>`,
      to: toEmail,
      subject,
      html,
      text: bodyMarkdown,
    });
    if (res.error) {
      console.error("[welcome] resend send error", res.error);
      return { ok: false, error: res.error.message || "send_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[welcome] resend send threw", err);
    return { ok: false, error: "send_threw" };
  }
}
