"use client";

import { useState } from "react";

export default function FanArtForm() {
  const [state, setState] = useState<"idle" | "ok">("idle");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Placeholder: route to /api/fanart when ready.
    setState("ok");
    (e.target as HTMLFormElement).reset();
  }

  if (state === "ok") {
    return (
      <div className="mt-4 bg-bg-primary border border-electric-blue/40 rounded-md p-4 text-center">
        <p className="font-bangers text-2xl text-electric-blue">submission received.</p>
        <p className="text-text-muted text-sm mt-1">skelly will yell when it's approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3">
      <input
        required
        name="name"
        placeholder="your name / handle"
        className="bg-bg-primary border-2 border-purple-core/40 focus:border-electric-blue rounded-md px-4 py-3 outline-none transition-all placeholder:text-text-muted"
      />
      <input
        required
        name="social"
        placeholder="link us to your socials"
        className="bg-bg-primary border-2 border-purple-core/40 focus:border-electric-blue rounded-md px-4 py-3 outline-none transition-all placeholder:text-text-muted"
      />
      <input
        type="file"
        accept="image/*"
        className="text-text-muted file:mr-3 file:bg-purple-core file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md"
      />
      <button
        type="submit"
        className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-5 py-3 hover:bg-gold-light hover:shadow-glow-gold transition-all"
      >
        SUBMIT TO THE WALL
      </button>
    </form>
  );
}
