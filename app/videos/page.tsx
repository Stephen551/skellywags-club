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
              {(videos.length > 0 ? videos.slice(0, 6) : Array.from({ length: 6 })).map((v: any, i: number) => (
                <VideoCard
                  key={v?.id ?? i}
                  locked
                  video={
                    v ?? {
                      id: `placeholder-${i}`,
                      title: "MEMBERS ONLY: skelly's worst takes, locked",
                      thumbnail: "/skellybanner.jpg",
                    }
                  }
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <GlowButton variant="gold" size="lg" href="/members">JOIN TO WATCH →</GlowButton>
            </div>
          </>
        )}
      </div>
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
