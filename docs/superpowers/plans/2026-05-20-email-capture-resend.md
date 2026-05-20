# Email capture + Resend integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real subscriber persistence + welcome email via Resend Audiences to skellywags.club, plus a dedicated `/subscribe` page, navbar link, and bottom-of-blog CTA — all gated behind env vars so the code ships dormant and turns on when Skelly finishes Resend setup.

**Architecture:** `/api/subscribe` becomes a three-step pipeline: validate → (optionally) Resend `contacts.create` + welcome email → Discord webhook ping. When `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` are unset, the route falls back to the current Discord-only behavior so signups keep working between deploy and DNS verification. Welcome email content lives in `content/welcome-email.md`, editable via Pages CMS, with `{youtube}`/`{discord}`/`{shop}` tokens replaced from `content/site.json` and `content/social.json` at send time.

**Tech Stack:** Next.js 14 App Router, TypeScript, Resend SDK, gray-matter + remark (existing markdown stack), Pages CMS (`.pages.yml`), Vercel.

**Spec:** [docs/superpowers/specs/2026-05-20-email-capture-resend-design.md](../specs/2026-05-20-email-capture-resend-design.md)

**No automated tests:** The project has no test runner (confirmed in spec). Each task's verification step is a manual `npm run build` (or visual check in `npm run dev`). Commits stay small so any breakage bisects fast.

---

## File Map

**Create:**
- `lib/resend.ts` — Resend client wrapper, returns null when keys missing
- `lib/emails/welcome.ts` — loads `content/welcome-email.md`, renders body, replaces tokens, exports `sendWelcomeEmail(email)`
- `content/welcome-email.md` — initial welcome email content
- `app/subscribe/page.tsx` — dedicated subscribe landing page
- `RESEND_SETUP.md` — Skelly's setup manual (repo root, alongside `EDITOR_GUIDE.md` and `WELCOME_SKELLY.md`)
- `docs/superpowers/plans/2026-05-20-email-capture-resend.md` — this file

**Modify:**
- `package.json` — add `resend` dependency
- `.pages.yml` — add `welcome_email` section, extend `site` section with new fields
- `content/site.json` — add new field defaults
- `lib/content.ts` — extend `SiteSettings` type + defaults, add `WelcomeEmail` type + `getWelcomeEmail()` loader
- `app/api/subscribe/route.ts` — three-step pipeline with dormant Resend
- `components/EmailCapture.tsx` — surface specific error from API response
- `components/Navbar.tsx` — accept optional subscribe link prop, render after NAV_LINKS
- `app/layout.tsx` — load site and pass subscribe link to Navbar
- `app/blog/[slug]/page.tsx` — append `EmailCapture` block below post body
- `README.md` — replace "email-list integration" launch TODO

---

## Phase 0 — Setup

### Task 0.1: Install Resend SDK

**Files:**
- Modify: `package.json` (deps)
- Modify: `package-lock.json` (auto-generated)

- [ ] **Step 1: Install resend**

Run: `npm install resend@^4.0.0`
Expected: package installs, `package.json` shows `"resend": "^4.x.x"` under dependencies, `package-lock.json` updates.

- [ ] **Step 2: Verify install**

Run: `npm ls resend`
Expected: `resend@4.x.x` printed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add resend SDK dependency"
```

---

## Phase 1 — Backend (Resend dormant, fallback live)

### Task 1.1: Create Resend client wrapper

**Files:**
- Create: `lib/resend.ts`

- [ ] **Step 1: Write `lib/resend.ts`**

```ts
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
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `lib/resend.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/resend.ts
git commit -m "Add Resend client wrapper with env-var gating"
```

### Task 1.2: Create initial welcome email content

**Files:**
- Create: `content/welcome-email.md`

- [ ] **Step 1: Write `content/welcome-email.md`**

```markdown
---
enabled: true
from_name: skelly
from_address: hello@skellywags.club
subject: welcome to the void, skellywag
preheader: you signed up. that was a mistake (in the best way).
---

you signed up. that was a mistake (in the best way).

you'll hear from me when something dumb happens. new merch, big stream, weird video, occasional existential crisis.

no spam. no algorithms. just chaos when there's chaos to share.

[youtube]({youtube}) · [discord]({discord}) · [shop]({shop})

skelly
```

