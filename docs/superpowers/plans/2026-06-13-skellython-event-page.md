# Skellython Event Page + Site-Wide Ticker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/skellython` subathon page (live YouTube-sub goal ladder with per-goal Twitch clips, embedded live Twitch player, static timer rules, stretch teaser) plus a site-wide marquee ticker that shows from now through the event's end.

**Architecture:** Content lives in `content/skellython.json`, read through a `getSkellython()` loader in `lib/content.ts` (same defaults+try/catch pattern as the rest of the site). Pure domain logic (goal "reached" + progress math) lives in `lib/skellython.ts`; timezone day-window logic in `lib/skellython-date.ts`. Presentation is server components: `app/skellython/page.tsx` composes a hero, a Twitch embed, timer rules, the `SkellythonLadder`, and CTAs. `EventTicker` mounts globally in `app/layout.tsx`. Everything is editable by Skelly via a new `.pages.yml` screen.

**Tech Stack:** Next.js 14 App Router (server components), TypeScript, Tailwind (existing custom token theme), the existing `fetchChannelStats()` YouTube helper (cached `revalidate: 3600`), Twitch iframe embeds.

**Testing note:** This repo has **no unit-test runner** (confirmed in the spec — testing is manual). Each task's automated gate is therefore `npm run build` (full TypeScript + Next compile, catches type/JSX errors) and, for visual tasks, a manual check against a running `npm run dev`. `npx tsc --noEmit` is a faster type-only pre-check between edits.

---

## File Structure

**Create:**
- `content/skellython.json` — event data (dates, goals, clips, timer rules). Skelly's source of truth.
- `lib/skellython-date.ts` — CST day-window helpers (`cstToday`, `isEventActive`, `isTickerVisible`, `isBeforeEvent`).
- `lib/skellython.ts` — pure domain logic (`isGoalReached`, `computeProgress`, `SkellythonProgress`).
- `components/TwitchEmbed.tsx` — one iframe builder, two modes (`channel` live player / `clip`), plus exported `parseClipSlug`.
- `components/SkellythonLadder.tsx` — the goal ladder (reached/locked nodes + clip embeds).
- `components/EventTicker.tsx` — the global marquee banner.
- `app/skellython/page.tsx` — the event page (composition only).
- `public/skellython-hero.webp` — web-optimized hero art derived from the poster.

**Modify:**
- `lib/content.ts` — add `Skellython*` types + `getSkellython()`.
- `tailwind.config.ts` — add the `marquee` keyframe + animation.
- `app/layout.tsx` — mount `<EventTicker />`; compute + pass `eventLink` to Navbar.
- `components/Navbar.tsx` — accept `eventLink` prop, prepend it to the nav during the event.
- `app/sitemap.ts` — list `/skellython` when the event is enabled.
- `README.md` — add `/skellython` to the Routes list.
- `.pages.yml` — add the "🎉 Skellython Event" CMS screen.

---

## Task 1: Event data + loader

**Files:**
- Create: `content/skellython.json`
- Modify: `lib/content.ts` (append types near the other `export type`s, and the getter near `getSchedule`/`getStats`)

- [ ] **Step 1: Seed the event data**

Create `content/skellython.json` with all 18 goals verbatim:

