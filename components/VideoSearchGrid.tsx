"use client";

import { useMemo, useState } from "react";
import VideoCard, { type VideoData } from "./VideoCard";

export default function VideoSearchGrid({ videos }: { videos: VideoData[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(needle));
  }, [q, videos]);

  return (
    <>
      <div className="mt-8 relative">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search the vault..."
          className="w-full bg-bg-card border-2 border-purple-core/40 focus:border-electric-blue focus:shadow-glow-blue rounded-xl pl-12 pr-12 py-4 text-text-primary outline-none transition-all placeholder:text-text-muted"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-electric-pink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {q && (
        <p className="text-text-muted text-sm mt-3">
          {filtered.length === 0
            ? `nothing matches "${q}".`
            : `${filtered.length} ${filtered.length === 1 ? "result" : "results"} for "${q}".`}
        </p>
      )}

      {filtered.length === 0 ? (
        !q && (
          <div className="bg-bg-card border border-purple-core/30 rounded-xl p-12 text-center mt-10">
            <p className="font-bangers text-3xl text-electric-pink">nothing here yet.</p>
          </div>
        )
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </>
  );
}
