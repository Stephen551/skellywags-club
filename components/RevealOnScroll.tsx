"use client";

import { useEffect } from "react";

export default function RevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const reveal = (el: Element) => el.classList.add("in");
    // Anything already in (or above) the viewport on mount: reveal immediately.
    const vh = window.innerHeight;
    els.forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.top < vh * 0.9) reveal(e);
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((e) => {
      if (!e.classList.contains("in")) io.observe(e);
    });
    const fallback = window.setTimeout(() => {
      document.querySelectorAll(".reveal").forEach(reveal);
    }, 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);
  return null;
}