```json
{
  "enabled": true,
  "name": "SKELLYTHON",
  "subtitle": "SUBATHON EVENT",
  "tagline": "can you handle the chaos",
  "start_date": "2026-06-22",
  "end_date": "2026-06-28",
  "start_display": "JUNE 22 · 4:30PM CST",
  "twitch_channel": "officiallyskelly",
  "spicy_cadence": "spicy challenge every 50 subs",
  "stretch_teaser": "Stretch goals too chaotic to reveal yet.",
  "baseline": 2300,
  "timer_rules": [
    { "amount": "+1 min", "per": "per YouTube sub" },
    { "amount": "+1 min", "per": "per Twitch follow" },
    { "amount": "+2 min", "per": "per dollar spent" },
    { "amount": "+5 min", "per": "per membership / sub" }
  ],
  "goals": [
    { "target": 2325, "dare": "Rewatch oldest YT video and react", "clip_url": "", "reached_override": false },
    { "target": 2350, "dare": "Sourest candy challenge", "clip_url": "", "reached_override": false },
    { "target": 2375, "dare": "Chat makes me tweet", "clip_url": "", "reached_override": false },
    { "target": 2400, "dare": "Horror game at 3AM", "clip_url": "", "reached_override": false },
    { "target": 2425, "dare": "Underarm waxed", "clip_url": "", "reached_override": false },
    { "target": 2450, "dare": "Shock collar / Ask Me Anything (1HR)", "clip_url": "", "reached_override": false },
    { "target": 2475, "dare": "RIP Pokémon booster box", "clip_url": "", "reached_override": false },
    { "target": 2500, "dare": "Chat designs NEW model outfit", "clip_url": "", "reached_override": false },
    { "target": 2550, "dare": "Chat makes Skelly's pizza order", "clip_url": "", "reached_override": false },
    { "target": 2600, "dare": "Plan Discord movie night", "clip_url": "", "reached_override": false },
    { "target": 2650, "dare": "VR game (no VRChat)", "clip_url": "", "reached_override": false },
    { "target": 2700, "dare": "Skelly shaves beard", "clip_url": "", "reached_override": false },
    { "target": 2750, "dare": "MERCH DROP!!!!", "clip_url": "", "reached_override": false },
    { "target": 2800, "dare": "Skelly opens PO box for fan mail", "clip_url": "", "reached_override": false },
    { "target": 2850, "dare": "Chat picks game / play with chat", "clip_url": "", "reached_override": false },
    { "target": 2900, "dare": "Chat picks my Comic-Con cosplay", "clip_url": "", "reached_override": false },
    { "target": 2950, "dare": "Mods take over stream", "clip_url": "", "reached_override": false },
    { "target": 3000, "dare": "SKELLY TATTOO", "clip_url": "", "reached_override": false }
  ]
}
```

- [ ] **Step 2: Add types + loader to `lib/content.ts`**

Append these types alongside the other `export type` declarations (e.g. after the `FanArt` type, before the getter functions):

```ts
export type SkellythonGoal = {
  target: number;
  dare: string;
  clip_url?: string;
  reached_override?: boolean;
};

export type SkellythonTimerRule = { amount: string; per: string };

export type Skellython = {
  enabled: boolean;
  name: string;
  subtitle: string;
  tagline: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;   // "YYYY-MM-DD"
  start_display: string;
  twitch_channel: string;
  spicy_cadence: string;
  stretch_teaser: string;
  baseline?: number;
  timer_rules: SkellythonTimerRule[];
  goals: SkellythonGoal[];
};
```

Add the loader near `getSchedule()` / `getStats()` (it follows the identical defaults-merge + try/catch pattern). Note `enabled` defaults to `false` so a missing/broken file safely renders no event:

```ts
const SKELLYTHON_DEFAULTS: Skellython = {
  enabled: false,
  name: "SKELLYTHON",
  subtitle: "SUBATHON EVENT",
  tagline: "can you handle the chaos",
  start_date: "",
  end_date: "",
  start_display: "",
  twitch_channel: "officiallyskelly",
  spicy_cadence: "",
  stretch_teaser: "",
  baseline: undefined,
  timer_rules: [],
  goals: [],
};

export function getSkellython(): Skellython {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "skellython.json"), "utf8"));
    return { ...SKELLYTHON_DEFAULTS, ...raw };
  } catch {
    return SKELLYTHON_DEFAULTS;
  }
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add content/skellython.json lib/content.ts
git commit -m "Skellython: add event data + getSkellython() loader"
```

---

## Task 2: Date + progress helpers

**Files:**
- Create: `lib/skellython-date.ts`
- Create: `lib/skellython.ts`

- [ ] **Step 1: Write the CST day-window helpers**

Create `lib/skellython-date.ts`. Day-level comparison in America/Chicago via `en-CA` (which formats as `YYYY-MM-DD`), then lexicographic string compare — no dependency, no UTC drift:

```ts
const EVENT_TZ = "America/Chicago";

/** Today's date as YYYY-MM-DD in the event timezone (CST/CDT). */
export function cstToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Event is active when CST today is within [start, end] inclusive. */
export function isEventActive(start: string, end: string, now: Date = new Date()): boolean {
  if (!start || !end) return false;
  const today = cstToday(now);
  return today >= start && today <= end;
}

/** Ticker shows from now through the last event day. */
export function isTickerVisible(end: string, now: Date = new Date()): boolean {
  if (!end) return false;
  return cstToday(now) <= end;
}

/** True before the event opens (CST today < start). */
export function isBeforeEvent(start: string, now: Date = new Date()): boolean {
  if (!start) return false;
  return cstToday(now) < start;
}
```

- [ ] **Step 2: Write the domain logic**

Create `lib/skellython.ts`. Pure functions — no React, no IO:

