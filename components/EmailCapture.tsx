"use client";

import { useState } from "react";

export default function EmailCapture({ cta = "DROP IT" }: { cta?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setState("err");
      return;
    }
    // Placeholder: when Fourthwall list URL is available, POST there.
    setState("ok");
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@chaos.club"
        className="flex-1 bg-bg-primary border-2 border-purple-core/40 focus:border-electric-blue focus:shadow-glow-blue rounded-md px-4 py-3 text-text-primary outline-none transition-all placeholder:text-text-muted"
        required
      />
      <button
        type="submit"
        className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-5 py-3 hover:bg-gold-light hover:shadow-glow-gold transition-all"
      >
        {cta}
      </button>
      <div aria-live="polite" className="sr-only">
        {state === "ok" && "Email captured."}
        {state === "err" && "Invalid email."}
      </div>
      {state === "ok" && (
        <p className="sm:basis-full text-electric-blue text-sm font-bangers">welcome to the void.</p>
      )}
      {state === "err" && (
        <p className="sm:basis-full text-electric-pink text-sm font-bangers">welp. that's not an email.</p>
      )}
    </form>
  );
}