- [ ] **Step 2: Commit**

```bash
git add content/welcome-email.md
git commit -m "Add initial welcome email content"
```

### Task 1.3: Add `WelcomeEmail` type + loader to lib/content.ts

**Files:**
- Modify: `lib/content.ts`

- [ ] **Step 1: Add type below `Theme` type definition (around line 99)**

Find the line `export type FanArt = {` and insert above it:

```ts
export type WelcomeEmail = {
  enabled: boolean;
  from_name: string;
  from_address: string;
  subject: string;
  preheader: string;
  body: string;
};
```

- [ ] **Step 2: Add loader function near the other loaders (after `getTheme()`)**

Find `export function hexToRgbTriplet` and insert above it:

```ts
const WELCOME_EMAIL_DEFAULTS: WelcomeEmail = {
  enabled: true,
  from_name: "skelly",
  from_address: "hello@skellywags.club",
  subject: "welcome to the void, skellywag",
  preheader: "you signed up. that was a mistake (in the best way).",
  body: "",
};

export function getWelcomeEmail(): WelcomeEmail {
  const file = path.join(ROOT, "welcome-email.md");
  if (!fs.existsSync(file)) return WELCOME_EMAIL_DEFAULTS;
  try {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    return {
      enabled: data.enabled !== false,
      from_name: typeof data.from_name === "string" ? data.from_name : WELCOME_EMAIL_DEFAULTS.from_name,
      from_address: typeof data.from_address === "string" ? data.from_address : WELCOME_EMAIL_DEFAULTS.from_address,
      subject: typeof data.subject === "string" ? data.subject : WELCOME_EMAIL_DEFAULTS.subject,
      preheader: typeof data.preheader === "string" ? data.preheader : WELCOME_EMAIL_DEFAULTS.preheader,
      body: content,
    };
  } catch {
    return WELCOME_EMAIL_DEFAULTS;
  }
}
```

- [ ] **Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `lib/content.ts` or `welcome-email`.

- [ ] **Step 4: Commit**

```bash
git add lib/content.ts
git commit -m "Add WelcomeEmail type + loader in lib/content.ts"
```

### Task 1.4: Create welcome email send helper

**Files:**
- Create: `lib/emails/welcome.ts`

- [ ] **Step 1: Write `lib/emails/welcome.ts`**

```ts
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
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `lib/emails/welcome.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/emails/welcome.ts
git commit -m "Add welcome email render + send helper"
```

### Task 1.5: Refactor subscribe API route

**Files:**
- Modify: `app/api/subscribe/route.ts`

- [ ] **Step 1: Replace entire `app/api/subscribe/route.ts` with:**

```ts
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
```

- [ ] **Step 2: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: build succeeds, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/subscribe/route.ts
git commit -m "Wire /api/subscribe to Resend Audiences with fallback mode"
```

---

## Phase 2 — CMS schema updates

### Task 2.1: Add new fields to `site` section in `.pages.yml`

**Files:**
- Modify: `.pages.yml` (existing `site` section, near line 78–110)

- [ ] **Step 1: Add new fields to the `site` section**

Find the line `- { name: discord_invite_url, label: "Discord invite URL", type: string }` (around line 110) and insert these new fields immediately after it (before the next section starts at line 112):

```yaml
      - { name: nav_subscribe_enabled, label: "Show 'Subscribe' link in the navbar?", type: boolean, default: true }
      - { name: nav_subscribe_label, label: "Navbar subscribe link label (e.g. 'EMAIL DROPS')", type: string, default: "EMAIL DROPS" }
      - { name: subscribe_page_heading, label: "/subscribe page heading", type: string, default: "GET CHAOS IN YOUR INBOX" }
      - { name: subscribe_page_subheading, label: "/subscribe page subheading (pitch under the headline)", type: text, default: "drop your email. we'll yell when something dumb happens." }
      - name: subscribe_page_bullets
        label: "/subscribe page bullets (what subscribers get — drag to reorder)"
        type: string
        list: true
      - { name: subscribe_page_cta_label, label: "/subscribe page email form CTA label", type: string, default: "I'M IN" }
      - { name: subscribe_page_finepoint, label: "/subscribe page fine-print line under the form", type: string, default: "no spam. unsubscribe with one click." }
      - { name: blog_subscribe_heading, label: "Bottom-of-blog-post subscribe block heading", type: string, default: "want more chaos in your inbox?" }
      - { name: blog_subscribe_subheading, label: "Bottom-of-blog-post subscribe block subheading", type: text, default: "drop your email. we'll yell when something happens." }
```

