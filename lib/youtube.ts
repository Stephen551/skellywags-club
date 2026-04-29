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

function parseIsoDuration(d: string): number {
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type CategorizedVideos = {
  videos: VideoData[];
  shorts: VideoData[];
  lives: VideoData[];
};

export async function fetchUploadsCategorized(max = 50): Promise<CategorizedVideos> {
  const empty: CategorizedVideos = { videos: [], shorts: [], lives: [] };
  if (!KEY) return empty;
  const stats = await fetchChannelStats();
  if (!stats) return empty;

  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${stats.uploadsPlaylistId}&maxResults=${max}&key=${KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!playlistRes.ok) return empty;
  const playlistData = await playlistRes.json();
  const items: any[] = playlistData.items ?? [];
  if (items.length === 0) return empty;

  const ids = items.map((it) => it.contentDetails.videoId).join(",");
  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,liveStreamingDetails&id=${ids}&key=${KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!videosRes.ok) return empty;
  const videosData = await videosRes.json();
  const videoItems: any[] = videosData.items ?? [];

  const out: CategorizedVideos = { videos: [], shorts: [], lives: [] };
  for (const v of videoItems) {
    const seconds = parseIsoDuration(v.contentDetails?.duration ?? "");
    const data: VideoData = {
      id: v.id,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url,
      publishedAt: new Date(v.snippet.publishedAt).toLocaleDateString(),
      duration: formatDuration(seconds),
    };
    const wasLive = !!v.liveStreamingDetails?.actualStartTime;
    if (wasLive) {
      out.lives.push(data);
    } else if (seconds > 0 && seconds <= 60) {
      out.shorts.push(data);
    } else {
      out.videos.push(data);
    }
  }
  return out;
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

export type Playlist = {
  id: string;
  title: string;
  itemCount: number;
};

export async function fetchPlaylists(max = 25): Promise<Playlist[]> {
  if (!KEY) return [];
  const id = await resolveChannelId();
  if (!id) return [];
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${id}&maxResults=${max}&key=${KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const items = data.items ?? [];
  return items.map((it: any): Playlist => ({
    id: it.id,
    title: it.snippet.title,
    itemCount: it.contentDetails?.itemCount ?? 0,
  }));
}

export async function fetchPlaylistVideos(playlistId: string, max = 24): Promise<VideoData[]> {
  if (!KEY) return [];
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${max}&key=${KEY}`,
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
