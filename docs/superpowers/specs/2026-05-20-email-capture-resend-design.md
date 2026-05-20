# Email capture + Resend integration

**Date:** 2026-05-20
**Status:** Draft, awaiting user approval

## Goal

Turn skellywags.club's email form from a fire-and-forget Discord webhook into a real, persisted subscriber list with a welcome email, and add a sharable subscribe page Skelly can promote across her channels.

## Non-goals

- Building a custom newsletter sender. Skelly will write and broadcast emails from Resend's dashboard.
- Exit-intent modals, sticky bars, or post-fan-art upsells. Off-brand for the "chaos / barely surviving" voice.
- Double opt-in. Single opt-in is fine for a creator newsletter at this scale, and Resend Audiences handles unsubscribe links automatically on broadcasts.
- A subscriber count display. Maybe later if Skelly wants social proof; not v1.

## What ships

### 1. Backend: Resend Audiences + welcome email, gated behind env vars

`/api/subscribe/route.ts` becomes a three-step pipeline:

1. Validate email (current behavior keeps working).
2. **If `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` are set:**
   - Add contact to the Resend audience via `resend.contacts.create({ email, audienceId, unsubscribed: false })`.
   - If contact creation succeeds (new contact), send the welcome email via `resend.emails.send({ ... })`.
   - See the error-handling section below for per-failure response codes; the short version: a failed `contacts.create` returns 500 (we lost a signup), a failed welcome email after a stored contact returns 200 (contact is the durable thing).
3. **Always** post to `DISCORD_NOTIFY_WEBHOOK` if set (current behavior). Skelly likes the live ping.
4. On success, return `{ ok: true }`.

Dedup: Resend `contacts.create` treats a re-subscribe of the same email as idempotent (`already_exists`-style error is caught and treated as success, no second welcome email).

Welcome email sends only on a new contact creation, never on a retry of an existing subscriber.

### 2. Welcome email — Skelly-editable via Pages CMS

New CMS section, lives between "Theme" and "Site Identity":

```yaml
- name: welcome_email
  label: "📧 Welcome Email (sent to new subscribers)"
  type: file
  path: content/welcome-email.md
  fields:
    - { name: enabled, label: "Send welcome emails to new subscribers?", type: boolean, default: true }
    - { name: from_name, label: "From name (shown in inbox, e.g. skelly)", type: string, required: true, default: "skelly" }
    - { name: from_address, label: "From address (must be on a verified Resend domain, e.g. hello@skellywags.club)", type: string, required: true }
    - { name: subject, label: "Subject line", type: string, required: true }
    - { name: preheader, label: "Preheader (preview text shown next to subject in inbox)", type: string }
    - { name: body, label: "Email body (markdown). Use {handle}, {discord}, {shop}, {youtube} as auto-replaced links.", type: rich-text, required: true }
```

Initial `content/welcome-email.md` content (chaos voice, no em dashes):

```markdown
---
enabled: true
from_name: skelly
from_address: hello@skellywags.club
subject: welcome to the void, skellywag
preheader: you signed up. that was a mistake (in the best way).
---

you signed up. that was a mistake (in the best way).

you'll hear from me when something dumb happens. new merch, big stream,
weird video, occasional existential crisis.

no spam. no algorithms. just chaos when there's chaos to share.

[youtube]({youtube}) · [discord]({discord}) · [shop]({shop})

skelly
```

The `{handle}`, `{discord}`, `{shop}`, `{youtube}` tokens are replaced server-side with values from `content/site.json` and `content/social.json` before sending. Keeps Skelly from having to paste fresh URLs each time.

Markdown body is rendered to HTML using the existing `remark` + `remark-html` stack already in the project. Plaintext fallback is the raw markdown with link tokens replaced.

### 3. Dedicated `/subscribe` page

New route `app/subscribe/page.tsx`. Standalone hero with:

- Big chaos-styled headline (Skelly-editable via `site.json`).
- Sub-headline pitch (Skelly-editable).
- `EmailCapture` form, centered, with a CTA label like "I'M IN".
- Three or four short bullets of "what you'll get" (Skelly-editable).
- Optional fine print line (e.g. "no spam. unsubscribe whenever.").

