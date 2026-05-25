"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 120;
const ATTRACTION = 0.0006;
const SPRING = 0.0018;
const DAMPING = 0.92;
const MAX_OFFSET = 70;

type Star = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

export default function CursorStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const cursor = { x: 0, y: 0, active: false };
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId: number | null = null;
    let visible = !document.hidden;
    let intersecting = true;

    function resize() {
      const rect = parent!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = Array.from({ length: STAR_COUNT }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          baseX: x,
          baseY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          r: Math.random() * 1.1 + 0.4,
          alpha: Math.random() * 0.45 + 0.25,
        };
      });
    }

    function step() {
      ctx!.clearRect(0, 0, width, height);
      for (const s of stars) {
        if (cursor.active) {
          s.vx += (cursor.x - s.x) * ATTRACTION;
          s.vy += (cursor.y - s.y) * ATTRACTION;
        }
        s.vx += (s.baseX - s.x) * SPRING;
        s.vy += (s.baseY - s.y) * SPRING;
        s.vx *= DAMPING;
        s.vy *= DAMPING;
        s.x += s.vx;
        s.y += s.vy;
        const ox = s.x - s.baseX;
        const oy = s.y - s.baseY;
        const od2 = ox * ox + oy * oy;
        if (od2 > MAX_OFFSET * MAX_OFFSET) {
          const od = Math.sqrt(od2);
          s.x = s.baseX + (ox / od) * MAX_OFFSET;
          s.y = s.baseY + (oy / od) * MAX_OFFSET;
        }
        ctx!.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (rafId == null && visible && intersecting) {
        rafId = requestAnimationFrame(step);
      }
    }
    function stop() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      cursor.x = e.clientX - rect.left;
      cursor.y = e.clientY - rect.top;
      cursor.active = true;
    }
    function onLeave() {
      cursor.active = false;
    }
    function onVisibility() {
      visible = !document.hidden;
      if (visible) start();
      else stop();
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);

    const io = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        if (intersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(parent);

    window.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}
