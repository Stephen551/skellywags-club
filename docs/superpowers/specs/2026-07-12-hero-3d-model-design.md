# Hero 3D Model — Design Spec (as built)

**Date:** 2026-07-12
**Branch:** `feat/hero-3d-model`
**Status:** Implemented

> This doc was updated to match what shipped. The original plan assumed a raw
> single-mesh generator export needing heavy decimation and a fullbright/unlit
> render. Midway, a **native Rodin rebuild at 200k triangles with a proper PBR
> material set** arrived, which changed the asset pipeline (no decimation) and
> the render (true PBR + image-based lighting). The interaction also grew from a
> single clamped nudge into two device-appropriate modes.

## Goal

Replace the static avatar PNG in the homepage hero with a live, interactive 3D
model of Skelly, without regressing the sub-second mobile LCP gate or WCAG 2.2 AA.

## Source asset

Rodin export (`364f02d2…zip`). We use **`base_basic_pbr.glb`**:

- Native **200,000 triangles** — clean topology, smooth face, no decimation needed.
- Proper PBR maps at HD (~2K): diffuse (albedo), normal, metallic-roughness.
- Emissive is **not** wired into the PBR GLB, so we add it from the separate
  `texture_emissive.png` (the near-black selective glow map — the eyes).

The alternate `base_basic_shaded.glb` (color baked into emissive, fullbright) was
rejected in favour of the PBR variant, which carries a normal map and responds
correctly to lighting.

## Behavior — two device-appropriate modes

- **Desktop (mouse):** cursor-follow. Pointer position maps to a rotation target,
  damped each frame, clamped to **±45° yaw / ±14° pitch**. He "watches" the
  cursor; face + glowing eyes stay the focal point. The native mesh is clean all
  around, so the clamp is for focus, not to hide anything.
- **Mobile (touch):** free-spin turntable. Drag rotates a full 360°, a flick
  keeps spinning with inertia (capped + friction-decayed), and he holds wherever
  you leave him. `touch-action: pan-y` keeps vertical page-scroll intact.
- **Both, idle:** a subtle sinusoidal "breathing" drift so he's never dead-still.
- **`prefers-reduced-motion`:** all rotation/drift/momentum disabled; model frozen
  to a static front pose.

## Architecture

### 1. Asset optimization (`scratchpad/optimize-pbr.mjs`, run once)

`gltf-transform` pipeline on `base_basic_pbr.glb`:

1. Wire `texture_emissive.png` in as the material's emissive map (+ factor).
2. Texture-compress per slot: color/emissive → WebP q82; **normal q94 and
   metallic-roughness q92** (data textures — higher quality avoids shading
   artifacts). Resize ≤ 2048.
3. `prune` + `dedup`, then **meshopt** geometry compression.

- **Output:** `public/models/skelly.glb`, **2.16 MB** (200k tris; textures
  83 KB diffuse / 162 KB normal / 136 KB metal-rough / 11 KB emissive).
- Source zip is **not** committed.

### 2. `components/HeroModel.tsx` (client)

- React Three Fiber + drei `useGLTF(url, /*draco*/ false, /*meshopt*/ true)`.
- **Lighting:** proper PBR needs IBL, so a **procedural `<Environment>`** built
  from a few tinted `<Lightformer>` panels (no HDR download, baked once via
  `frames={1}`) gives the metallic/roughness surfaces something to reflect and
  lifts the figure on-brand; plus a directional key for form/specular. Emissive
  intensity bumped so the eyes glow.
- **Rotation:** a single control ref drives either the clamped cursor-follow
  (mouse) or the free-spin accumulator + momentum (touch); see Behavior.
- **Framing:** drei `<Bounds fit observe>` + `<Center>` auto-frame at any size.
- **Perf guards:** `dpr` clamped `[1, 1.5]`; render loop paused via
  IntersectionObserver when the hero scrolls out of view; no shadows.

### 3. `components/HeroAvatar.tsx` (client) — poster-first cross-fade

- Renders the avatar **PNG poster** (server-rendered, `priority`) — this stays
  the **LCP element**, so first paint is unchanged.
- Lazy-loads `HeroModel` via `next/dynamic({ ssr: false })` after idle
  (`requestIdleCallback`), so the ~200 KB three.js bundle is code-split out of
  the initial load and never competes with LCP.
- Cross-fades the canvas over the poster once the model's first frame renders.
- An error boundary keeps the poster if WebGL init / model load throws.

### 4. Hero integration (`app/page.tsx`)

The avatar block now renders `<HeroAvatar>` inside the existing hero-right column.

### 5. CSP (`next.config.mjs`)

three.js extracts the GLB's embedded WebP textures into same-origin `blob:` URLs
and fetches them via the Fetch API, so `connect-src` needed **`blob:`** added.
(`img-src` already allowed it.)

## Results (verified)

- Production build clean; home route **First Load JS 103 kB** (~+3 kB vs
  siblings) — the three.js bundle is fully deferred, poster remains LCP.
- Desktop cursor-follow and mobile drag-spin both verified; the back of the model
  is clean when spun around.

## Accessibility

- `prefers-reduced-motion`: static front pose, no motion.
- Poster `<img>` keeps the meaningful `alt`; the canvas is decorative.
- Rotation is a pointer-only enhancement — no keyboard trap, no content gated on it.

## Open items

- Flick **momentum/friction** were tuned by logic, not by feel; may want a nudge
  after real-device testing.
- Optional future: KTX2/Basis textures if mobile GPU memory ever demands it.

## Out of scope

- Bloom/postprocessing.
- 3D anywhere but the homepage hero.
- CMS control over the model (fixed asset).
