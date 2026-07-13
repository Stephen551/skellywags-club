// Optimize a Rodin (Hyper3D) PBR export into the web-ready hero GLB at
// public/models/skelly.glb. Run this once whenever Skelly's 3D model is
// regenerated. Not part of the app build — it's a manual one-off tool.
//
// One-time tooling install (in any scratch dir, or globally):
//   npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp
//
// Usage:
//   node scripts/optimize-hero-model.mjs <base_basic_pbr.glb> <texture_emissive.png> [out.glb] [texSize=2048]
//
// Why each step (learned the hard way — see docs/superpowers/specs/2026-07-12-hero-3d-model-design.md):
//   - Use the PBR export (base_basic_pbr.glb), NOT base_basic_shaded.glb: it
//     carries a real albedo + normal + metallic-roughness set. The shaded one
//     bakes color into the emissive slot for fullbright display.
//   - The PBR GLB does NOT wire the emissive glow (the eyes). We add it from the
//     separate near-black texture_emissive.png.
//   - Native Rodin retopo is already ~200k tris and clean — NO decimation.
//   - Data textures (normal, metallic-roughness) get higher WebP quality than
//     color/emissive, or lossy compression introduces shading artifacts.
//   - Meshopt-compress geometry last. Result ships ~2.2 MB.
//   - CSP note: three.js fetches the embedded textures as blob: URLs, so
//     next.config.mjs must allow blob: in connect-src (already done).

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { textureCompress, prune, dedup, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import fs from "node:fs";

const [, , SRC, EMISSIVE, OUT = "public/models/skelly.glb", TEX = "2048"] = process.argv;
if (!SRC || !EMISSIVE) {
  console.error("usage: node scripts/optimize-hero-model.mjs <pbr.glb> <emissive.png> [out.glb] [texSize]");
  process.exit(1);
}
const size = Number(TEX);

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

const doc = await io.read(SRC);
const mat = doc.getRoot().listMaterials()[0];

// Wire the selective emissive glow (eyes) the PBR export leaves out.
const glow = doc
  .createTexture("emissive")
  .setImage(new Uint8Array(fs.readFileSync(EMISSIVE)))
  .setMimeType("image/png");
mat.setEmissiveTexture(glow);
mat.setEmissiveFactor([1, 1, 1]);

await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 82, resize: [size, size], slots: /baseColor|emissive/ }),
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 94, resize: [size, size], slots: /normal/ }),
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 92, resize: [size, size], slots: /metallicRoughness/ }),
  prune(),
  dedup(),
  meshopt({ encoder: MeshoptEncoder, level: "high" })
);

await io.write(OUT, doc);
console.log(`wrote ${OUT} — ${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB`);
