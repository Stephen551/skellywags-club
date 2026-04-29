"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import SocialIcon from "./SocialIcon";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-primary/80 border-b border-purple-core/25">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/skellyword.png"
            alt="SKELLY"
            width={180}
            height={72}
            priority
            className="h-14 w-auto drop-shadow-[0_0_14px_rgba(155,95,192,0.7)]"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`heading text-xl uppercase tracking-wider transition-colors ${
                  active ? "text-white" : "text-text-primary/85 hover:text-white"
                }`}
              >
                <span className="relative">
                  {l.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gold shadow-glow-gold" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3 text-text-primary/85">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="hover:text-electric-blue transition-colors"
            >
              <SocialIcon k={s.key as any} className="w-5 h-5" />
            </a>
          ))}
        </div>

        <button
          aria-label="Open menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden text-white p-2 -mr-2"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-bg-secondary/95 backdrop-blur-lg border-t border-purple-core/30 px-6 py-8">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="heading text-3xl text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-5">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.key} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                <SocialIcon k={s.key as any} className="w-6 h-6 text-text-primary" />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
