function parentHosts(): string[] {
  const hosts = new Set<string>(["localhost"]);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      hosts.add(new URL(site).hostname);
    } catch {
      /* ignore malformed env */
    }
  }
  hosts.add("skellywags.club");
  return Array.from(hosts);
}

/** Pull the clip slug out of any of: clips.twitch.tv/<slug>,
 *  twitch.tv/<chan>/clip/<slug>, an ...?clip=<slug> embed URL, or a bare slug. */
export function parseClipSlug(input: string): string | null {
  if (!input) return null;
  const raw = input.trim();

  const clipParam = raw.match(/[?&]clip=([^&]+)/);
  if (clipParam) return decodeURIComponent(clipParam[1]);

  const noQuery = raw.split(/[?#]/)[0].replace(/\/+$/, "");

  let m = noQuery.match(/\/clip\/([^/]+)$/);
  if (m) return m[1];

  m = noQuery.match(/clips\.twitch\.tv\/([^/]+)$/);
  if (m && m[1] !== "embed") return m[1];

  if (/^[A-Za-z0-9_-]+$/.test(noQuery)) return noQuery;
  return null;
}

export default function TwitchEmbed({
  mode,
  value,
  title,
}: {
  mode: "channel" | "clip";
  value: string;
  title: string;
}) {
  const parents = parentHosts()
    .map((h) => `parent=${encodeURIComponent(h)}`)
    .join("&");

  let src: string | null = null;
  if (mode === "channel" && value) {
    src = `https://player.twitch.tv/?channel=${encodeURIComponent(value)}&${parents}`;
  } else if (mode === "clip") {
    const slug = parseClipSlug(value);
    if (slug) src = `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&${parents}`;
  }

  if (!src) return null;

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg border-2 border-purple-core/40 bg-black">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        scrolling="no"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