- [ ] **Step 2: Commit**

```bash
git add .pages.yml
git commit -m "CMS: add subscribe-page + navbar-link fields to site section"
```

### Task 2.2: Add `welcome_email` section to `.pages.yml`

**Files:**
- Modify: `.pages.yml`

- [ ] **Step 1: Add new `welcome_email` section immediately after the `site` section (after the fields you just added)**

Find the divider comment that starts `# ━━━━━━━━━━` followed by `#   MONTHLY EDITS` (around line 112–115). Insert this new section ABOVE that divider so it sits at the bottom of the "frequent edits" group:

```yaml
  - name: welcome_email
    label: "📧 Welcome Email (sent to new subscribers)"
    type: file
    path: content/welcome-email.md
    fields:
      - { name: enabled, label: "Send welcome emails to new subscribers? (off = collect only, no welcome sent)", type: boolean, default: true }
      - { name: from_name, label: "From name (shown in inbox, e.g. skelly)", type: string, required: true, default: "skelly" }
      - { name: from_address, label: "From address (must be on a verified Resend domain, e.g. hello@skellywags.club)", type: string, required: true, default: "hello@skellywags.club" }
      - { name: subject, label: "Subject line", type: string, required: true }
      - { name: preheader, label: "Preheader (preview text in inbox)", type: string }
      - { name: body, label: "Email body — markdown. Tokens auto-replaced: {youtube} {discord} {shop} {handle}.", type: rich-text, required: true }
```

- [ ] **Step 2: Commit**

```bash
git add .pages.yml
git commit -m "CMS: add Welcome Email section for editing content/welcome-email.md"
```

### Task 2.3: Extend `SiteSettings` type + defaults in `lib/content.ts`

**Files:**
- Modify: `lib/content.ts`

- [ ] **Step 1: Extend `SiteSettings` type**

Find the line `discord_invite_url: string;` inside `export type SiteSettings = {` (around line 70) and add these properties immediately after it (before the closing `};`):

```ts
  nav_subscribe_enabled: boolean;
  nav_subscribe_label: string;
  subscribe_page_heading: string;
  subscribe_page_subheading: string;
  subscribe_page_bullets: string[];
  subscribe_page_cta_label: string;
  subscribe_page_finepoint: string;
  blog_subscribe_heading: string;
  blog_subscribe_subheading: string;
```

- [ ] **Step 2: Extend `SITE_DEFAULTS`**

Find `discord_invite_url: "https://discord.gg/zpWv2cXxB9",` inside `const SITE_DEFAULTS` (around line 200) and add these properties immediately after it (before the closing `};`):

```ts
  nav_subscribe_enabled: true,
  nav_subscribe_label: "EMAIL DROPS",
  subscribe_page_heading: "GET CHAOS IN YOUR INBOX",
  subscribe_page_subheading: "drop your email. we'll yell when something dumb happens.",
  subscribe_page_bullets: [
    "first dibs on merch drops",
    "stream announcements before they hit anywhere else",
    "the occasional cursed update from the void",
    "no spam. unsubscribe whenever.",
  ],
  subscribe_page_cta_label: "I'M IN",
  subscribe_page_finepoint: "no spam. unsubscribe with one click.",
  blog_subscribe_heading: "want more chaos in your inbox?",
  blog_subscribe_subheading: "drop your email. we'll yell when something happens.",
```

