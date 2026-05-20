"use client";

import { useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "that email looks broken. try again?",
  invalid_body: "something broke on our end. try again?",
  list_failed: "the void rejected your email. give it another shot.",
};

export default function EmailCapture({ cta = "DROP IT" }: { cta?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errMessage, setErrMessage] = useState<string>("welp. that broke. try again?");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setErrMessage(ERROR_MESSAGES.invalid_email);
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const code = typeof data?.error === "string" ? data.error : "";
        setErrMessage(ERROR_MESSAGES[code] ?? "welp. that broke. try again?");
        setState("err");
        return;
      }
      setState("ok");
      setEmail("");
    } catch {
      setErrMessage("welp. that broke. try again?");
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
        {state === "err" && errMessage}
      </div>
      {state === "ok" && (
        <p className="sm:basis-full text-electric-blue text-sm font-bangers">welcome to the void.</p>
      )}
      {state === "err" && (
        <p className="sm:basis-full text-electric-pink text-sm font-bangers">{errMessage}</p>
      )}
    </form>
  );
}
