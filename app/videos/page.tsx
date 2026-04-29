import VideoCard from "@/components/VideoCard";
import GlowButton from "@/components/GlowButton";
import { fetchUploadsCategorized } from "@/lib/youtube";

export const revalidate = 3600;
export const metadata = { title: "Videos" };

type Tab = "videos" | "shorts" | "lives" | "members";

const TABS: { key: Tab; label: string }[] = [
  { key: "videos", label: "VIDEOS" },
  { key: "shorts", label: "SHORTS" },
  { key: "lives", label: "LIVES" },
  { key: "members", label: "💀 SKELLYWAGS ONLY" },
];

export default async function VideosPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const tab: Tab = (TABS.find((t) => t.key === searchParams?.tab)?.key as Tab) ?? "videos";

  if (tab === "members") {
    return (
      <PageShell tab={tab} totals={{ videos: 0, shorts: 0, lives: 0 }}>
        <MembersOnlyGrid />
      </PageShell>
    );
  }

  const cats = await fetchUploadsCategorized(50);
  const totals = { videos: cats.videos.length, shorts: cats.shorts.length, lives: cats.lives.length };
  const list = cats[tab as "videos" | "shorts" | "lives"];

  return (
    <PageShell tab={tab} totals={totals}>
      {list.length === 0 ? (
        <EmptyState>
          {tab === "shorts" && "no shorts in the last 50 uploads — skelly's been keeping it long."}
          {tab === "lives" && "no archived live streams in the last 50 uploads."}
          {tab === "videos" && "YouTube key not set or no recent uploads."}
        </EmptyState>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {list.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function PageShell({
  tab,
  totals,
  children,
}: {
  tab: Tab;
  totals: { videos: number; shorts: number; lives: number };
  children: React.ReactNode;
}) {
  return (
    <div className="bg-starfield noise-overlay relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
        <h1 className="heading text-6xl md:text-7xl text-white">THE TAPE VAULT</h1>
        <p className="text-text-muted mt-3">every misadventure, archived.</p>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-purple-core/30">
          {TABS.map((t) => {
            const active = t.key === tab;
            const count =
              t.key === "videos" ? totals.videos :
              t.key === "shorts" ? totals.shorts :
              t.key === "lives" ? totals.lives : null;
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
                {count !== null && count > 0 && (
                  <span className="ml-2 text-xs text-text-muted">({count})</span>
                )}
              </a>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}

function MembersOnlyGrid() {
  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <VaultTile key={i} />
        ))}
      </div>
      <div className="text-center mt-12 max-w-2xl mx-auto">
        <p className="text-text-muted mb-6">
          members get exclusive videos, behind-the-scenes, and the chaos that doesn't make YouTube.
          unlocked at the Boatswain tier and above.
        </p>
        <GlowButton variant="gold" size="lg" href="/members">JOIN TO WATCH →</GlowButton>
      </div>
    </>
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