```ts
import type { SkellythonGoal } from "./content";

/** A goal counts as reached when the live sub count passes it, or Skelly forces it. */
export function isGoalReached(goal: SkellythonGoal, liveSubs: number | null): boolean {
  if (goal.reached_override) return true;
  if (liveSubs == null) return false;
  return liveSubs >= goal.target;
}

export type SkellythonProgress = {
  sorted: SkellythonGoal[];
  reachedCount: number;
  nextGoal: SkellythonGoal | null;
  pct: number; // 0..100 toward nextGoal
  remaining: number | null; // subs to next goal; null if no live count
  allReached: boolean;
};

export function computeProgress(
  goals: SkellythonGoal[],
  liveSubs: number | null,
  baseline?: number
): SkellythonProgress {
  const sorted = [...goals].sort((a, b) => a.target - b.target);
  const reachedCount = sorted.filter((g) => isGoalReached(g, liveSubs)).length;
  const nextGoal = sorted.find((g) => !isGoalReached(g, liveSubs)) ?? null;
  const allReached = nextGoal === null && sorted.length > 0;

  let pct = 0;
  let remaining: number | null = null;

  if (allReached) {
    pct = 100;
  } else if (nextGoal && liveSubs != null) {
    const idx = sorted.indexOf(nextGoal);
    // Bar floor: previous reached goal's target, else the configured baseline,
    // else one step below the first goal so goal #1 doesn't render near-empty.
    const fallbackFloor =
      sorted.length > 1 ? sorted[0].target - (sorted[1].target - sorted[0].target) : nextGoal.target - 25;
    const prev = idx > 0 ? sorted[idx - 1].target : baseline ?? fallbackFloor;
    const span = nextGoal.target - prev;
    pct = span > 0 ? Math.max(0, Math.min(100, ((liveSubs - prev) / span) * 100)) : 0;
    remaining = Math.max(0, nextGoal.target - liveSubs);
  }

  return { sorted, reachedCount, nextGoal, pct, remaining, allReached };
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Note on verifying the math**

There is no unit-test runner in this repo, so `computeProgress` is not unit-tested here. Its behavior is verified in the browser at Task 6 Step 3 and Task 8 Step 3 (bar fills correctly at the first goal, mid-ladder, and the all-reached state). The `npx tsc --noEmit` in Step 3 already guarantees it type-checks. Proceed.

- [ ] **Step 5: Commit**

```bash
git add lib/skellython-date.ts lib/skellython.ts
git commit -m "Skellython: add CST date helpers + goal/progress logic"
```

---

## Task 3: Twitch embed component

**Files:**
- Create: `components/TwitchEmbed.tsx`

- [ ] **Step 1: Write the component + slug parser**

Create `components/TwitchEmbed.tsx`. Server component (no hooks). `parent=` hosts come from `NEXT_PUBLIC_SITE_URL` plus `localhost` (dev) plus `skellywags.club` (belt-and-suspenders). `parseClipSlug` handles the three URL shapes Skelly might paste:

```tsx
function parentHosts(): string[] {
  const hosts = new Set<string>(["localhost"]);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      hosts.add(new URL(site).hostname);
    } catch {
      /* ignore malformed env */
    }
  }
  hosts.add("skellywags.club");
  return Array.from(hosts);
}

/** Pull the clip slug out of any of: clips.twitch.tv/<slug>,
 *  twitch.tv/<chan>/clip/<slug>, an ...?clip=<slug> embed URL, or a bare slug. */