- [ ] **Step 3: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/content.ts
git commit -m "Add subscribe-related fields to SiteSettings type + defaults"
```

### Task 2.4: Update `content/site.json` with new field values

**Files:**
- Modify: `content/site.json`

- [ ] **Step 1: Add new fields to `content/site.json`**

Open `content/site.json`. Find the line `"discord_invite_url": "https://discord.gg/zpWv2cXxB9"` (last line before closing `}`). Change the trailing closing brace and add new fields. Final file should end like this:

```json
  "discord_invite_url": "https://discord.gg/zpWv2cXxB9",
  "nav_subscribe_enabled": true,
  "nav_subscribe_label": "EMAIL DROPS",
  "subscribe_page_heading": "GET CHAOS IN YOUR INBOX",
  "subscribe_page_subheading": "drop your email. we'll yell when something dumb happens.",
  "subscribe_page_bullets": [
    "first dibs on merch drops",
    "stream announcements before they hit anywhere else",
    "the occasional cursed update from the void",
    "no spam. unsubscribe whenever."
  ],
  "subscribe_page_cta_label": "I'M IN",
  "subscribe_page_finepoint": "no spam. unsubscribe with one click.",
  "blog_subscribe_heading": "want more chaos in your inbox?",
  "blog_subscribe_subheading": "drop your email. we'll yell when something happens."
}
```

- [ ] **Step 2: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('content/site.json','utf8')); console.log('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add content/site.json
git commit -m "Populate new subscribe-page + navbar fields in site.json"
```

---

## Phase 3 — UI placements

### Task 3.1: Surface API error message in EmailCapture

**Files:**
- Modify: `components/EmailCapture.tsx`

- [ ] **Step 1: Replace the file contents with this version**

```tsx
"use client";

import { useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "that email looks broken. try again?",
  invalid_body: "something broke on our end. try again?",
  list_failed: "the void rejected your email. give it another shot.",
};

export default function EmailCapture({ cta = "DROP IT" }: { cta?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errMessage, setErrMessage] = useState<string>("welp. that broke. try again?");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setErrMessage(ERROR_MESSAGES.invalid_email);
      setState("err");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const code = typeof data?.error === "string" ? data.error : "";
        setErrMessage(ERROR_MESSAGES[code] ?? "welp. that broke. try again?");
        setState("err");
        return;
      }
      setState("ok");
      setEmail("");
    } catch {
      setErrMessage("welp. that broke. try again?");
      setState("err");
    }
  }

  const disabled = state === "loading";

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@chaos.club"
        className="flex-1 bg-bg-primary border-2 border-purple-core/40 focus:border-electric-blue focus:shadow-glow-blue rounded-md px-4 py-3 text-text-primary outline-none transition-all placeholder:text-text-muted disabled:opacity-60"
        required
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-5 py-3 hover:bg-gold-light hover:shadow-glow-gold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "..." : cta}
      </button>
      <div aria-live="polite" className="sr-only">
        {state === "ok" && "Email captured."}
        {state === "err" && errMessage}
      </div>
      {state === "ok" && (
        <p className="sm:basis-full text-electric-blue text-sm font-bangers">welcome to the void.</p>
      )}
      {state === "err" && (
        <p className="sm:basis-full text-electric-pink text-sm font-bangers">{errMessage}</p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/EmailCapture.tsx
git commit -m "EmailCapture: surface specific API error messages"
```

### Task 3.2: Add subscribe link to Navbar

**Files:**
- Modify: `components/Navbar.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update Navbar to accept optional subscribe link prop**

Replace the `Navbar` component's signature and the two `NAV_LINKS.map` blocks. The full updated file should be:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import type { SocialLink } from "@/lib/content";
import SocialIcon from "./SocialIcon";

type SubscribeLink = { href: string; label: string } | null;

export default function Navbar({
  social,
  subscribeLink,
}: {
  social: SocialLink[];
  subscribeLink?: SubscribeLink;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = subscribeLink
    ? [...NAV_LINKS, { href: subscribeLink.href, label: subscribeLink.label }]
    : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-primary/80 border-b border-purple-core/25">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Image
            src="/skellyword-v2.png"
            alt="SKELLY"
            width={300}
            height={94}
            priority
            className="h-12 sm:h-14 md:h-16 lg:h-[68px] w-auto drop-shadow-[0_0_18px_rgba(155,95,192,0.8)]"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`heading text-xl uppercase tracking-wider transition-colors inline-flex items-center min-h-11 px-1 ${
                  active ? "text-white" : "text-text-primary/85 hover:text-white"
                }`}
              >
                <span className="relative">
                  {l.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gold shadow-glow-gold" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1 text-text-primary/85">
          {social.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="hover:text-electric-blue transition-colors inline-flex items-center justify-center min-w-11 min-h-11"
            >
              <SocialIcon k={s.key as any} className="w-5 h-5" />
            </a>
          ))}
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden text-white p-2 -mr-2"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-bg-secondary/95 backdrop-blur-lg border-t border-purple-core/30 px-6 py-8">
          <nav className="flex flex-col gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="heading text-3xl text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-5">
            {social.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                <SocialIcon k={s.key as any} className="w-6 h-6 text-text-primary" />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx` to load site config and pass subscribe link**

