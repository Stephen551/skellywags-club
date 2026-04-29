import type { VideoData } from "@/components/VideoCard";

const KEY = process.env.YOUTUBE_API_KEY;
const HANDLE_OR_ID = process.env.YOUTUBE_CHANNEL_ID || "";

type ChannelStats = {
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  uploadsPlaylistId: string;
};

let cachedChannelId: string | null = null;

async function resolveChannelId(): Promise<string | null> {
  if (!KEY) return null;
  if (cachedChannelId) return cachedChannelId;

  if (HANDLE_OR_ID.startsWith("UC")) {
    cachedChannelId = HANDLE_OR_ID;
    return cachedChannelId;
  }
  // Resolve handle (e.g. @officiallyskelly) to channel ID
  const handle = HANDLE_OR_ID.replace(/^@/, "") || "officiallyskelly";
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}&key=${KEY}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  cachedChannelId = data.items?.[0]?.id ?? null;
  return cachedChannelId;
}

export async function fetchChannelStats(): Promise<ChannelStats | null> {
  if (!KEY) return null;
  const id = await resolveChannelId();
  if (!id) return null;
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${id}&key=${KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;
  return {
    subscriberCount: item.statistics.subscriberCount,
    videoCount: item.statistics.videoCount,
    viewCount: item.statistics.viewCount,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
}

export async function fetchLatestVideos(max = 6): Promise<VideoData[]> {
  if (!KEY) return [];
  const stats = await fetchChannelStats();
  if (!stats) return [];
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${stats.uploadsPlaylistId}&maxResults=${max}&key=${KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const items = data.items ?? [];
  return items.map((it: any): VideoData => ({
    id: it.contentDetails.videoId,
    title: it.snippet.title,
    thumbnail: it.snippet.thumbnails?.high?.url || it.snippet.thumbnails?.medium?.url,
    publishedAt: new Date(it.contentDetails.videoPublishedAt || it.snippet.publishedAt).toLocaleDateString(),
  }));
}

export function formatCount(n: string | number | undefined): string {
  if (n == null) return "—";
  const x = typeof n === "string" ? parseInt(n, 10) : n;
  if (!Number.isFinite(x)) return "—";
  if (x >= 1_000_000) return (x / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (x >= 1_000) return (x / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(x);
}
