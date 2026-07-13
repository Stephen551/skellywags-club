# Hero 3D Model — Design Spec

**Date:** 2026-07-12
**Branch:** `feat/hero-3d-model`
**Status:** Approved for planning

## Goal

Replace the static avatar PNG in the homepage hero with a live, interactive 3D
model of Skelly that the visitor gently rotates with their pointer — without
regressing the site's sub-second mobile LCP gate or WCAG 2.2 AA compliance.

## Context

- The hero currently renders `theme.avatar_url` (`/avatar.png`) via a `priority`
  `next/image`, tuned to be the LCP element ([app/page.tsx:69-92](../../../app/page.tsx#L69-L92)).
- The project has **no 3D dependencies** today (no `three`, no R3F). This design
  adds them.
- Content is CMS-driven via `content/theme.json` (`avatar_url` lives there). The
  PNG stays in play as the poster (see Architecture §3).

### The source asset (ground truth)

Supplied as a zip containing:

| File | Size | Notes |
|------|------|-------|
| `base_basic_shaded.glb` | **90.6 MB** | glTF 2.0, **~2,000,000 triangles**, 1.17M verts, one embedded **14 MB PNG** texture, **no** geometry compression |
| `texture_emissive.png` | 79 KB | Separate emissive map (Skelly's glowing eyes) — not yet wired into the material |

The naming and topology are the signature of a raw AI 3D generator (Meshy /
Rodin / Hunyuan class). **It cannot ship as-is** — it would download ~90 MB
before first paint and likely exhaust low-end mobile GPU memory on the texture
upload. Optimization (Architecture §1) is the bulk of the work; rendering is
straightforward once the asset is web-weight.

## Behavior spec

One unified model: **the pointer gently turns Skelly within a clamped front
cone.** The clamp is both the interaction and the guardrail — the viewer never
sees the imperfect back/sides of the generated mesh.

- **Desktop (mouse):** cursor position maps to a rotation target, damped-lerped
  each frame, hard-clamped to ≈ **±18° yaw / ±8° pitch**. Eases back toward
  center when the cursor leaves the hero.
- **Mobile (touch):** finger-drag accumulates into the same clamped rotation
  target; a slow swipe nudges him left/right. Springs back toward center on
  release.
- **Both, idle:** a subtle sinusoidal "breathing" drift so he's never dead-still.
- **`prefers-reduced-motion`:** all rotation and drift disabled; model frozen to
  a static front pose. (WCAG 2.2 AA — non-negotiable.)

## Architecture

### 1. Asset optimization pipeline (offline, one-time)

Rebuild the 90 MB source into a web asset with **`gltf-transform`** (npm/npx,
uses meshoptimizer wasm for simplify + sharp for textures — no native binaries
required for the WebP path):

1. `weld` — merge duplicate vertices.
2. `simplify` — decimate **2M → ~40–70k triangles**. Tune the ratio visually so
   the **front** stays clean; back-face degradation is acceptable (never shown).
3. `resize` + `webp` — shrink the 14 MB texture to ~2K WebP (~300–600 KB).
   *(KTX2/Basis GPU compression is a later option if mobile GPU memory demands
   it; it needs the KTX-Software CLI installed, so not the default.)*
4. Wire `texture_emissive.png` in as the material's `emissiveTexture` so the eyes
   glow. Verify the base material's emissive factor is set.
5. `meshopt` — compress geometry.

- **Target: ~1.5–3 MB total GLB.**
- **Output:** `public/models/skelly.glb` (+ any decoder assets under
  `public/`). Source zip contents are **not** committed.
- The pipeline commands get captured in a short `scripts/optimize-model.md` (or a
  runnable script) so the step is reproducible when the model is regenerated.

### 2. `components/HeroModel.tsx`

- Client component (`"use client"`), imported into the hero via `next/dynamic`
  with `ssr: false` — WebGL can't SSR, and this keeps the renderer + model
  **code-split out of the initial bundle** (loads after first paint).
- **React Three Fiber + drei** (`useGLTF`). Recommended for the cleanest control
  over the clamped-rotation + idle-drift + reduced-motion logic. *Vanilla
  three.js is the fallback if the R3F/drei bundle causes us to miss the perf
  gate.*
- **Loaders:** register `MeshoptDecoder` (and DRACO decoder path if we end up on
  draco) so `useGLTF` can read the compressed geometry.
- **Lighting:** manual lights only (no HDR download) — ambient + a directional
  key + two on-brand colored rim/point lights (purple `#9B5FC0`, pink `#FF4FCB`)
  echoing the hero glow. Emissive eyes carry their own glow. Shadows **off**
  (cost). Postprocessing/bloom **out of scope v1** (bundle + GPU); the existing
  `bg-purple-core blur-3xl` glow div stays behind the canvas.
- **Rotation:** single target `{yaw, pitch}` updated from mouse (viewport-
  normalized) or touch-drag delta, clamped to the cone, damped toward the model
  each frame, plus the idle sine offset. Reduced-motion short-circuits to a
  static pose.

### 3. Hero integration ([app/page.tsx](../../../app/page.tsx))

Replace the single `<Image>` in the hero-right column with a **poster + canvas
stack**:

- The current avatar PNG **stays** as the `priority` / `fetchPriority="high"`
  poster → remains the LCP element, so **first paint is unchanged**.
- `<HeroModel>` (dynamic, `ssr:false`) mounts on top, starts at `opacity:0`, and
  **cross-fades in** once its first frame renders.
- Existing purple glow div stays behind the stack.
- Remove the CSS `animate-drift` from the container (idle drift now lives in the
  3D) to avoid double motion; the poster can keep it until the canvas fades in.

### 4. Fallbacks / graceful degradation

- **No WebGL / context-loss:** canvas never fades in (or reverts) → poster PNG
  remains. No broken state.
- **Reduced-motion:** the model still loads but is frozen to a static front
  pose (per behavior spec) — no rotation, no drift.

### 5. Performance guardrails (defending the LCP gate)

- Poster-first → LCP element unchanged.
- Renderer + model code-split via dynamic import; load after LCP (idle / on
  mount post-paint).
- Clamp `dpr` to `[1, 1.5]` so mobile doesn't render at 3×.
- **Pause the render loop when the hero scrolls out of view** (IntersectionObserver
  → `frameloop` off) for battery.
- Antialias tuned for mobile; no shadows.

## Dependencies & honest cost

- Adds `three`, `@react-three/fiber`, `@react-three/drei` — roughly
  **180–250 KB gzipped of JS**, code-split and loaded *after* LCP.
- Model asset ~1.5–3 MB, fetched after first paint.
- **Mobile is the real risk** of "3D everywhere": GPU variance, battery, possible
  jank on low-end phones. Mitigations above are how we hold the green. If a
  target genuinely can't clear the perf bar, that gets flagged — not quietly
  shipped as a regression.

## Accessibility

- `prefers-reduced-motion`: no motion, static pose.
- The model is decorative; the poster `<img>` retains the meaningful `alt`. The
  canvas is `aria-hidden`.
- No keyboard trap — the hero remains fully navigable; rotation is pointer-only
  enhancement, not required for any content.

## Verification (before "done")

- `next build` clean.
- Visual QA at desktop + mobile viewports (browse/Playwright): clamp holds, back
  never shows, eyes glow, cross-fade is smooth, reduced-motion freezes.
- **Core Web Vitals check** confirming LCP has not regressed vs. the PNG hero.

## Out of scope (v1 / YAGNI)

- Bloom / postprocessing.
- KTX2 texture path (revisit only if mobile GPU memory forces it).
- 3D models anywhere other than the homepage hero.
- Any CMS control over the model (it's a fixed asset for now).

## Open risks

- Final triangle/texture targets are tuned empirically in the optimization pass;
  the ~1.5–3 MB figure is a target, not a guarantee, and depends on how much the
  front tolerates decimation.
- R3F/drei bundle size is the main lever if we miss the perf gate → vanilla
  three.js fallback.
