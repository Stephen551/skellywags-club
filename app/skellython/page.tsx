import Image from "next/image";
import type { Metadata } from "next";
import { fetchChannelStats } from "@/lib/youtube";
import { getSkellython } from "@/lib/content";
import { computeProgress, type SkellythonProgress } from "@/lib/skellython";
import { isEventActive } from "@/lib/skellython-date";
import SkellythonLadder from "@/components/SkellythonLadder";
import TwitchEmbed from "@/components/TwitchEmbed";
import SectionDivider from "@/components/SectionDivider";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Skellython",
  description:
    "SKELLYTHON subathon — live sub goals, chaos challenges, and a tattoo on the line.",
  openGraph: {
    title: "SKELLYTHON · subathon event",
    description: "live sub goals, chaos challenges, and a tattoo on the line.",
    images: [{ url: "/skellython-hero.webp" }],
  },
};

export default async function SkellythonPage() {
  const ev = getSkellython();

  if (!ev.enabled) {
    return (
      <section className="bg-starfield-dense min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="heading text-5xl text-white">no event right now</h1>
          <p className="text-text-muted mt-3">check back soon for the next bout of chaos.</p>
        </div>
      </section>
    );
  }

  const stats = await fetchChannelStats();
  const liveSubs = stats?.subscriberCount ? Number(stats.subscriberCount) : null;
  const progress = computeProgress(ev.goals, liveSubs, ev.baseline);
  const active = isEventActive(ev.start_date, ev.end_date);

  return (
    <>
      {/* HERO */}
      <section className="bg-starfield-dense noise-overlay relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute inset-0 bg-electric-pink/30 blur-3xl rounded-full" />
              <Image
                src="/skellython-hero.webp"
                alt={`${ev.name} event poster`}
                width={1000}
                height={1294}
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 384px, 80vw"
                className="relative w-full h-auto rounded-xl shadow-glow-purple-lg"
              />
            </div>
            <div>
              <p className="font-bangers text-electric-pink text-2xl">{ev.subtitle}</p>
              <h1 className="heading text-6xl md:text-7xl text-white mt-1">{ev.name}</h1>
              {ev.tagline && <p className="text-text-primary/90 text-lg mt-2">{ev.tagline}</p>}
              {ev.start_display && (
                <p className="font-bebas tracking-widest text-gold text-xl mt-3">{ev.start_display}</p>
              )}
              <div className="mt-6 bg-bg-card/70 border border-purple-core/30 rounded-xl p-5">
                <p className="text-text-muted font-bebas tracking-widest text-xs">LIVE YOUTUBE SUBS</p>
                <p className="heading text-5xl md:text-6xl text-white mt-1">
                  {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
                </p>
                <ProgressBar progress={progress} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE STREAM (during the event window) */}
      {active && ev.twitch_channel && (
        <section className="bg-bg-secondary py-12">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="heading text-4xl text-white text-center">SKELLY IS LIVE. WATCH THE TIMER</h2>
            <SectionDivider />
            <TwitchEmbed mode="channel" value={ev.twitch_channel} title="Skelly live on Twitch" />
          </div>
        </section>
      )}

      {/* TIMER RULES */}
      {ev.timer_rules.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <h2 className="heading text-4xl text-white text-center">THE TIMER KEEPS GOING</h2>
          <SectionDivider />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ev.timer_rules.map((r, i) => (
              <div key={i} className="bg-bg-card border border-purple-core/30 rounded-xl p-5 text-center">
                <p className="heading text-3xl text-gold">{r.amount}</p>
                <p className="text-text-muted text-sm mt-1">{r.per}</p>
              </div>
            ))}
          </div>
          {ev.spicy_cadence && (
            <p className="text-center font-bangers text-electric-pink text-2xl mt-6">{ev.spicy_cadence}</p>
          )}
        </section>
      )}

      {/* GOAL LADDER */}
      <section className="bg-bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="heading text-5xl text-white text-center">SUB GOALS &amp; CHALLENGES</h2>
          <SectionDivider />
          <SkellythonLadder goals={ev.goals} liveSubs={liveSubs} baseline={ev.baseline} />
        </div>
      </section>

      {/* STRETCH TEASER */}
      {ev.stretch_teaser && (
        <section className="max-w-4xl mx-auto px-6 lg:px-8 py-14 text-center">
          <div className="border-2 border-dashed border-electric-pink/50 rounded-xl p-8">
            <p className="font-bangers text-electric-pink text-3xl">WARNING</p>
            <p className="heading text-3xl md:text-4xl text-white mt-2">{ev.stretch_teaser}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-starfield py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="heading text-4xl text-white">PUSH THE COUNTER</h2>
          <p className="text-text-muted mt-2">every sub adds time and pushes the next dare closer.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="https://www.youtube.com/@officiallyskelly?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
              className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-6 py-3 hover:bg-gold-light hover:shadow-glow-gold focus-visible:shadow-glow-gold focus-visible:outline-none transition-all"
            >
              SUBSCRIBE ON YOUTUBE →
            </a>
            <a
              href={`https://twitch.tv/${ev.twitch_channel}`}
              target="_blank"
              rel="noreferrer"
              className="font-bebas tracking-wide uppercase border-2 border-purple-core text-white rounded-md px-6 py-3 hover:bg-purple-core/20 hover:shadow-glow-purple focus-visible:shadow-glow-purple focus-visible:outline-none transition-all"
            >
              WATCH ON TWITCH →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ProgressBar({ progress }: { progress: SkellythonProgress }) {
  const { nextGoal, pct, remaining, allReached } = progress;
  return (
    <div className="mt-3">
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          allReached
            ? "All goals reached"
            : nextGoal
            ? `${Math.round(pct)} percent toward ${nextGoal.target} subscribers`
            : "Progress"
        }
        className="h-3 bg-bg-primary rounded-full overflow-hidden border border-purple-core/30"
      >
        <div
          className="h-full bg-gradient-to-r from-electric-pink via-purple-light to-electric-blue transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-text-primary/90 text-sm mt-2">
        {allReached ? (
          "every goal smashed. absolute chaos."
        ) : nextGoal && remaining != null ? (
          <>
            {remaining.toLocaleString("en-US")} subs to go until{" "}
            <span className="text-electric-blue">{nextGoal.dare}</span>
          </>
        ) : nextGoal ? (
          <>
            next up at {nextGoal.target.toLocaleString("en-US")}:{" "}
            <span className="text-electric-blue">{nextGoal.dare}</span>
          </>
        ) : (
          "—"
        )}
      </p>
    </div>
  );
}
