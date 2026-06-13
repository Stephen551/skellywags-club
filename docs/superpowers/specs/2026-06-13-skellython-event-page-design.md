# Skellython — event page + site-wide ticker

**Date:** 2026-06-13
**Status:** Draft, awaiting user approval

## Goal

A dedicated `/skellython` page for Skelly's **SKELLYTHON** subathon (starts June 22, 4:30PM CST; runs through June 28). The page shows a live goal ladder driven by the YouTube subscriber count, each goal revealing a Twitch clip once it's hit, the live Twitch stream, the subathon timer rules, and a redacted stretch-goal teaser. A site-wide ticker banner auto-appears during the event window and links to the page.

## Non-goals

- **A live ticking subathon clock computed by the site.** The real timer lives on the Twitch stream/overlay, driven by subs, follows, and dollars the website can't see. Inventing a number would break the no-fabrication rule. We show the static rules and embed the live stream instead.
- **Twitch API / OAuth.** No live-detection, no real-time sub/follow/dollar counts. The ladder uses the YouTube sub count already wired up; the Twitch player shows its own offline screen when Skelly isn't live.
- **Per-visitor API cost.** YouTube sub count is already cached server-side (`revalidate: 3600` in `lib/youtube.ts`). No new per-request cost.
- **Automated clip capture.** Skelly pastes Twitch clip URLs into the CMS as each goal happens.
- **Tracking spend / dollars / memberships on-site.** Those are stream-side timer inputs only.

## Decisions locked during brainstorming

1. **Metric:** live **YouTube subscriber count** drives the progress bar (hybrid — live bar fills automatically; Skelly manually adds the clip and can force a goal "reached").
2. **Banner:** **site-wide, auto-scheduled.** Shows from **now through the last event day** (`end_date`), evaluated in **America/Chicago** (CST). Before `start_date` it's a "coming up" teaser; during the event it's the live promo; it auto-hides once `end_date` passes. (The nav link and the live Twitch embed still wait for the event to actually start on `start_date`.)
3. **Timer:** **Both** — a static "how it works" rules block **and** an embedded live Twitch player.
4. **Goals:** 18 goals, text confirmed by Stephen (table below).
5. **Progress bar fills toward the _next unreached_ goal**, not one giant bar to 3000 — reads as steady momentum during the event.

## The goal data (confirmed by Stephen)

| Target subs | Challenge (dare) |
|---|---|
| 2325 | Rewatch oldest YT video and react |
| 2350 | Sourest candy challenge |
| 2375 | Chat makes me tweet |
| 2400 | Horror game at 3AM |
| 2425 | Underarm waxed |
| 2450 | Shock collar / Ask Me Anything (1HR) |
| 2475 | RIP Pokémon booster box |
| 2500 | Chat designs NEW model outfit |
| 2550 | Chat makes Skelly's pizza order |
| 2600 | Plan Discord movie night |
| 2650 | VR game (no VRChat) |
| 2700 | Skelly shaves beard |
| 2750 | MERCH DROP!!!! |
| 2800 | Skelly opens PO box for fan mail |
| 2850 | Chat picks game / play with chat |
| 2900 | Chat picks my Comic-Con cosplay |
| 2950 | Mods take over stream |
| 3000 | SKELLY TATTOO (finale) |

Increments are +25 (2325→2500) then +50 (2500→3000). MERCH DROP (2750) and SKELLY TATTOO (3000) get extra visual emphasis.

## What ships

### 1. Data model — `content/skellython.json`

```jsonc
{
  "enabled": true,
  "name": "SKELLYTHON",
  "subtitle": "SUBATHON EVENT",
  "tagline": "can you handle the chaos",
  "start_date": "2026-06-22",          // day the event window opens (CST)
  "end_date": "2026-06-28",            // last day inclusive (CST)
  "start_display": "JUNE 22 · 4:30PM CST",
  "twitch_channel": "officiallyskelly", // drives live player + clip parent
  "spicy_cadence": "spicy challenge every 50 subs",
  "stretch_teaser": "Stretch goals too chaotic to reveal yet.",
  "baseline": 2300,                     // bar floor for goal #1 (optional; see formula)
  "timer_rules": [
    { "amount": "+1 min", "per": "per YouTube sub" },
    { "amount": "+1 min", "per": "per Twitch follow" },
    { "amount": "+2 min", "per": "per dollar spent" },
    { "amount": "+5 min", "per": "per membership / sub" }
  ],
  "goals": [
    { "target": 2325, "dare": "Rewatch oldest YT video and react", "clip_url": "", "reached_override": false }
    // ... 17 more, exactly as the table above
  ]
}
```

