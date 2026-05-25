# skellywags.club

Brand hub site for **@OfficiallySkelly**. Wraps Fourthwall (merch + memberships) and YouTube. The site does NOT process payments.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS + custom CSS tokens
- Vercel (deploy target)
- YouTube Data API v3 (videos + channel stats)
- Markdown blog (gray-matter + remark)

## Run locally

```bash
npm install
cp .env.local.example .env.local   # fill in YouTube key + channel
npm run dev
```

Open <http://localhost:3000>.

## Environment

| Variable | Notes |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `YOUTUBE_CHANNEL_ID` | `@officiallyskelly` (handle) or a `UC...` channel ID |
| `NEXT_PUBLIC_FOURTHWALL_SHOP_URL` | Fourthwall storefront URL (placeholder until merch launches) |
| `NEXT_PUBLIC_DISCORD_WIDGET_GUILD_ID` | Numeric Discord guild ID (enable widget in server settings first) |
| `NEXT_PUBLIC_SITE_URL` | `https://skellywags.club` |
| `RESEND_API_KEY` | Enables Resend contact capture and welcome emails |
| `RESEND_SEGMENT_ID` | Optional Resend Segment ID for grouping newsletter signups |
| `RESEND_AUDIENCE_ID` | Optional legacy Resend Audience ID; only use if the account still has Audiences |
| `SUBSCRIBER_NOTIFY_EMAIL` | Optional email for owner notifications; defaults to `skellysofficialemail@gmail.com` |
| `INBOUND_FORWARD_EMAIL` | Optional destination for Resend Inbound forwards; defaults to `SUBSCRIBER_NOTIFY_EMAIL` |
| `RESEND_INBOUND_WEBHOOK_TOKEN` | Optional shared token for `/api/resend/inbound?token=...` |
| `DISCORD_NOTIFY_WEBHOOK` | Optional Discord ping for new signups |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional backup subscriber store |
| `ADMIN_PASSWORD` | Enables `/admin/subscribers` basic auth |

Without `YOUTUBE_API_KEY`, video grids gracefully render an empty state.

## Routes

- `/` — home
- `/shop` — store (placeholder; email capture)
- `/videos` — public + members-only tabs
- `/members` — Skellywags Club tiers
- `/about` — The Lore
- `/community` — schedule, Discord, fan art wall, merch train
- `/blog` — markdown posts in `content/blog/`
- `/privacy`, `/terms` — placeholder copy

## Adding a blog post

Drop a markdown file into `content/blog/<slug>.md`:

```md
---
title: "POST TITLE"
date: "2025-04-29"
category: "Update"   # Update | Drop | Event | Just Vibes
excerpt: "1-line teaser for the index card."
---

post body here.
```

The post auto-appears at `/blog/<slug>`.

## Design language (locked)

- Bg: `#0D0814` deep purple-black starfield
- Brand purple: `#9B5FC0`, light `#C87FE8`, deep `#6B2FA0`
- Chaos accents: electric blue `#4FC3F7`, electric pink `#FF4FCB`
- Gold (CTAs): `#D4A017`
- Headings: Bebas Neue · body: Nunito · chaos accents: Bangers
- White outline stroke on key UI; glow shadows on buttons & cards; no flat backgrounds

## Open TODO before launch

- [ ] Real `YOUTUBE_API_KEY` + `YOUTUBE_CHANNEL_ID` in `.env.local`
- [ ] Real Fourthwall storefront URL (`NEXT_PUBLIC_FOURTHWALL_SHOP_URL` env var)
- [ ] Resend setup — see `RESEND_SETUP.md`. Until done, email capture runs in fallback mode (Discord webhook + server log).
- [ ] Background-removed transparent PNG of avatar (current is JPG with starfield bg)
- [ ] Real About copy from creator
- [ ] OG image (`public/skellybanner.jpg` is currently used)
- [ ] Update YouTube membership URL in `lib/constants.ts` (`YOUTUBE_MEMBERSHIP_URL`) once channel verifies for memberships
- [ ] Wire fan-art submission form to a real backend (Discord webhook, Airtable, or Next API route)
