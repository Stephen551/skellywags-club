import VideoCard from "@/components/VideoCard";
import GlowButton from "@/components/GlowButton";
import { fetchLatestVideos } from "@/lib/youtube";

export const revalidate = 3600;
export const metadata = { title: "Videos" };

const TABS = [
  { key: "all", label: "ALL VIDEOS" },
  { key: "members", label: "💀 SKELLYWAGS ONLY" },
] as const;

export default async function VideosPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const tab = searchParams?.tab === "members" ? "members" : "all";
  const videos = await fetchLatestVideos(12);

  return (
    <div className="bg-starfield noise-overlay relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
        <h1 className="heading text-6xl md:text-7xl text-white">THE TAPE VAULT</h1>
        <p className="text-text-muted mt-3">every misadventure, archived.</p>

        <div className="mt-8 flex gap-2 border-b border-purple-core/30">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <a
                key={t.key}
                href={`/videos?tab=${t.key}`}
                className={`px-5 py-3 font-bebas tracking-wider text-lg transition-colors ${
                  active
                    ? "text-white border-b-2 border-gold -mb-px"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {t.label}
              </a>
            );
          })}
        </div>

        {tab === "all" ? (
          videos.length === 0 ? (
            <EmptyState>
              YouTube key not set yet — add YOUTUBE_API_KEY to .env.local.
            </EmptyState>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <VaultTile key={i} />
              ))}
            </div>
            <div className="text-center mt-12 max-w-2xl mx-auto">
              <p className="text-text-muted mb-6">
                members get exclusive videos, behind-the-scenes, and the chaos that doesn't make YouTube. unlocked at the Boatswain tier and above.
              </p>
              <GlowButton variant="gold" size="lg" href="/members">JOIN TO WATCH →</GlowButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VaultTile() {
  return (
    <div className="relative aspect-video bg-bg-card border-2 border-purple-core/40 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center px-4 lift hover:border-electric-pink hover:shadow-glow-pink">
      <div className="absolute inset-0 bg-starfield-dense opacity-60" />
      <svg viewBox="0 0 64 64" className="relative w-14 h-14 text-purple-light opacity-80" fill="currentColor">
        <path d="M32 8c-10 0-18 8-18 18 0 6 3 10 6 12v6a2 2 0 0 0 2 2h4v-4h4v4h4v-4h4v4h4a2 2 0 0 0 2-2v-6c3-2 6-6 6-12 0-10-8-18-18-18Zm-6 18a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm12 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
      </svg>
      <p className="relative font-bangers text-2xl text-electric-pink mt-3 tracking-widest">SKELLYWAGS ONLY</p>
      <p className="relative text-text-muted text-xs mt-1">join to unlock</p>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-card border border-purple-core/30 rounded-xl p-12 text-center mt-10">
      <p className="font-bangers text-3xl text-electric-pink">nothing here yet.</p>
      <p className="text-text-muted mt-2">{children}</p>
    </div>
  );
}