Open `app/layout.tsx`. Find the existing imports and the line `import Navbar from "@/components/Navbar";`. Then find where `social` is loaded (search for `getSocial`).

Add `getSite` to the existing content import. Example: if you currently have `import { getSocial } from "@/lib/content";`, change it to `import { getSocial, getSite } from "@/lib/content";`.

Then find the line `<Navbar social={social} />` (around line 138) and change the surrounding render to load and pass site config:

Above the `return` statement (or wherever `social` is currently loaded — keep it the same scope), add:

```tsx
const site = getSite();
const subscribeLink = site.nav_subscribe_enabled
  ? { href: "/subscribe", label: site.nav_subscribe_label }
  : null;
```

Change:
```tsx
<Navbar social={social} />
```
to:
```tsx
<Navbar social={social} subscribeLink={subscribeLink} />
```

- [ ] **Step 3: Verify type-check and build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx app/layout.tsx
git commit -m "Navbar: add Skelly-editable subscribe link from site.json"
```

### Task 3.3: Create `/subscribe` page

**Files:**
- Create: `app/subscribe/page.tsx`

- [ ] **Step 1: Write `app/subscribe/page.tsx`**

```tsx
import type { Metadata } from "next";
import EmailCapture from "@/components/EmailCapture";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Subscribe — skellywags.club",
  description: "Drop your email. Get chaos in your inbox.",
  openGraph: {
    title: "subscribe to skellywags.club",
    description: "drop your email. we'll yell when something dumb happens.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "subscribe to skellywags.club",
    description: "drop your email. we'll yell when something dumb happens.",
  },
};

