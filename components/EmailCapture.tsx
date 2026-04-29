"use client";

import { useState } from "react";

export default function EmailCapture({ cta = "DROP IT" }: { cta?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setState("err");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setState("err");
        return;
      }
      setState("ok");
      setEmail("");
    } catch {
      setState("err");
    }
  }

  const disabled = state === "loading";

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@chaos.club"
        className="flex-1 bg-bg-primary border-2 border-purple-core/40 focus:border-electric-blue focus:shadow-glow-blue rounded-md px-4 py-3 text-text-primary outline-none transition-all placeholder:text-text-muted disabled:opacity-60"
        required
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-5 py-3 hover:bg-gold-light hover:shadow-glow-gold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "..." : cta}
      </button>
      <div aria-live="polite" className="sr-only">
        {state === "ok" && "Email captured."}
        {state === "err" && "Submission failed."}
      </div>
      {state === "ok" && (
        <p className="sm:basis-full text-electric-blue text-sm font-bangers">welcome to the void.</p>
      )}
      {state === "err" && (
        <p className="sm:basis-full text-electric-pink text-sm font-bangers">welp. that broke. try again?</p>
      )}
    </form>
  );
}