Field notes:
- **`clip_url`** — full Twitch clip share URL Skelly pastes when the goal happens (blank = no player yet).
- **`reached_override`** — manual "mark as done" if the clip is up before the live count ticks past the target.
- **`baseline`** — the bar's floor for the first goal so it doesn't render near-empty (see progress formula).

### 2. CMS — `.pages.yml` screen

New section added to `content:`, modeled on the existing `schedule` / `tiers` list-of-objects pattern, placed near the top of the editable list (event is time-sensitive):

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
      - { name: start_date, label: "Start date (banner shows from this day)", type: date, required: true }
      - { name: end_date, label: "End date (last day banner shows)", type: date, required: true }
      - { name: start_display, label: "Start text shown in hero (e.g. JUNE 22 · 4:30PM CST)", type: string }
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
          - { name: clip_url, label: "Twitch clip URL (paste after it happens; leave blank until then)", type: string }
          - { name: reached_override, label: "Force this goal to show as REACHED?", type: boolean, default: false }
```

### 3. `lib/content.ts` — loader + types

Add, following the existing getter pattern (defaults + try/catch):

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
  start_date: string;   // "YYYY-MM-DD"
  end_date: string;     // "YYYY-MM-DD"
  start_display: string;
  twitch_channel: string;
  spicy_cadence: string;
  stretch_teaser: string;
  baseline?: number;
  timer_rules: SkellythonTimerRule[];
  goals: SkellythonGoal[];
};

export function getSkellython(): Skellython { /* read JSON, merge defaults */ }
```

Plus small date helpers (own module or co-located): `cstToday(): string` — today's `YYYY-MM-DD` in America/Chicago — and `isEventActive(start, end): boolean` — `start_date <= cstToday() <= end_date`. The **ticker** uses `cstToday() <= end_date` (now → last day); the **nav link, live embed, and the page's "during" state** use `isEventActive`. Implemented with `Intl.DateTimeFormat` formatting `new Date()` into the CST calendar date and string-comparing `YYYY-MM-DD` (no extra deps).

### 4. Event page — `app/skellython/page.tsx`

Server component. Reads `getSkellython()` + `fetchChannelStats()` (live subs). Renders top → bottom:

1. **Hero** — poster-matched palette (cyan / hot-pink / purple, stars). Wordmark `name`, `subtitle`, `tagline`, `start_display`. Big **live sub count** and the progress bar toward the next unreached goal with "N subs to go until [next dare]". Optimized poster art used as a hero visual (see Assets).
2. **Live Twitch player** — embedded during the event window (`isEventActive`); shows Twitch's own offline screen when Skelly isn't live. Hidden outside the window.
3. **Timer rules** — static block rendering `timer_rules` (`+1 min / per YouTube sub`, etc.) + the `spicy_cadence` note.
4. **Goal ladder** — vertical, sorted by `target` asc. Each goal is a node: **REACHED** (lit, expands to embed its Twitch clip if `clip_url` set) or **LOCKED** (dim, shows target + "N subs to go"). MERCH DROP + SKELLY TATTOO emphasized.
5. **Stretch-goals teaser** — redacted "too chaotic to reveal yet" block.
6. **CTA** — **subscribe on YouTube** (the channel URL, e.g. `https://www.youtube.com/@officiallyskelly?sub_confirmation=1` — this drives the goal metric, so it is the channel subscribe link, NOT the paid `youtube_membership_url`) + **watch on Twitch** (`twitch_channel`).

**Page states (never 404s):**
- **Before** `start_date`: hero shows a countdown-flavored teaser; ladder visible as the preview; no Twitch embed.
- **During** window: full live experience.
- **After** `end_date`: recap — all goals shown with their clips; "that was Skellython" framing; no live embed.
- **`enabled: false`**: page still resolves but renders a simple "no event right now" state (and the ticker is hidden).

### 5. Components