export default function SubscribePage() {
  const site = getSite();
  const bullets = Array.isArray(site.subscribe_page_bullets)
    ? site.subscribe_page_bullets
    : [];

  return (
    <section className="max-w-2xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      <div className="text-center">
        <h1 className="heading text-5xl md:text-7xl text-white leading-[0.95]">
          {site.subscribe_page_heading}
        </h1>
        <p className="text-text-primary/85 mt-6 text-lg md:text-xl">
          {site.subscribe_page_subheading}
        </p>
      </div>

      <div className="mt-10 md:mt-12">
        <EmailCapture cta={site.subscribe_page_cta_label} />
      </div>

      {site.subscribe_page_finepoint && (
        <p className="text-center text-text-muted text-sm mt-4">
          {site.subscribe_page_finepoint}
        </p>
      )}

      {bullets.length > 0 && (
        <ul className="mt-12 md:mt-14 space-y-3 text-text-primary/90">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-electric-pink font-bangers tracking-widest pt-0.5">
                ✦
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify build picks up the route**

Run: `npm run build`
Expected: build succeeds, output shows `/subscribe` in the route list.

- [ ] **Step 3: Commit**

```bash
git add app/subscribe/page.tsx
git commit -m "Add /subscribe page with editable hero, bullets, fine print"
```

### Task 3.4: Add bottom-of-post subscribe CTA

**Files:**
- Modify: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Replace `app/blog/[slug]/page.tsx` with:**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPosts, readPost } from "@/lib/blog";
import { getSite } from "@/lib/content";
import EmailCapture from "@/components/EmailCapture";

export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  if (!post) return { title: "Post" };
  const description = post.seoDescription || post.excerpt;
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: "article" },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  if (!post) notFound();
  const site = getSite();

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
      <Link href="/blog" className="font-bebas tracking-wide text-electric-blue hover:text-electric-pink">
        ← BACK TO POSTS
      </Link>
      <p className="font-bangers text-electric-pink mt-6 tracking-widest">
        {post.category} · {post.date}
      </p>
      <h1 className="heading text-5xl md:text-6xl text-white mt-2">{post.title}</h1>
      <div
        className="prose-skelly mt-10"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <aside className="mt-16 pt-10 border-t border-purple-core/30">
        <h2 className="heading text-3xl text-white">
          {site.blog_subscribe_heading}
        </h2>
        <p className="text-text-muted text-sm mt-2 mb-5">
          {site.blog_subscribe_subheading}
        </p>
        <EmailCapture cta="DROP IT" />
      </aside>
    </article>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/blog/[slug]/page.tsx
git commit -m "Blog: append subscribe CTA below every post body"
```

---

## Phase 4 — Documentation

### Task 4.1: Create RESEND_SETUP.md

**Files:**
- Create: `RESEND_SETUP.md`

- [ ] **Step 1: Write `RESEND_SETUP.md`**

```markdown
# Resend Setup Manual — skellywags.club

Hey Skelly. This walks you through turning on the email list. You'll do this once, then it just works. Total time: about 30 minutes, plus waiting on DNS (which can be up to a few hours but is usually faster).

Until you finish this, the subscribe form on the site still works — it just pings the Discord webhook and writes to the server log. No signups are lost.

## What you need before starting

- The login for the registrar where `skellywags.club` is registered (wherever you bought the domain — Namecheap, GoDaddy, Cloudflare, etc.)
- Your Vercel dashboard access
- A web browser

## Step 1 — Make a Resend account

1. Go to [resend.com](https://resend.com).
2. Click **Sign Up**. Use the same email you use for Vercel if possible (less juggling later).
3. Verify your email when Resend sends the confirmation.

## Step 2 — Verify the domain `skellywags.club`

This proves to Resend that you own the domain so they'll send emails as you.

1. In the Resend dashboard, click **Domains** in the left sidebar.
2. Click **Add Domain**.
3. Type `skellywags.club` and submit.
4. Resend shows you four DNS records: an **MX**, an **SPF** (TXT), a **DKIM** (TXT, sometimes shown as CNAME), and a **DMARC** (TXT). Leave this tab open.
5. Open a new tab and log in to your domain registrar.
6. Find the **DNS records** section for `skellywags.club`.
7. Add each of the four records exactly as Resend shows them. Copy/paste — do not retype.
8. Save the records at the registrar.
9. Go back to the Resend tab and click **Verify DNS Records**.
10. Wait. Green checkmarks usually appear in minutes but can take up to a few hours. If still red after a couple hours, ping Stephen.

## Step 3 — Create an Audience

The Audience is the list your subscribers get added to.

1. In Resend, click **Audiences** in the left sidebar.
2. Click **Create Audience**.
3. Name it `skellywags newsletter` (or whatever you like).
4. After it's created, copy the **Audience ID** — it looks like a long UUID string. You'll paste it into Vercel in a moment.

## Step 4 — Create an API key

1. In Resend, click **API Keys** in the left sidebar.
2. Click **Create API Key**.
3. Name it `skellywags.club production`.
4. Permission: **Full access**.
5. Click **Create**. Copy the key right now — Resend only shows it once. If you lose it, just make a new one.

## Step 5 — Add env vars in Vercel

1. Open your [Vercel dashboard](https://vercel.com) and pick the `skellywags-club` project.
2. Go to **Settings → Environment Variables**.
3. Add two new variables, both scoped to **Production**:
   - Name: `RESEND_API_KEY` · Value: the API key from Step 4
   - Name: `RESEND_AUDIENCE_ID` · Value: the Audience ID from Step 3
4. Click **Save** for each.
5. Either trigger a redeploy from the Vercel dashboard, or wait for the next push to main.

## Step 6 — Test it

1. After the redeploy is done, go to `https://skellywags.club/subscribe`.
2. Drop in your own email and submit.
3. Check three things:
   - Your inbox should get the welcome email (might take a minute, check spam if it doesn't).
   - Your Resend dashboard **Audiences → skellywags newsletter** should show your email as a contact.
   - The Discord notify channel should get the ping (same as before).

If all three happened, you're done. Email capture is live.

## Step 7 — Sending broadcasts later

When you want to email the list (new merch, big stream, weird update), use Resend's **Broadcasts** feature:

1. Resend dashboard → **Broadcasts** → **Create Broadcast**.
2. Pick your audience.
3. Write the subject + body. Resend has a simple editor that handles unsubscribe links automatically.
4. Send. Done.

You never have to touch the website code to send emails.

## Editing the welcome email

The welcome email content lives in Pages CMS under **📧 Welcome Email**. You can edit:

- Whether it sends at all (toggle)
- From name and address (only change `from_address` if you've verified a different domain — otherwise leave it as `hello@skellywags.club`)
- Subject and preheader (preview text)
- Body — markdown. You can use these auto-replaced tokens:
  - `{youtube}` — your YouTube channel URL
  - `{discord}` — Discord invite link
  - `{shop}` — link to /shop
  - `{handle}` — your @handle

Save in Pages CMS, the site rebuilds, the next welcome email uses the new copy.

## Troubleshooting

**Domain stays unverified for hours.**
Double-check that the DNS records at the registrar match Resend exactly — even a stray space breaks them. If still stuck, ping Stephen with a screenshot of both sides.

**Welcome email never arrives.**
Check spam folder first. If still missing, check Resend dashboard → **Logs**. Each send shows a status. If it says "bounced" or "complained", the recipient's mail provider blocked it. If it says "sent" but you don't see it, the issue is on your side.

**Discord ping arrived but Resend dashboard shows no contact.**
That means the site is still in fallback mode — the env vars aren't picked up yet. Try redeploying from Vercel, then test again.

**Anything else weird.**
Ping Stephen. Take a screenshot.
```

- [ ] **Step 2: Commit**

```bash
git add RESEND_SETUP.md
git commit -m "Docs: add Resend setup manual for Skelly"
```

### Task 4.2: Update README.md launch TODO

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Find the line in `README.md` that reads:**

```
- [ ] Real Fourthwall storefront URL + email-list integration in `EmailCapture`
```

Replace it with:

```
- [ ] Real Fourthwall storefront URL (`NEXT_PUBLIC_FOURTHWALL_SHOP_URL` env var)
- [ ] Resend setup — see `RESEND_SETUP.md`. Until done, email capture runs in fallback mode (Discord webhook + server log).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Docs: split email/shop launch TODO, point to RESEND_SETUP.md"
```

---

## Phase 5 — Final verification

### Task 5.1: Full build + smoke test

**Files:** none.

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: build succeeds. Route list includes `/subscribe`. No type errors.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Expected: dev server starts on http://localhost:3000.

- [ ] **Step 3: Smoke checklist (visit each in browser)**

- [ ] `http://localhost:3000` — home page loads, footer EmailCapture works (will hit fallback mode, but should accept email)
- [ ] `http://localhost:3000/subscribe` — page renders with heading, subheading, form, bullets, fine print all from site.json
- [ ] Navbar shows the new "EMAIL DROPS" link (or whatever label is in site.json), and clicking it navigates to /subscribe
- [ ] Open any post under `/blog/<slug>` — bottom of post has the new subscribe block with editable heading + subheading
- [ ] Submit a test email from any form — Vercel/local server log shows `[subscribe] mode=fallback email=...` since no Resend keys are set in dev
- [ ] On error (e.g. submit a malformed email): form shows the new pink chaos-voice error message

- [ ] **Step 4: Stop dev server (Ctrl+C)**

- [ ] **Step 5: Final empty commit to anchor the feature**

```bash
git commit --allow-empty -m "Email capture + Resend integration: feature complete (dormant until env vars set)"
```

---

## Done criteria

- [ ] `npm run build` passes
- [ ] All commits above landed
- [ ] `/subscribe` page is live and editable via Pages CMS
- [ ] Navbar shows the new link, toggleable via CMS
- [ ] Blog posts show subscribe CTA at bottom
- [ ] Welcome email content editable in Pages CMS under "📧 Welcome Email"
- [ ] `RESEND_SETUP.md` exists in repo root, ready for Skelly to follow post-stream
- [ ] Subscribe API still works without Resend keys (fallback to Discord + log)
- [ ] Subscribe API uses Resend Audiences + sends welcome email when keys are set