Page metadata exports a dedicated OG card image path (`/og-subscribe.jpg`, falls back to existing OG for now and we generate the dedicated one later).

### 4. Navbar link

Add `SUBSCRIBE` (or whatever label Skelly chooses) to the existing nav, after current items, before any utility icons. Label and visibility are Skelly-editable via `site.json`.

### 5. Bottom-of-blog-post CTA

`app/blog/[slug]/page.tsx` (whichever component renders the post body) gets a permanent `EmailCapture` block at the bottom with copy like "want more chaos in your inbox?" Skelly-editable via `site.json`.

### 6. `site.json` field additions

```jsonc
{
  // existing fields ...
  "nav_subscribe_label": "EMAIL DROPS",
  "nav_subscribe_enabled": true,
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

Corresponding fields added to `.pages.yml` under the existing `site` CMS section so Skelly can edit them.

`SiteSettings` type in `lib/content.ts` extended with the new fields.

### 7. `RESEND_SETUP.md` setup manual for Skelly

New file in repo root, walks Skelly through end-to-end setup. Format mirrors `EDITOR_GUIDE.md` and `WELCOME_SKELLY.md`. Sections:

1. **Make a Resend account** (resend.com, sign up with the same email used for Vercel).
2. **Verify `skellywags.club`** — add DNS records at the registrar (screenshots of the four records Resend asks for: MX, SPF, DKIM, DMARC). Wait for green checks.
3. **Create an Audience** — name it "skellywags newsletter" or similar. Copy the audience ID.
4. **Create an API key** — name it "skellywags.club production". Copy once. (Resend only shows it once.)
5. **Add env vars in Vercel** — `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`. Production scope. Redeploy or wait for next push.
6. **Test it** — go to skellywags.club/subscribe, drop her own email, verify (a) inbox got the welcome email, (b) Resend dashboard shows the contact, (c) Discord got the ping.
7. **Sending emails later** — quick tour of Resend's "Broadcasts" feature so she knows where to write the next email.
8. **Troubleshooting** — common DNS gotchas, what to do if domain stays unverified, when to ping Stephen.

### 8. What happens before Resend is set up

Everything ships dormant. With no `RESEND_API_KEY` set:

- `/subscribe` page works, navbar link works, blog CTAs work.
- Submitting an email still validates, still hits Discord webhook, still logs server-side.
- No welcome email goes out.
- No contact is persisted to Resend.

The moment Skelly adds the env vars in Vercel and redeploys, contact creation + welcome email turn on automatically.

A short Vercel server log line on every subscribe call indicates which mode is active (`[subscribe] mode=resend` or `[subscribe] mode=fallback`) so Stephen can see at a glance whether the keys are wired.

## Architecture / data flow

```
user fills form
   |
   v
EmailCapture (client)
   |
   v
POST /api/subscribe { email }
   |
   v
validate email
   |
   +-- (if Resend env set) -- resend.contacts.create -> resend.emails.send
   |                            |
   |                            +-- on already_exists: skip welcome, treat as ok
   |
   +-- (always, if set) ------ discord webhook ping
   |
   +-- (always) -------------- console.log subscriber + mode
   |
   v
