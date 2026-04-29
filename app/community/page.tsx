import StreamScheduleBlock from "@/components/StreamScheduleBlock";
import GlowButton from "@/components/GlowButton";
import SectionDivider from "@/components/SectionDivider";
import FanArtForm from "@/components/FanArtForm";
import Image from "next/image";
import DiscordWidget from "@/components/DiscordWidget";
import { getFanArt, getSchedule } from "@/lib/content";

export const metadata = { title: "The Skellywag Clubhouse" };

function FanArtTile({ art }: { art: import("@/lib/content").FanArt }) {
  const inner = (
    <>
      <Image
        src={art.image}
        alt={art.caption || `art by ${art.artist}`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/70 to-transparent px-3 py-3">
        <p className="font-bebas text-lg text-white tracking-wide">{art.artist}</p>
        {art.caption && <p className="text-text-muted text-xs line-clamp-1">{art.caption}</p>}
      </div>
    </>
  );
  const className =
    "group relative aspect-square bg-bg-card border-2 border-purple-core/40 rounded-xl overflow-hidden lift hover:border-electric-pink hover:shadow-glow-pink";
  if (art.social_url) {
    return (
      <a href={art.social_url} target="_blank" rel="noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}

const MERCH_STEPS = [
  { n: "01", text: "Watch Skelly live on Twitch." },
  { n: "02", text: "Find merch on this site or the gift link in chat." },
  { n: "03", text: "Gift it to a chatter — Fourthwall handles fulfillment." },
  { n: "04", text: "FourthwallHQ bot announces the lucky chaos recipient." },
];

export default function CommunityPage() {
  const schedule = getSchedule();
  const fanart = getFanArt();
  return (
    <>
      <section className="relative bg-starfield-dense noise-overlay">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
          <h1 className="heading text-6xl md:text-7xl text-white">THE SKELLYWAG CLUBHOUSE</h1>
          <p className="text-text-primary/85 mt-4 max-w-2xl mx-auto">
            schedule. discord. fan art. merch train. all the chaos in one place.
          </p>
        </div>
      </section>

      {/* Schedule */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h2 className="heading text-4xl md:text-5xl text-white">STREAM SCHEDULE</h2>
          <a
            href="https://twitch.tv/officiallyskelly"
            target="_blank"
            rel="noreferrer"
            className="font-bebas text-xl text-electric-blue hover:text-electric-pink transition-colors"
          >
            SET A REMINDER →
          </a>
        </div>
        <SectionDivider />
        <div className="grid md:grid-cols-4 gap-4">
          {schedule.blocks.map((s) => (
            <StreamScheduleBlock key={s.day} {...s} tz={schedule.timezone_label} />
          ))}
        </div>
        <p className="text-text-muted text-sm mt-4">all times shown in {schedule.timezone_label}.</p>
      </section>

      {/* Discord */}
      <section className="bg-bg-secondary py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="heading text-4xl md:text-5xl text-white text-center">
            THE CHAOS CONTINUES IN DISCORD
          </h2>
          <SectionDivider />
          <DiscordWidget />
        </div>
      </section>

      {/* Fan art wall */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="heading text-4xl md:text-5xl text-white text-center">FAN ART WALL</h2>
        <p className="text-text-muted text-center mt-2">curated chaos. drop your art in discord — skelly might post it here.</p>
        <SectionDivider />

        {fanart.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {fanart.map((art) => (
              <FanArtTile key={art.slug} art={art} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-bg-card border border-purple-core/30 rounded-xl flex items-center justify-center"
              >
                <svg viewBox="0 0 64 64" className="w-12 h-12 text-purple-core opacity-40">
                  <circle cx="32" cy="28" r="20" fill="currentColor" />
                  <circle cx="24" cy="26" r="3" fill="#0D0814" />
                  <circle cx="40" cy="26" r="3" fill="#0D0814" />
                </svg>
              </div>
            ))}
          </div>
        )}

        <div className="bg-bg-card border border-purple-core/30 rounded-xl p-8 max-w-2xl mx-auto">
          <h3 className="heading text-2xl text-white">SUBMIT YOUR CHAOS</h3>
          <p className="text-text-muted text-sm mt-2">
            drop your art in <a href="https://discord.gg/zpWv2cXxB9" className="text-electric-blue hover:text-electric-pink underline">#fan-art on Discord</a>{" "}
            or tag <a href="https://twitter.com/itsmeskelly" className="text-electric-blue hover:text-electric-pink underline">@itsmeskelly</a>.
            skelly picks favorites and posts them here.
          </p>
          <FanArtForm />
        </div>
      </section>

      {/* Merch train */}
      <section id="merch-train" className="bg-bg-secondary py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="heading text-4xl md:text-5xl text-white">MERCH TRAIN — HOW IT WORKS</h2>
          <SectionDivider />
          <ol className="space-y-4">
            {MERCH_STEPS.map((s) => (
              <li key={s.n} className="flex items-start gap-5 bg-bg-card border border-purple-core/30 rounded-xl p-5">
                <span className="font-bebas text-4xl text-gold leading-none">{s.n}</span>
                <span className="text-text-primary">{s.text}</span>
              </li>
            ))}
          </ol>
          <div className="text-center mt-10">
            <GlowButton variant="gold" size="lg" href="https://twitch.tv/officiallyskelly" external>
              WATCH SKELLY LIVE →
            </GlowButton>
          </div>
        </div>
      </section>
    </>
  );
}
