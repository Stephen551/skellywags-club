# skellywags.club — Passdown (2026-07-12)

Pick-up notes for the next session. Everything below is committed and live on
`skellywags.club` (Vercel auto-deploys on push to `main`). Nothing is half-done.

The site is a custom Next.js 14 brand hub for VTuber **@OfficiallySkelly** that
wraps Fourthwall (merch/memberships) and YouTube. It processes no payments. Copy
and most page content are CMS-driven from `content/*.{json,md}` (Skelly edits via
Pages CMS); see `EDITOR_GUIDE.md`. Design tokens/fonts are theme-driven from
`content/theme.json` (currently custom fonts: Skellyv2 headings, Comico body).

---

## Update — 2026-07-12 (interactive 3D hero)

Replaced the static hero avatar PNG with a live, interactive 3D model of Skelly.
All committed and deployed; verified on production desktop + a real 390px mobile
viewport.

**What it is:**
- **Desktop:** cursor-follow — he "watches" the pointer, clamped to ±45° yaw /
  ±14° pitch. Face + glowing eyes stay front.
- **Mobile:** drag-to-spin 360° turntable with flick momentum; holds wherever you
  leave him. The director tested it on-device and signed off ("feels great").
- **Look:** true PBR (albedo + normal + metallic-roughness) lit by a procedural
  IBL environment (drei `<Lightformer>` panels — no HDR download), tinted
  on-brand purple/pink; emissive eyes glow.

**How it's built (poster-first, so LCP is unchanged):** the avatar PNG stays as a
server-rendered `priority` poster and remains the LCP element; the R3F canvas is
code-split via `next/dynamic({ ssr:false })`, loads after idle, and cross-fades
over the poster. Home route First Load JS is **103 kB** (~+3 kB vs siblings) — the
~200 kB three.js bundle is fully deferred. Respects `prefers-reduced-motion`;
render loop pauses when scrolled out of view. Error boundary keeps the poster if
WebGL fails.

**Asset:** `public/models/skelly.glb`, **2.16 MB**. Built from the Rodin PBR
export (native 200k tris — no decimation) with `scripts/optimize-hero-model.mjs`.
Regenerate with that script when Skelly's model changes (its header documents the
gotchas — use `base_basic_pbr.glb` not `_shaded`, wire the emissive map, keep data
textures high-quality). The source Rodin zip is NOT committed.

**Gotcha of record:** three.js loads the GLB's embedded textures as same-origin
`blob:` URLs via the Fetch API, so `connect-src` in the CSP needed `blob:` added
(`next.config.mjs`). Without it the model renders untextured. (`img-src` already
allowed it.)

**Also fixed this session:** the hero title overflowed on phones — the unbreakable
word "OFFICIALLY" at `text-7xl` had a min-content width wider than a phone
viewport, blowing out the CSS grid track and clipping the title + tagline under
the section's `overflow-hidden`. Fixed with a fluid `clamp(2.25rem,10vw,4.5rem)`
on mobile; desktop sizes unchanged (`app/page.tsx`).

**Open (not blocking):** the flick momentum/friction constants
(`SPIN_FRICTION`, `MAX_SPIN_VEL` in `components/HeroModel.tsx`) were validated as
good on-device but are easy to nudge if the feel ever needs tuning.

**Commits (newest first):** `9df4a87` mobile title fix · `f9246c4` spec ·
`5ccf488` feature (components + page) · `eb745cf` CSP blob: · `eb00e8a` asset ·
`37fab59` deps · `8931ab5` skellython disabled (event ended June 28).

---

## Where the build is

Feature-complete brand hub, live on `skellywags.club`. Pages: home, shop
(placeholder — merch not launched, email capture only), videos (public +
members-only lock UI), members (tiers → YouTube join), about, community
(schedule / Discord widget / fan-art wall / merch-train), blog (markdown),
subscribe, legal, `/admin/subscribers` (basic-auth), skellython (currently
disabled — event ended). Email capture runs through Resend (`RESEND_SETUP.md`)
with a Discord-webhook + Upstash fallback.

The `/skellython` subathon page is built and content-driven; it's off now
(`content/skellython.json` `enabled:false`) and degrades to a "no event" state.
Re-enable + update dates/goals when the next subathon is scheduled.

---

## Open TODO before full launch (from README, still current)

- [ ] Real `YOUTUBE_API_KEY` + `YOUTUBE_CHANNEL_ID` in prod env (video grids +
      subscriber count render empty/graceful without it).
- [ ] Real Fourthwall storefront URL (`NEXT_PUBLIC_FOURTHWALL_SHOP_URL`).
- [ ] Real About copy from creator.
- [ ] Wire fan-art submission form to a real backend (currently holding state).
- [ ] Update `YOUTUBE_MEMBERSHIP_URL` in `lib/constants.ts` once the channel
      verifies for memberships.
- Note: the hero poster (`content/theme.json` `avatar_url`) is still used as the
  LCP image + 3D fallback; keep it a clean transparent PNG.

---

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also the pre-push sanity check)
```

**Deploy:** push to `main` → Vercel builds and deploys to `skellywags.club`
automatically. To confirm a deploy is live, poll a build-unique string, e.g.
`curl -sL https://skellywags.club/ | grep 10vw` or check
`https://skellywags.club/models/skelly.glb` returns 200.

**Re-optimize the 3D model:** install the gltf-transform tooling (see the script
header), then
`node scripts/optimize-hero-model.mjs <pbr.glb> <emissive.png>` → writes
`public/models/skelly.glb`.

---

## Where things live

- 3D hero: `components/HeroModel.tsx` (R3F canvas, lighting, dual-mode rotation),
  `components/HeroAvatar.tsx` (poster-first cross-fade wrapper), wired in
  `app/page.tsx`. Asset `public/models/skelly.glb`. Optimizer
  `scripts/optimize-hero-model.mjs`. Spec
  `docs/superpowers/specs/2026-07-12-hero-3d-model-design.md`.
- Security headers / CSP: `next.config.mjs`.
- Content/CMS: `content/*.{json,md}`, loaded via `lib/content.ts`. Site copy in
  `content/site.json`; theme/fonts in `content/theme.json`.
- Integrations: `lib/youtube.ts`, `lib/fourthwall.ts`, `lib/discord.ts`,
  `lib/resend.ts` + `app/api/subscribe/route.ts` (subscriber store
  `lib/subscribers-store.ts`).
- Admin auth: `middleware.ts` (basic-auth on `/admin/*`).
- Editor-facing docs: `EDITOR_GUIDE.md`, `WELCOME_SKELLY.md`, `RESEND_SETUP.md`.
- Cross-session memory: `~/.claude/projects/…/memory/`.