return { ok: true } or { ok: false, error } on hard failure
```

Hard-failure means: email validation failed, OR Resend API errored AND it was a new contact attempt (so we never lost a *new* signup silently). Discord-webhook-only failures don't fail the request, since the email is in Resend.

## Files to create

- `app/subscribe/page.tsx` — dedicated subscribe page.
- `app/subscribe/opengraph-image.tsx` (optional v1) — dynamic OG card, or use static `/public/og-subscribe.jpg` later.
- `lib/emails/welcome.ts` — loads `content/welcome-email.md`, renders body + replaces tokens, exports `sendWelcomeEmail(email)`.
- `lib/resend.ts` — thin Resend client wrapper, returns `null` when keys missing so callers can short-circuit.
- `content/welcome-email.md` — initial CMS content.
- `RESEND_SETUP.md` — Skelly's setup manual.

## Files to modify

- `.pages.yml` — add `welcome_email` section, add new fields to `site` section.
- `app/api/subscribe/route.ts` — add Resend persistence + welcome email, keep Discord webhook fallback.
- `components/Navbar.tsx` — add subscribe link, gated on `nav_subscribe_enabled`.
- `components/EmailCapture.tsx` — minor: surface API error message text when route returns a structured error, so the user knows whether to retry.
- `app/blog/[slug]/page.tsx` — append CTA block below the post body.
- `content/site.json` — add new fields with default values.
- `lib/content.ts` — extend `SiteSettings` type, add `WelcomeEmail` type + loader.
- `package.json` — add `resend` dependency.
- `README.md` — replace the "Real Fourthwall storefront URL + email-list integration in `EmailCapture`" launch TODO with a "Resend setup pending, see RESEND_SETUP.md" note.

## Environment variables

| Name | Required? | Set where | Notes |
|---|---|---|---|
| `RESEND_API_KEY` | Required for full mode | Vercel production | Pasted from Resend dashboard once. |
| `RESEND_AUDIENCE_ID` | Required for full mode | Vercel production | UUID-shaped string from Resend dashboard. |
| `DISCORD_NOTIFY_WEBHOOK` | Optional | Vercel production (already set) | Existing. Keeps notification ping. |

If either Resend var is missing, subscribe runs in fallback mode (Discord webhook + log only). This is the state until Skelly finishes setup.

## Error handling

- **Invalid email**: 400 with `{ ok: false, error: "invalid_email" }`. Form shows the existing "welp. that broke" message.
- **Resend `contacts.create` rate-limited or 5xx**: log full error, skip welcome email (we can't confirm contact was stored), still ping Discord so Skelly sees it and Stephen has a backup signal, return 500.
- **Resend `contacts.create` says already_exists**: treat as success, don't send welcome again, ping Discord.
- **Welcome email send fails after contact created**: log error, return 200 (contact is the durable thing; welcome email failure shouldn't block). One re-send retry inside the same request, then give up.
- **Discord webhook fails**: log, don't affect response status. Discord is best-effort signal, not durable storage.
- **Markdown rendering of welcome email throws**: this is a CMS misconfig; log loudly, fall back to plaintext-only send. Don't drop the contact.

## Testing

Manual checklist:

- [ ] Pre-Resend mode: `/subscribe` loads, form posts succeed, Discord ping arrives, no Resend calls.
- [ ] After env vars set: subscribe writes contact to Resend audience, welcome email lands in inbox, Discord ping still arrives.
- [ ] Re-subscribing same email: no duplicate Resend contact, no duplicate welcome email, Discord still pings.
- [ ] Pages CMS shows the new "Welcome Email" section and `site.json` field additions.
- [ ] Editing welcome email body in CMS updates the next email sent.
- [ ] Navbar `SUBSCRIBE` link visible, hidden when `nav_subscribe_enabled=false`.
- [ ] Blog post pages render the CTA block at bottom.
- [ ] `/subscribe` page renders editable copy from `site.json` correctly.
- [ ] Token replacement (`{youtube}`, `{discord}`, `{shop}`) works in welcome email.

No automated tests — project doesn't currently have a test runner and adding one is out of scope.

## Roll-out

1. Ship all code with Resend dormant. Existing behavior unchanged for users until env vars set.
2. Hand Skelly `RESEND_SETUP.md` after her stream ends.
3. Skelly follows the manual: account, DNS, audience, API key, Vercel env vars.
4. Skelly tests with her own email. If it works, done.
5. If DNS verification is slow (can take hours), the fallback mode keeps capturing emails to Discord so nothing is lost in the gap.

## Out of scope (call out for later)

- Double opt-in / confirmation email
- Subscriber count UI for social proof
- Per-tag segmentation (e.g. "merch-only" vs "everything")
- Custom unsubscribe page (Resend's default works)
- Analytics on subscribe conversions
- Welcome email A/B variants
- Dedicated OG card image generation (placeholder static path for v1)
