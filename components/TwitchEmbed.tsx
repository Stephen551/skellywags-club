function parentHosts(): string[] {
  const hosts = new Set<string>(["localhost"]);
  // Twitch requires `parent` to EXACTLY match the embedding page's hostname.
  // The site canonicalizes to www, so register BOTH the apex and the www
  // variant of every known host (skellywags.club AND www.skellywags.club).
  const add = (h: string) => {
    if (!h) return;
    hosts.add(h);
    if (h.startsWith("www.")) hosts.add(h.slice(4));
    else hosts.add(`www.${h}`);
  };
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      add(new URL(site).hostname);
    } catch {
      /* ignore malformed env */
    }
  }
  add("skellywags.club");
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
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        scrolling="no"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
