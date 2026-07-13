"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";

// The R3F canvas is client-only (WebGL can't SSR) and code-split so the
// three.js bundle never touches the initial load — it fetches after the poster.
const HeroModel = dynamic(() => import("./HeroModel"), { ssr: false });

// If WebGL init or the model load throws, swallow it and keep the poster.
class GLBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroAvatar({ src, alt }: { src: string; alt: string }) {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Defer mounting the heavy canvas until the main thread is idle, so it never
  // competes with the LCP paint of the poster.
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const cb = () => setMount(true);
    const id = w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 1500 }) : window.setTimeout(cb, 400);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  const show3d = ready && !failed;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[620px]">
      {/* on-brand purple glow */}
      <div className="absolute inset-0 scale-90 rounded-full bg-purple-core opacity-50 blur-3xl" />

      {/* Poster: server-rendered, priority — this is the LCP element. Holds the
          drift until the live model takes over, then fades out. */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          show3d ? "opacity-0" : "opacity-100 animate-drift"
        }`}
        aria-hidden={show3d}
      >
        <Image
          src={src || "/avatar.png"}
          alt={alt}
          width={620}
          height={620}
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 620px, (min-width: 640px) 60vw, 70vw"
          className="h-full w-full object-contain drop-shadow-[0_0_50px_rgba(155,95,192,0.8)]"
        />
      </div>

      {/* Live 3D: mounts after idle, cross-fades over the poster. */}
      {mount && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${show3d ? "opacity-100" : "opacity-0"}`}>
          <GLBoundary onError={() => setFailed(true)}>
            <HeroModel onReady={() => setReady(true)} />
          </GLBoundary>
        </div>
      )}
    </div>
  );
}
