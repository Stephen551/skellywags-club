import Image from "next/image";
import Link from "next/link";
import GlowButton from "@/components/GlowButton";
import SocialIcon from "@/components/SocialIcon";
import SectionDivider from "@/components/SectionDivider";
import EmailCapture from "@/components/EmailCapture";
import StreamScheduleBlock from "@/components/StreamScheduleBlock";
import MemberTierCard from "@/components/MemberTierCard";
import VideoCard from "@/components/VideoCard";
import { SOCIAL_LINKS } from "@/lib/constants";
import { getSchedule, getTiers } from "@/lib/content";
import { fetchLatestVideos } from "@/lib/youtube";

export const revalidate = 3600;

export default async function HomePage() {
  const videos = await fetchLatestVideos(3);
  const schedule = getSchedule();
  const tiers = getTiers();

  return (
    <>
      {/* HERO */}
      <section className="relative bg-starfield-dense noise-overlay overflow-hidden">
        <LightningCross />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 min-h-[88vh] flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-16">
            <div className="reveal">
              <p className="font-bangers text-electric-pink text-2xl tracking-widest">@OFFICIALLYSKELLY</p>
              <h1 className="heading text-7xl md:text-8xl xl:text-9xl text-white drop-shadow-[0_0_30px_rgba(155,95,192,0.6)] mt-4">
                OFFICIALLY<br />SKELLY
              </h1>
              <p className="font-nunito italic text-xl md:text-2xl text-text-primary/90 mt-6 max-w-md">
                chaos, bad decisions, and surviving barely.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <GlowButton variant="gold" size="lg" href="/shop">
                  GET THE DRIP →
                </GlowButton>
                <GlowButton variant="purple" size="lg" href="/members">
                  JOIN THE SKELLYWAGS →
                </GlowButton>
              </div>
              <div className="flex items-center gap-5 mt-10">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="text-text-primary hover:text-electric-blue transition-colors"
                  >
                    <SocialIcon k={s.key as any} className="w-7 h-7" />
                  </a>
                ))}
              </div>
            </div>

            <div className="relative reveal flex justify-center lg:justify-end">
              <div className="relative animate-drift">
                <div className="absolute inset-0 bg-purple-core blur-3xl opacity-50 rounded-full scale-90" />
                <Image
                  src="/avatar.jpg"
                  alt="Skelly"
                  width={520}
                  height={520}
                  priority
                  className="relative rounded-2xl border-2 border-white shadow-glow-purple-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DROP BANNER */}
      <section className="relative bg-bg-secondary border-y border-purple-core/30 py-14">
        <div className="max-w-4xl mx-auto px-6 text-center reveal">
          <p className="font-bangers text-electric-pink text-3xl md:text-4xl tracking-widest">
            ⚠ NEW DROP INCOMING ⚠
          </p>
          <p className="text-text-primary/85 mt-3 mb-6">
            drop your email to get notified when the chaos goes live.
          </p>
          <div className="max-w-md mx-auto">
            <EmailCapture cta="NOTIFY ME" />
          </div>
        </div>
      </section>

      {/* RECENT VIDEOS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="reveal">
          <h2 className="heading text-5xl md:text-6xl text-white">
            FRESH CONTENT FROM THE VOID
          </h2>
          <p className="text-text-muted mt-3">latest uploads, freshly recovered from the chaos.</p>
        </div>
        <SectionDivider />
        {videos.length === 0 ? (
          <div className="bg-bg-card border border-purple-core/30 rounded-xl p-10 text-center">
            <p className="font-bangers text-2xl text-electric-pink">YouTube key not set yet.</p>
            <p className="text-text-muted mt-2">add YOUTUBE_API_KEY + YOUTUBE_CHANNEL_ID to .env.local to wire this up.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((v) => (
              <div key={v.id} className="reveal">
                <VideoCard video={v} />
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <GlowButton variant="ghost" href="/videos">WATCH MORE CHAOS →</GlowButton>
        </div>
      </section>

      {/* SKELLYWAGS CLUB PITCH */}
      <section className="bg-bg-secondary py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center reveal">
            <h2 className="heading text-5xl md:text-6xl text-white">THINK YOU CAN HANDLE IT?</h2>
            <p className="text-text-primary/85 max-w-2xl mx-auto mt-4">
              Join the Skellywags. Get exclusive videos, members-only streams, Discord access, and the eternal bragging rights of surviving Skelly's chaos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {tiers.map((t) => (
              <div key={t.key} className="reveal">
                <MemberTierCard tier={t} />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <GlowButton variant="gold" size="lg" href="/members">BECOME A SKELLYWAG →</GlowButton>
          </div>
        </div>
      </section>

      {/* STREAM SCHEDULE STRIP */}
      <section className="bg-bg-primary py-16 border-y border-purple-core/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 reveal">
            <h2 className="heading text-4xl md:text-5xl text-white">CATCH SKELLY LIVE</h2>
            <a
              href="https://twitch.tv/officiallyskelly"
              target="_blank"
              rel="noreferrer"
              className="font-bebas text-xl tracking-wide text-electric-blue hover:text-electric-pink transition-colors"
            >
              WATCH LIVE →
            </a>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mt-8">
            {schedule.blocks.map((s) => (
              <div key={s.day} className="reveal">
                <StreamScheduleBlock {...s} tz={schedule.timezone_label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MERCH TRAIN */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-bg-card border border-electric-pink/40 rounded-xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 reveal">
          <p className="font-bangers text-2xl text-text-primary">
            🔥 GIFT MERCH TO TWITCH CHAT WHILE SKELLY IS LIVE
          </p>
          <Link
            href="/community#merch-train"
            className="font-bebas text-xl text-electric-pink hover:text-electric-blue transition-colors"
          >
            HOW IT WORKS →
          </Link>
        </div>
      </section>
    </>
  );
}

function LightningCross() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none lightning-bolt opacity-50"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      <path
        d="M-20 200 L 350 280 L 280 360 L 700 420 L 620 500 L 1100 580 L 1240 640"
        stroke="rgba(232,213,255,0.55)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M100 700 L 320 580 L 260 540 L 580 420 L 520 380 L 900 240 L 1100 160"
        stroke="rgba(255,79,203,0.4)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