- **`components/EventTicker.tsx`** — the top marquee. Server component; pure-CSS scroll. Renders when `enabled && cstToday() <= end_date` (now through the final event day, then auto-hides). Text adapts: before `start_date` → `SKELLYTHON · {start_display} · COMING SOON →`; during the window → `SKELLYTHON · {start_display} · WATCH THE CHAOS →`. Repeated, linking to `/skellython`. Respects `prefers-reduced-motion` (static, non-scrolling text). Dismissible-per-session is **out of scope** (keep it simple; it's a short-run banner).
- **`components/SkellythonLadder.tsx`** (+ a `GoalNode` subcomponent) — renders the goal list, computes reached/locked, the progress bar, and embeds clips. Pure presentation; receives goals + live count as props.
- **`components/TwitchEmbed.tsx`** — one component, two modes: `channel` (live player) and `clip` (clip player). Builds the iframe `src` with the correct `parent` params (see Twitch details).

### 6. `app/layout.tsx`

Mount `<EventTicker />` as the first child of `<body>`, above `<Navbar>`, so it spans every page. Reads `getSkellython()` alongside the existing `getSite()` / `getSocial()` / `getTheme()` calls.

### 7. Navbar + sitemap

- **`components/Navbar.tsx`** — when `enabled && isEventActive`, inject a `SKELLYTHON` nav link (emphasized). Auto-removed when the window passes. No CMS toggle needed beyond the event's own `enabled` + dates.
- **`app/sitemap.ts`** — add `/skellython` when `enabled`.

## Architecture / data flow

```
content/skellython.json ──┐
                          │  getSkellython()        fetchChannelStats()
                          ▼            │                     │  (cached 1h)
              EventTicker (layout)     │                     │
                          │            ▼                     ▼
                          │     app/skellython/page.tsx (server)
                          │            │
                          │            ├─ Hero (live subs + progress)
                          │            ├─ TwitchEmbed channel=... (during window)
                          │            ├─ Timer rules (static)
                          │            ├─ SkellythonLadder(goals, liveSubs)
                          │            │     └─ per reached goal: TwitchEmbed clip=...
                          │            └─ Stretch teaser + CTA
                          ▼
     cstToday() <= end_date gates the TICKER · isEventActive(start,end) gates nav link + live embed + page "during" state   (America/Chicago / CST)
```

## Live-count + "reached" logic

- `liveSubs = Number(fetchChannelStats()?.subscriberCount)` — may be `null`/`NaN` if the API key is missing (e.g. local dev). Guard: when unavailable, the bar shows `—` and all goals render **locked** (no crash).
- A goal is **reached** when `liveSubs >= target` **OR** `reached_override === true`.
- **Next goal** = first goal (ascending) that is not reached.
- **Progress bar** toward the next goal:
  - `prev = target of the last reached goal` (or `baseline`, or `goals[0].target - 25` if no baseline) and `next = next goal target`.
  - `pct = clamp01((liveSubs - prev) / (next - prev))`; `remaining = max(0, next - liveSubs)`.
- When every goal is reached, the bar shows 100% and a "all goals smashed" state.

## Twitch embed details (the one gotcha)

Twitch iframes require `parent=` host params:
- **Live player:** `https://player.twitch.tv/?channel={twitch_channel}&parent=skellywags.club&parent=localhost`
- **Clip:** `https://clips.twitch.tv/embed?clip={slug}&parent=skellywags.club&parent=localhost`

- Parent hosts: derive the production host from `NEXT_PUBLIC_SITE_URL` (→ `skellywags.club`) and always also include `localhost` for dev. Multiple `parent` params are allowed and harmless.
- **Clip slug parsing** from whatever Skelly pastes. Handle both shapes:
  - `https://clips.twitch.tv/<Slug>`
  - `https://www.twitch.tv/<channel>/clip/<Slug>?...` (strip query string)
  - If parsing fails, render the dare with no player (don't crash).
- Iframes get `title`, `allowfullscreen`, lazy-loading, and a fixed 16:9 aspect wrapper.

## Date / timezone logic

- Two day-level windows, both evaluated in **America/Chicago** (CST):
  - **Ticker visible:** `enabled && cstToday() <= end_date` — shows from now through the last event day, then auto-hides.
  - **Event active** (gates nav link + live Twitch embed + the page's "during" state): `start_date <= cstToday() <= end_date`.
- The 4:30PM start time is **display only** (`start_display`); it does not gate either window.
- Implemented via `Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" })` to get a sortable `YYYY-MM-DD` (`cstToday()`), then string compare. No new dependency.

## Assets

- Optimize the event poster into `public/skellython-hero.webp` (and/or `.jpg`) for the hero — the source is 1545×1999 and too heavy to ship raw. Target a web-sized, compressed version. (Stephen to confirm whether to use the poster art directly or a CSS-built hero; default: use the optimized poster as a hero visual.)

## Quality gates

- **Accessibility (WCAG 2.2 AA):** progress uses a real labelled bar (`role`/`aria-valuenow`/`aria-valuemax` or `<progress>`); ladder is keyboard-navigable; reached/locked state is conveyed by text + icon, not color alone; reduced-motion disables ticker scroll and any count animation; Twitch iframes have titles; contrast checked on the cyan/pink/purple/gold against the dark bg; touch targets ≥ 24px; skip-link + landmarks already present in layout.
- **Performance:** live subs cached server-side; poster optimized; Twitch iframes lazy-loaded; ticker is CSS-only (no JS). No layout shift from the ticker (reserve its height when shown).
- **Brand / AI-slop:** echoes the poster's art direction; distinct from every other page on the site; no card-on-card, no centered-everything, no default font stacks, no generic gradients.
- **Copy / voice:** goal text verbatim from Stephen; surrounding copy in Skelly's chaos voice; no banned vocabulary, no em dashes in body copy, no exclamation-mark spam (the poster's own `!!!!` in MERCH DROP is preserved as data, not authored copy).

## Files to create

- `content/skellython.json` — event data, seeded with all 18 goals + timer rules.
- `app/skellython/page.tsx` — the event page.
- `components/EventTicker.tsx` — site-wide marquee banner.
- `components/SkellythonLadder.tsx` — goal ladder + progress + clip nodes.
- `components/TwitchEmbed.tsx` — live + clip iframe builder.
- `lib/skellython-date.ts` (or co-located in `lib/content.ts`) — `isEventActive()` helper.
- `public/skellython-hero.webp` — optimized hero art (from the poster).

## Files to modify

- `.pages.yml` — add the `skellython` CMS section.
- `lib/content.ts` — add `Skellython` types + `getSkellython()` (+ helper if co-located).
- `app/layout.tsx` — mount `<EventTicker />` above the navbar.
- `components/Navbar.tsx` — inject the `SKELLYTHON` link during the window.
- `app/sitemap.ts` — list `/skellython`.
- `README.md` — add `/skellython` to the Routes list.

## Testing

Manual checklist (project has no test runner; adding one is out of scope):

- [ ] `/skellython` renders with live sub count (set `YOUTUBE_API_KEY` locally) and with it absent (bar shows `—`, goals locked, no crash).
- [ ] Goals reached/locked flip correctly around the live count; `reached_override` forces reached.
- [ ] Progress bar + "N subs to go" math correct at first goal, mid-ladder, and all-reached.
- [ ] A pasted clip URL (both URL shapes) embeds and plays; a blank one shows the dare only; a garbage URL doesn't crash.
- [ ] Live Twitch player embeds during the window; shows offline state when not streaming; hidden outside the window.
- [ ] Ticker shows on every page from now through `end_date` (including before the event as a "coming soon" teaser), links to `/skellython`, auto-hides after `end_date`; reduced-motion stops the scroll.
- [ ] Nav link appears only during the window.
- [ ] Pre-event / during / post-event / `enabled:false` page states all render sensibly.
- [ ] Pages CMS shows the "Skellython Event" screen; editing goals/clips/dates updates the page.
- [ ] Lighthouse: a11y + perf green; no CLS from the ticker.

## Out of scope (call out for later)

- Live subathon countdown clock computed on-site.
- Twitch API live-detection / real follow/dollar counts.
- Animated number count-up on the live sub total (could add later as progressive enhancement).
- Per-session ticker dismissal.
- Stretch-goal reveal mechanics beyond the static teaser.
- Automated clip capture / Twitch clip API.
- Confetti / sound on goal-reached.