export function parseClipSlug(input: string): string | null {
  if (!input) return null;
  const raw = input.trim();

  const clipParam = raw.match(/[?&]clip=([^&]+)/);
  if (clipParam) return decodeURIComponent(clipParam[1]);

  const noQuery = raw.split(/[?#]/)[0].replace(/\/+$/, "");

  let m = noQuery.match(/\/clip\/([^/]+)$/);
  if (m) return m[1];

  m = noQuery.match(/clips\.twitch\.tv\/([^/]+)$/);
  if (m && m[1] !== "embed") return m[1];

  if (/^[A-Za-z0-9_-]+$/.test(noQuery)) return noQuery;
  return null;
}

export default function TwitchEmbed({
  mode,
  value,
  title,
}: {
  mode: "channel" | "clip";
  value: string;
  title: string;
}) {
  const parents = parentHosts()
    .map((h) => `parent=${encodeURIComponent(h)}`)
    .join("&");

  let src: string | null = null;
  if (mode === "channel" && value) {
    src = `https://player.twitch.tv/?channel=${encodeURIComponent(value)}&${parents}`;
  } else if (mode === "clip") {
    const slug = parseClipSlug(value);
    if (slug) src = `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&${parents}`;
  }

  if (!src) return null;

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg border-2 border-purple-core/40 bg-black">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allowFullScreen
        scrolling="no"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/TwitchEmbed.tsx
git commit -m "Skellython: add TwitchEmbed (live + clip) with parent-host handling"
```

---

## Task 4: Goal ladder component

**Files:**
- Create: `components/SkellythonLadder.tsx`

- [ ] **Step 1: Write the ladder**

Create `components/SkellythonLadder.tsx`. Server component. Renders an ordered list; status is conveyed by **text** ("✓ reached" / "N subs to go" / "locked"), not color alone (a11y). Reached goals with a clip embed the clip. The finale (highest target) and any MERCH DROP / TATTOO goal get extra emphasis:

```tsx
import TwitchEmbed from "./TwitchEmbed";
import { isGoalReached } from "@/lib/skellython";
import type { SkellythonGoal } from "@/lib/content";

export default function SkellythonLadder({
  goals,
  liveSubs,
  baseline: _baseline,
}: {
  goals: SkellythonGoal[];
  liveSubs: number | null;
  baseline?: number;
}) {
  const sorted = [...goals].sort((a, b) => a.target - b.target);
  const nextIndex = sorted.findIndex((g) => !isGoalReached(g, liveSubs));

  return (
    <ol className="space-y-4 mt-8">
      {sorted.map((goal, i) => {
        const reached = isGoalReached(goal, liveSubs);
        const isNext = i === nextIndex;
        const big = i === sorted.length - 1 || /merch drop|tattoo/i.test(goal.dare);

        const frame = reached
          ? "bg-bg-card border-electric-blue/60 shadow-glow-blue"
          : isNext
          ? "bg-bg-card/70 border-gold/60 shadow-glow-gold"
          : "bg-bg-card/40 border-purple-core/25";

        return (
          <li
            key={`${goal.target}-${i}`}
            className={`rounded-xl border p-4 md:p-5 transition-colors ${frame} ${
              big ? "ring-1 ring-electric-pink/40" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`shrink-0 grid place-items-center rounded-lg font-bebas text-2xl md:text-3xl w-16 h-14 md:w-20 md:h-16 ${
                  reached ? "bg-electric-blue/20 text-electric-blue" : "bg-bg-primary text-text-muted"
                }`}
              >
                {goal.target.toLocaleString("en-US")}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`heading text-xl md:text-2xl ${big ? "text-electric-pink" : "text-white"}`}>
                  {goal.dare}
                </p>
                <p className="mt-1 text-xs font-bebas tracking-widest uppercase">
                  {reached ? (
                    <span className="text-electric-blue">✓ reached</span>
                  ) : liveSubs != null ? (
                    <span className="text-text-muted">
                      {Math.max(0, goal.target - liveSubs).toLocaleString("en-US")} subs to go
                    </span>
                  ) : (
                    <span className="text-text-muted">locked</span>
                  )}
                </p>
              </div>
            </div>

            {reached && goal.clip_url ? (
              <div className="mt-4">
                <TwitchEmbed mode="clip" value={goal.clip_url} title={`Clip: ${goal.dare}`} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/SkellythonLadder.tsx
git commit -m "Skellython: add SkellythonLadder (reached/locked nodes + clip reveal)"
```

---

## Task 5: Event ticker + marquee animation

**Files:**
- Modify: `tailwind.config.ts` (add `marquee` keyframe + animation)
- Create: `components/EventTicker.tsx`

- [ ] **Step 1: Add the marquee animation to Tailwind**

In `tailwind.config.ts`, add to the existing `keyframes` object (alongside `fade-up`, `glow-pulse`, `drift`):

```ts
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
```

And to the existing `animation` object:

```ts
        "marquee": "marquee 24s linear infinite",
```

- [ ] **Step 2: Write the ticker**

Create `components/EventTicker.tsx`. Server component. Reads its own data. Shows from now through `end_date`; copy adapts before vs during; duplicated track gives a seamless loop; `motion-reduce:animate-none` + an `aria-label` on the link keep it accessible:

```tsx
import Link from "next/link";
import { getSkellython } from "@/lib/content";
import { isTickerVisible, isBeforeEvent } from "@/lib/skellython-date";

export default function EventTicker() {
  const ev = getSkellython();
  if (!ev.enabled || !isTickerVisible(ev.end_date)) return null;

  const before = isBeforeEvent(ev.start_date);
  const cta = before ? "COMING SOON" : "WATCH THE CHAOS";
  const piece = [ev.name, ev.start_display, cta]
    .filter(Boolean)
    .join(" · ")
    .concat(" →");

  // One visible track is repeated; a second identical track makes the
  // translateX(-50%) loop seamless.
  const track = Array.from({ length: 6 }, () => piece);

  return (
    <Link
      href="/skellython"
      aria-label={`${ev.name}. ${ev.start_display}. ${cta}.`}
      className="block bg-gradient-to-r from-purple-deep via-electric-pink to-electric-blue text-bg-primary overflow-hidden group"
    >
      <div className="flex whitespace-nowrap py-1.5 font-bebas tracking-widest uppercase text-sm md:text-base animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        {[...track, ...track].map((t, i) => (
          <span key={i} className="mx-6 inline-flex items-center" aria-hidden={i > 0}>
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts components/EventTicker.tsx
git commit -m "Skellython: add EventTicker marquee + tailwind marquee animation"
```

---

## Task 6: The event page + hero asset

**Files:**
- Create: `public/skellython-hero.webp`
- Create: `app/skellython/page.tsx`

- [ ] **Step 1: Generate the optimized hero image**

The raw poster is 1545×1999 (~heavy). Downscale + convert to WebP:

```bash
python -c "from PIL import Image; im=Image.open(r'C:\Users\steph\Desktop\Starting_JUNE_22nd_at_430PM_CST_3.png').convert('RGB'); w=1000; im=im.resize((w, round(im.height*w/im.width)), Image.LANCZOS); im.save(r'public\skellython-hero.webp','WEBP',quality=82,method=6)"
```

Expected: `public/skellython-hero.webp` exists, well under ~250KB. Verify: `ls -la public/skellython-hero.webp`.

- [ ] **Step 2: Write the page**

Create `app/skellython/page.tsx`. Server component (`revalidate = 3600`). Composes hero (poster + live counter + progress bar), conditional live Twitch player, timer rules, the ladder, the stretch teaser, and CTAs. The `ProgressBar` uses `role="progressbar"` with aria values:

```tsx
import Image from "next/image";
import type { Metadata } from "next";
import { fetchChannelStats } from "@/lib/youtube";
import { getSkellython } from "@/lib/content";
import { computeProgress, type SkellythonProgress } from "@/lib/skellython";
import { isEventActive } from "@/lib/skellython-date";
import SkellythonLadder from "@/components/SkellythonLadder";
import TwitchEmbed from "@/components/TwitchEmbed";
import SectionDivider from "@/components/SectionDivider";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Skellython",
  description:
    "SKELLYTHON subathon — live sub goals, chaos challenges, and a tattoo on the line.",
  openGraph: {
    title: "SKELLYTHON · subathon event",
    description: "live sub goals, chaos challenges, and a tattoo on the line.",
    images: [{ url: "/skellython-hero.webp" }],
  },
};

export default async function SkellythonPage() {
  const ev = getSkellython();

  if (!ev.enabled) {
    return (
      <section className="bg-starfield-dense min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="heading text-5xl text-white">no event right now</h1>
          <p className="text-text-muted mt-3">check back soon for the next bout of chaos.</p>
        </div>
      </section>
    );
  }

  const stats = await fetchChannelStats();
  const liveSubs = stats?.subscriberCount ? Number(stats.subscriberCount) : null;
  const progress = computeProgress(ev.goals, liveSubs, ev.baseline);
  const active = isEventActive(ev.start_date, ev.end_date);

  return (
    <>
      {/* HERO */}
      <section className="bg-starfield-dense noise-overlay relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute inset-0 bg-electric-pink/30 blur-3xl rounded-full" />
              <Image
                src="/skellython-hero.webp"
                alt={`${ev.name} ${ev.subtitle} — ${ev.start_display}`}
                width={1000}
                height={1294}
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 384px, 80vw"
                className="relative w-full h-auto rounded-xl shadow-glow-purple-lg"
              />
            </div>
            <div>
              <p className="font-bangers text-electric-pink text-2xl">{ev.subtitle}</p>
              <h1 className="heading text-6xl md:text-7xl text-white mt-1">{ev.name}</h1>
              {ev.tagline && <p className="text-text-primary/90 text-lg mt-2">{ev.tagline}</p>}
              {ev.start_display && (
                <p className="font-bebas tracking-widest text-gold text-xl mt-3">{ev.start_display}</p>
              )}
              <div className="mt-6 bg-bg-card/70 border border-purple-core/30 rounded-xl p-5">
                <p className="text-text-muted font-bebas tracking-widest text-xs">LIVE YOUTUBE SUBS</p>
                <p className="heading text-5xl md:text-6xl text-white mt-1">
                  {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
                </p>
                <ProgressBar progress={progress} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE STREAM (during the event window) */}
      {active && ev.twitch_channel && (
        <section className="bg-bg-secondary py-12">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="heading text-4xl text-white text-center">SKELLY IS LIVE — WATCH THE TIMER</h2>
            <SectionDivider />
            <TwitchEmbed mode="channel" value={ev.twitch_channel} title="Skelly live on Twitch" />
          </div>
        </section>
      )}

      {/* TIMER RULES */}
      {ev.timer_rules.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <h2 className="heading text-4xl text-white text-center">THE TIMER KEEPS GOING</h2>
          <SectionDivider />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ev.timer_rules.map((r, i) => (
              <div key={i} className="bg-bg-card border border-purple-core/30 rounded-xl p-5 text-center">
                <p className="heading text-3xl text-gold">{r.amount}</p>
                <p className="text-text-muted text-sm mt-1">{r.per}</p>
              </div>
            ))}
          </div>
          {ev.spicy_cadence && (
            <p className="text-center font-bangers text-electric-pink text-2xl mt-6">{ev.spicy_cadence}</p>
          )}
        </section>
      )}

      {/* GOAL LADDER */}
      <section className="bg-bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="heading text-5xl text-white text-center">SUB GOALS &amp; CHALLENGES</h2>
          <SectionDivider />
          <SkellythonLadder goals={ev.goals} liveSubs={liveSubs} baseline={ev.baseline} />
        </div>
      </section>

      {/* STRETCH TEASER */}
      {ev.stretch_teaser && (
        <section className="max-w-4xl mx-auto px-6 lg:px-8 py-14 text-center">
          <div className="border-2 border-dashed border-electric-pink/50 rounded-xl p-8">
            <p className="font-bangers text-electric-pink text-3xl">WARNING</p>
            <p className="heading text-3xl md:text-4xl text-white mt-2">{ev.stretch_teaser}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-starfield py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="heading text-4xl text-white">PUSH THE COUNTER</h2>
          <p className="text-text-muted mt-2">every sub adds time and pushes the next dare closer.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="https://www.youtube.com/@officiallyskelly?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
              className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-6 py-3 hover:bg-gold-light hover:shadow-glow-gold transition-all"
            >
              SUBSCRIBE ON YOUTUBE →
            </a>
            <a
              href={`https://twitch.tv/${ev.twitch_channel}`}
              target="_blank"
              rel="noreferrer"
              className="font-bebas tracking-wide uppercase border-2 border-purple-core text-white rounded-md px-6 py-3 hover:bg-purple-core/20 hover:shadow-glow-purple transition-all"
            >
              WATCH ON TWITCH →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ProgressBar({ progress }: { progress: SkellythonProgress }) {
  const { nextGoal, pct, remaining, allReached } = progress;
  return (
    <div className="mt-3">
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          allReached
            ? "All goals reached"
            : nextGoal
            ? `${Math.round(pct)} percent toward ${nextGoal.target} subscribers`
            : "Progress"
        }
        className="h-3 bg-bg-primary rounded-full overflow-hidden border border-purple-core/30"
      >
        <div
          className="h-full bg-gradient-to-r from-electric-pink via-purple-light to-electric-blue transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-text-primary/90 text-sm mt-2">
        {allReached ? (
          "every goal smashed. absolute chaos."
        ) : nextGoal && remaining != null ? (
          <>
            {remaining.toLocaleString("en-US")} subs to go until{" "}
            <span className="text-electric-blue">{nextGoal.dare}</span>
          </>
        ) : nextGoal ? (
          <>
            next up at {nextGoal.target.toLocaleString("en-US")}:{" "}
            <span className="text-electric-blue">{nextGoal.dare}</span>
          </>
        ) : (
          "—"
        )}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Build + view the page**

Run: `npm run build`
Expected: build succeeds; `/skellython` appears in the route list with no type errors.

Then run `npm run dev` and open `http://localhost:3000/skellython`. Verify: hero renders the poster + live counter (a number if `YOUTUBE_API_KEY` is set locally, `—` if not), the ladder lists all 18 goals lowest→highest, locked goals show "N subs to go" (or "locked" with no key), the timer grid and stretch teaser render. No console errors.

- [ ] **Step 4: Commit**

```bash
git add public/skellython-hero.webp app/skellython/page.tsx
git commit -m "Skellython: add /skellython event page + optimized hero art"
```

---

## Task 7: Global wiring (layout, navbar, sitemap, README) + CMS

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `app/sitemap.ts`
- Modify: `README.md`
- Modify: `.pages.yml`

- [ ] **Step 1: Mount the ticker + pass the nav link in `app/layout.tsx`**

Add imports near the existing content imports:

```ts
import EventTicker from "@/components/EventTicker";
import { getSocial, getTheme, getSite, getSkellython, hexToRgbTriplet } from "@/lib/content";
import { isEventActive } from "@/lib/skellython-date";
```

(That replaces the existing `import { getSocial, getTheme, getSite, hexToRgbTriplet } from "@/lib/content";` line — just add `getSkellython` to it — and adds the two new import lines.)

Inside `RootLayout`, after the existing `const site = getSite();`, compute the nav link:

```ts
  const ev = getSkellython();
  const eventLink =
    ev.enabled && isEventActive(ev.start_date, ev.end_date)
      ? { href: "/skellython", label: ev.name }
      : null;
```

In the returned JSX, mount the ticker as the first child of `<body>` (above `<RevealOnScroll />`) and pass `eventLink` to `<Navbar>`:

```tsx
      <body className="min-h-screen bg-bg-primary text-text-primary">
        <EventTicker />
        <RevealOnScroll />
        <Navbar social={social} subscribeLink={subscribeLink} eventLink={eventLink} />
        <main>{children}</main>
        <Footer social={social} />
      </body>
```

- [ ] **Step 2: Accept + render `eventLink` in `components/Navbar.tsx`**

Add the prop to the type and signature, and prepend it to the links list. Replace the existing prop block and `links` computation:

```tsx
type NavExtraLink = { href: string; label: string } | null;

export default function Navbar({
  social,
  subscribeLink,
  eventLink,
}: {
  social: SocialLink[];
  subscribeLink?: NavExtraLink;
  eventLink?: NavExtraLink;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    ...(eventLink ? [eventLink] : []),
    ...NAV_LINKS,
    ...(subscribeLink ? [{ href: subscribeLink.href, label: subscribeLink.label }] : []),
  ];
```

(The existing `SubscribeLink` type alias and the old `links` ternary are removed in favor of the above. Everything below that uses `links` is unchanged.)

- [ ] **Step 3: List `/skellython` in `app/sitemap.ts`**

Add the import and conditionally include the route:

```ts
import { getSkellython } from "@/lib/content";
```

Inside `sitemap()`, after `staticRoutes` is declared, push the route when enabled:

```ts
  const ev = getSkellython();
  if (ev.enabled) staticRoutes.push("/skellython");
```

- [ ] **Step 4: Add the route to `README.md`**

In the `## Routes` list, add under the existing entries:

```md
- `/skellython` — live subathon goal ladder + Twitch clips (auto-banner shows now → end of event)
```

- [ ] **Step 5: Add the CMS screen to `.pages.yml`**

Insert this as a new item under `content:`, immediately **before** the `- name: theme` entry (so it sits at the top of the editable list, after the blog/fanart collections):

```yaml
  - name: skellython
    label: "🎉 Skellython Event"
    type: file
    path: content/skellython.json
    fields:
      - { name: enabled, label: "Show the event page + banner?", type: boolean, default: true }
      - { name: name, label: "Event name (e.g. SKELLYTHON)", type: string, required: true, default: "SKELLYTHON" }
      - { name: subtitle, label: "Subtitle (e.g. SUBATHON EVENT)", type: string, default: "SUBATHON EVENT" }
      - { name: tagline, label: "Tagline (e.g. can you handle the chaos)", type: string }
      - { name: start_date, label: "Start date (event goes live / live embed appears)", type: date, required: true }
      - { name: end_date, label: "End date (last day the banner + page run)", type: date, required: true }
      - { name: start_display, label: "Start text in hero (e.g. JUNE 22 · 4:30PM CST)", type: string }
      - { name: twitch_channel, label: "Twitch channel (handle only, e.g. officiallyskelly)", type: string, required: true }
      - { name: spicy_cadence, label: "Spicy challenge note (e.g. spicy challenge every 50 subs)", type: string }
      - { name: stretch_teaser, label: "Stretch-goals teaser text", type: string }
      - { name: baseline, label: "Bar floor for the first goal (advanced; e.g. 2300)", type: number }
      - name: timer_rules
        label: "Timer rules (the +X min lines)"
        type: object
        list: true
        fields:
          - { name: amount, label: "Amount (e.g. +1 min)", type: string, required: true }
          - { name: per, label: "Per what (e.g. per YouTube sub)", type: string, required: true }
      - name: goals
        label: "Goals & challenges (drag to reorder; lowest sub count first)"
        type: object
        list: true
        fields:
          - { name: target, label: "Sub goal number (e.g. 2325)", type: number, required: true }
          - { name: dare, label: "Challenge / dare", type: string, required: true }
          - { name: clip_url, label: "Twitch clip URL (paste after it happens; blank until then)", type: string }
          - { name: reached_override, label: "Force this goal to show as REACHED?", type: boolean, default: false }
```

If PagesCMS rejects `type: date` or `type: number` for this config version, fall back to `type: string` for `start_date`/`end_date`/`baseline`/`target` (the JSON values are already plain strings/numbers and the loader treats them as such).

- [ ] **Step 6: Build + verify wiring**

Run: `npm run build`
Expected: build succeeds, no type errors.

Then `npm run dev` and verify on `http://localhost:3000/`:
- The ticker shows at the very top of the home page (today is before June 22, so copy reads "… COMING SOON →") and links to `/skellython`.
- Because today is before `start_date`, the **nav link does NOT show** yet and the `/skellython` page shows no live Twitch embed (both gate on `isEventActive`). To confirm the active-window behavior, temporarily set `content/skellython.json` `start_date` to today's date, reload: the `SKELLYTHON` nav link appears and the live Twitch player renders. Revert `start_date` to `2026-06-22` afterward.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx components/Navbar.tsx app/sitemap.ts README.md .pages.yml
git commit -m "Skellython: mount ticker, conditional nav link, sitemap, README, CMS screen"
```

---

## Task 8: Full build + manual QA pass

**Files:** none (verification only)

- [ ] **Step 1: Clean production build**

Run: `npm run build`
Expected: succeeds; `/skellython` is listed; no type/lint errors.

- [ ] **Step 2: State matrix (manual, against `npm run dev`)**

Toggle `content/skellython.json` to exercise each state, reverting after:

- [ ] **Before event** (`start_date` in the future — the seeded value): ticker shows "COMING SOON", no nav link, page hero + ladder render, no live embed.
- [ ] **During event** (`start_date` = today): ticker shows "WATCH THE CHAOS", nav link present, live Twitch player renders (Twitch offline screen is expected if Skelly isn't streaming).
- [ ] **After event** (`end_date` in the past): ticker hidden, nav link gone, page still renders the full ladder (recap), no live embed.
- [ ] **Disabled** (`enabled: false`): ticker hidden, nav link gone, `/skellython` shows the "no event right now" state, route dropped from sitemap.

- [ ] **Step 3: Goal + clip behavior**

- [ ] Set one goal's `reached_override: true` → it flips to "✓ reached". Paste a real Twitch clip URL into that goal's `clip_url` → the clip embeds and plays. Try both URL shapes (`https://clips.twitch.tv/<slug>` and `https://www.twitch.tv/officiallyskelly/clip/<slug>`). Paste a garbage URL → the goal renders with no player and does not crash.
- [ ] With `YOUTUBE_API_KEY` set locally, confirm the live counter shows a real number and goals at/under it read "✓ reached", the rest "N subs to go", and the hero bar + "N subs to go until …" math is sane. With the key unset, counter shows "—", all goals "locked", no crash.

- [ ] **Step 4: Accessibility + motion**

- [ ] Keyboard: tab to the ticker (it's a link) and the CTAs; visible focus; the page is operable without a mouse.
- [ ] Enable OS "reduce motion" → the ticker stops scrolling (static text) and the link aria-label still announces the event.
- [ ] Run a Lighthouse pass on `/skellython` (Chrome DevTools): Accessibility and Performance in the green; confirm no major contrast failures on the cyan/pink/purple/gold against the dark bg.

- [ ] **Step 5: Final confirmation**

Report the build result and the QA matrix outcomes. Do not claim "done" without the `npm run build` output and the state-matrix checks above actually run. This is the hand-off point for the judge-panel / design-review polish loop (per the A&C quality gates).

---

## Notes for the implementer

- **Visual polish is expected to iterate.** This plan ships a correct, on-brand, accessible first pass using the existing token system. The hero layout, ladder node treatment, and ticker styling are the most likely candidates for refinement via `/design-review` and the judge panel — that's the intended next phase, not a gap in this plan.
- **No `git add .`** — stage the specific files listed in each task (the repo tracks compiled binaries elsewhere; always name files explicitly).
- **Don't touch** the unrelated working-tree noise (`.gitignore`, `.specstory/`, `.vscode/`).
