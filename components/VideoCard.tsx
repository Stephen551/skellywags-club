import Image from "next/image";
import Link from "next/link";

export type VideoData = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt?: string;
  viewCount?: string;
  duration?: string;
  url?: string;
};

export default function VideoCard({ video, locked = false }: { video: VideoData; locked?: boolean }) {
  const href = video.url || `https://www.youtube.com/watch?v=${video.id}`;
  const Inner = (
    <div className="group relative bg-bg-card border border-purple-core/30 rounded-xl overflow-hidden lift hover:border-electric-blue hover:shadow-glow-blue">
      <div className="relative aspect-video bg-bg-secondary overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={locked ? "object-cover blur-md scale-110" : "object-cover group-hover:scale-105 transition-transform duration-500"}
        />
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary/70 text-center px-4">
            <span className="font-bangers text-3xl text-electric-pink">SKELLYWAGS ONLY</span>
            <span className="text-text-muted text-sm mt-1">join to watch</span>
          </div>
        )}
        {!locked && video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="heading text-lg text-white line-clamp-2 leading-tight">
          {video.title}
        </h3>
        <p className="text-text-muted text-sm mt-2">
          {video.viewCount && <>{video.viewCount} views</>}
          {video.viewCount && video.publishedAt && " · "}
          {video.publishedAt}
        </p>
      </div>
    </div>
  );

  if (locked) {
    return <Link href="/members">{Inner}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {Inner}
    </a>
  );
}
