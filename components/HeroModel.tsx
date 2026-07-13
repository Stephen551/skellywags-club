"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Bounds, Center, Environment, Lightformer } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/skelly.glb";

// Desktop is a cursor-follow: he looks toward the pointer, clamped to a
// generous cone that shows the sides but keeps the face + glowing eyes front.
const MAX_YAW = THREE.MathUtils.degToRad(45); // left/right, cursor X
const MAX_PITCH = THREE.MathUtils.degToRad(14); // up/down, cursor Y

// Touch is a free-spin turntable: drag rotates a full 360°, a flick keeps
// spinning with inertia, and he stays wherever you leave him.
const SPIN_PER_WIDTH = Math.PI * 2.2; // dragging one canvas-width ≈ 1.1 turns
const TOUCH_PITCH_MAX = THREE.MathUtils.degToRad(20);
const MAX_SPIN_VEL = 14; // rad/s momentum cap on release (~2.2 turns/sec)
const SPIN_FRICTION = 0.04; // fraction of velocity kept per second (lower = stops sooner)

// Load the mesh with meshopt decoding enabled and draco disabled (our asset
// uses EXT_meshopt_compression, no draco). Preload so it starts fetching as
// soon as this chunk evaluates.
useGLTF.preload(MODEL_URL, false, true);

type Control = {
  mode: "mouse" | "touch";
  yaw: number; // desktop clamped target
  pitch: number;
  spinYaw: number; // touch free accumulator (unbounded)
  spinVel: number; // touch momentum, rad/s
  spinPitch: number; // touch pitch target (clamped)
  dragging: boolean;
};

function Skelly({
  control,
  reducedMotion,
  onReady,
}: {
  control: React.MutableRefObject<Control>;
  reducedMotion: boolean;
  onReady: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL, false, true);
  const group = useRef<THREE.Group>(null);
  const eased = useRef({ yaw: 0, pitch: 0 });

  // Clone so React strict-mode double-mounts and future swaps don't fight over
  // one shared scene graph. Bump emissive so the eyes actually glow.
  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && "emissiveIntensity" in mat) mat.emissiveIntensity = 1.6;
      }
    });
    return root;
  }, [scene]);

  useEffect(() => {
    // One frame after mount the model is in the graph and textures are
    // uploading; signal the wrapper to cross-fade the canvas in.
    const id = requestAnimationFrame(() => onReady());
    return () => cancelAnimationFrame(id);
  }, [onReady]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const c = control.current;

    if (reducedMotion) {
      g.rotation.set(0, 0, 0);
      return;
    }

    const t = performance.now() / 1000;
    const breatheYaw = Math.sin(t * 0.5) * THREE.MathUtils.degToRad(2);
    const breathePitch = Math.sin(t * 0.33) * THREE.MathUtils.degToRad(1);
    const pitchK = 1 - Math.pow(0.001, delta);

    if (c.mode === "touch") {
      // Coast on momentum when not actively dragging.
      if (!c.dragging) {
        c.spinYaw += c.spinVel * delta;
        c.spinVel *= Math.pow(SPIN_FRICTION, delta);
        if (Math.abs(c.spinVel) < 0.02) c.spinVel = 0;
      }
      eased.current.pitch = THREE.MathUtils.lerp(eased.current.pitch, c.spinPitch, pitchK);
      g.rotation.y = c.spinYaw + breatheYaw;
      g.rotation.x = eased.current.pitch + breathePitch;
    } else {
      const k = 1 - Math.pow(0.001, delta);
      eased.current.yaw = THREE.MathUtils.lerp(eased.current.yaw, c.yaw, k);
      eased.current.pitch = THREE.MathUtils.lerp(eased.current.pitch, c.pitch, k);
      g.rotation.y = eased.current.yaw + breatheYaw;
      g.rotation.x = eased.current.pitch + breathePitch;
    }
  });

  return (
    <Bounds fit clip observe margin={1.1}>
      <group ref={group}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </Bounds>
  );
}

export default function HeroModel({ onReady }: { onReady?: () => void }) {
  const control = useRef<Control>({
    mode: "mouse", yaw: 0, pitch: 0, spinYaw: 0, spinVel: 0, spinPitch: 0, dragging: false,
  });
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef({ lastX: 0, startY: 0, startPitch: 0, lastT: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Pause the render loop when the hero is scrolled out of view (battery).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

  // Desktop: cursor position over the viewport maps to a clamped look-target.
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      const c = control.current;
      if (c.mode === "touch") return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      c.yaw = clamp(nx * MAX_YAW, MAX_YAW);
      c.pitch = clamp(ny * MAX_PITCH, MAX_PITCH);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion]);

  // Touch: free-spin turntable with flick momentum.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch" || reducedMotion) return;
    const c = control.current;
    c.mode = "touch";
    c.dragging = true;
    c.spinVel = 0;
    drag.current = { lastX: e.clientX, startY: e.clientY, startPitch: c.spinPitch, lastT: performance.now() };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const c = control.current;
    if (!c.dragging) return;
    const w = wrap.current?.clientWidth || window.innerWidth;
    const h = wrap.current?.clientHeight || window.innerHeight;
    const now = performance.now();
    const dt = Math.max((now - drag.current.lastT) / 1000, 0.001);
    const stepYaw = ((e.clientX - drag.current.lastX) / w) * SPIN_PER_WIDTH;
    c.spinYaw += stepYaw;
    c.spinVel = clamp(stepYaw / dt, MAX_SPIN_VEL);
    c.spinPitch = clamp(
      drag.current.startPitch + ((e.clientY - drag.current.startY) / h) * (TOUCH_PITCH_MAX * 2),
      TOUCH_PITCH_MAX
    );
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
  };
  const endDrag = () => {
    control.current.dragging = false; // momentum takes over from here
  };

  const frameloop = reducedMotion ? "demand" : visible ? "always" : "never";

  return (
    <div
      ref={wrap}
      className="absolute inset-0 h-full w-full touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 30, position: [0, 0, 5], near: 0.1, far: 100 }}
        style={{ background: "transparent" }}
      >
        {/* Proper PBR needs image-based lighting: this procedural environment
            (no HDR download — baked once from a few emissive panels) gives the
            metallic/roughness surfaces something to reflect and lifts the whole
            figure, tinted on-brand. A directional key adds crisp form + specular. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.6} position={[0, 2.5, 4]} scale={[10, 6, 1]} color="#F4ECFF" />
          <Lightformer form="rect" intensity={1.7} position={[-5, 1, 2]} scale={[5, 7, 1]} color="#9B5FC0" />
          <Lightformer form="rect" intensity={1.4} position={[5, 0.5, 2]} scale={[5, 7, 1]} color="#FF4FCB" />
          <Lightformer form="rect" intensity={0.9} position={[0, -3, 3]} scale={[8, 4, 1]} color="#4FC3F7" />
        </Environment>
        <ambientLight intensity={0.4} />
        <directionalLight position={[1.5, 3, 4]} intensity={1.3} />
        <Suspense fallback={null}>
          <Skelly control={control} reducedMotion={reducedMotion} onReady={() => onReady?.()} />
        </Suspense>
      </Canvas>
    </div>
  );
}
