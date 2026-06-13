import Image from "next/image";
import type { Metadata } from "next";
import { fetchChannelStats } from "@/lib/youtube";
import { getSkellython } from "@/lib/content";
import { computeProgress, type SkellythonProgress } from "@/lib/skellython";
import { isEventActive, isBeforeEvent, isAfterEvent } from "@/lib/skellython-date";
import SkellythonLadder from "@/components/SkellythonLadder";
import TwitchEmbed from "@/components/TwitchEmbed";
import SectionDivider from "@/components/SectionDivider";

export const revalidate = 3600;

const META_DESCRIPTION =
  "SKELLYTHON: a week-long subathon where every YouTube sub unlocks the next dare, from a sour-candy challenge to a live tattoo at 3,000. june 22 to 28.";

export const metadata: Metadata = {
  title: "Skellython",
  description: META_DESCRIPTION,
  openGraph: {
    title: "SKELLYTHON · subathon event",
    description: META_DESCRIPTION,
    images: [{ url: "/og-v4.jpg", width: 1200, height: 630, alt: "SKELLYTHON · subathon event" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKELLYTHON · subathon event",
    description: META_DESCRIPTION,
    images: ["/og-v4.jpg"],
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
  const before = isBeforeEvent(ev.start_date);
  const ended = isAfterEvent(ev.end_date);
  const finalGoal = progress.sorted.length ? progress.sorted[progress.sorted.length - 1] : null;

  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://skellywags.club";
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.name,
    description: META_DESCRIPTION,
    startDate: `${ev.start_date}T16:30:00-05:00`,
    endDate: `${ev.end_date}T23:59:00-05:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `https://twitch.tv/${ev.twitch_channel}`,
    },
    image: [`${SITE}/skellython-hero.webp`],
    organizer: {
      "@type": "Person",
      name: "OfficiallySkelly",
      url: "https://www.youtube.com/@officiallyskelly",
    },
    url: `${SITE}/skellython`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      {/* HERO — one broadcast console framing both columns */}
      <section className="bg-starfield-dense noise-overlay relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <div className="rounded-2xl border border-purple-core/40 bg-bg-card/40 shadow-glow-purple-lg p-5 md:p-8 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-center">
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
                  className="relative w-full h-auto rounded-xl border border-purple-core/40 shadow-glow-purple-lg"
                />
              </div>
              <div>
                <p className="font-bangers text-electric-pink text-2xl">{ev.subtitle}</p>
                <h1 className="heading text-6xl md:text-7xl text-white mt-1">{ev.name}</h1>
                {ev.tagline && <p className="text-text-primary/90 text-lg mt-2">{ev.tagline}</p>}
                {ev.start_display && (
                  <p className="font-bebas tracking-widest text-gold text-xl mt-3">{ev.start_display}</p>
                )}
                <HeroStat
                  liveSubs={liveSubs}
                  progress={progress}
                  before={before}
                  ended={ended}
                  startDisplay={ev.start_display}
                  finalTarget={finalGoal?.target ?? null}
                />
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

      {/* STRETCH TEASER — redacted dossier */}
      {ev.stretch_teaser && (
        <section className="max-w-4xl mx-auto px-6 lg:px-8 py-14">
          <div className="relative overflow-hidden rounded-xl border border-electric-pink/40 bg-bg-card shadow-glow-pink">
            <div className="flex items-center justify-between gap-3 border-b border-electric-pink/30 bg-bg-primary/60 px-5 py-3">
              <p className="font-bebas tracking-[0.3em] uppercase text-electric-pink text-sm">classified</p>
              <span className="rotate-[-4deg] rounded border-2 border-electric-pink/70 px-2 py-0.5 font-bebas tracking-widest uppercase text-xs text-electric-pink">
                redacted
              </span>
            </div>
            <ul className="divide-y divide-purple-core/20">
              {["2,900", "2,950", "3,000+"].map((tier) => (
                <li key={tier} className="flex items-center gap-4 px-5 py-4">
                  <span className="shrink-0 grid place-items-center rounded-lg bg-bg-primary font-bebas text-xl md:text-2xl text-text-muted w-20 h-12">
                    {tier}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-6 flex-1 rounded bg-bg-primary blur-[3px] [background-image:repeating-linear-gradient(90deg,#0D0814_0,#0D0814_22px,#221540_22px,#221540_30px)]"
                  />
                </li>
              ))}
            </ul>
            <div className="border-t border-electric-pink/30 px-5 py-4 text-center">
              <p className="heading text-2xl md:text-3xl text-white">{ev.stretch_teaser}</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-starfield py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="heading text-4xl text-white">{ended ? "WATCH THE CLIPS" : "PUSH THE COUNTER"}</h2>
          <p className="text-text-muted mt-2">
            {ended
              ? "every dare that fell is up above, clips and all. the void keeps the receipts."
              : "every sub adds time and pushes the next dare closer."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {ended ? (
              <>
                <a
                  href={`https://twitch.tv/${ev.twitch_channel}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-6 py-3 hover:bg-gold-light hover:shadow-glow-gold focus-visible:shadow-glow-gold focus-visible:outline-none transition-all"
                >
                  WATCH THE VODS →
                </a>
                <a
                  href="https://www.youtube.com/@officiallyskelly?sub_confirmation=1"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bebas tracking-wide uppercase border-2 border-purple-core text-white rounded-md px-6 py-3 hover:bg-purple-core/20 hover:shadow-glow-purple focus-visible:shadow-glow-purple focus-visible:outline-none transition-all"
                >
                  SUB FOR THE NEXT ONE →
                </a>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({
  liveSubs,
  progress,
  before,
  ended,
  startDisplay,
  finalTarget,
}: {
  liveSubs: number | null;
  progress: SkellythonProgress;
  before: boolean;
  ended: boolean;
  startDisplay: string;
  finalTarget: number | null;
}) {
  // ENDED: recap the final count, no live race framing.
  if (ended) {
    return (
      <div className="mt-6 bg-bg-card/70 border border-purple-core/40 rounded-xl p-5 shadow-glow-purple">
        <p className="text-text-muted font-bebas tracking-widest text-xs">THAT WAS SKELLYTHON</p>
        <p className="heading text-5xl md:text-6xl text-white mt-1">
          {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
        </p>
        <p className="text-text-primary/90 text-sm mt-3">
          every dare that fell is below, clips and all.
        </p>
      </div>
    );
  }

  // BEFORE: the starting line, not a live race.
  if (before) {
    return (
      <div className="mt-6 bg-bg-card/70 border border-purple-core/40 rounded-xl p-5 shadow-glow-purple">
        <p className="text-text-muted font-bebas tracking-widest text-xs">GOES LIVE</p>
        <p className="font-bebas tracking-widest text-gold text-2xl mt-1">{startDisplay}</p>
        <div className="mt-4 border-t border-purple-core/20 pt-4">
          <p className="text-text-muted font-bebas tracking-widest text-xs">STARTING AT</p>
          <p className="heading text-4xl md:text-5xl text-white mt-1">
            {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
          </p>
          {liveSubs == null && (
            <p className="text-text-muted text-xs mt-1">sub count syncs when we go live</p>
          )}
        </div>
        <StartingBar progress={progress} finalTarget={finalTarget} />
      </div>
    );
  }

  // ACTIVE: live counter + race framing.
  return (
    <div className="mt-6 bg-bg-card/70 border border-purple-core/40 rounded-xl p-5 shadow-glow-purple">
      <p className="text-text-muted font-bebas tracking-widest text-xs">LIVE YOUTUBE SUBS</p>
      <p className="heading text-5xl md:text-6xl text-white mt-1">
        {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
      </p>
      {liveSubs == null && (
        <p className="text-text-muted text-xs mt-1">sub count syncs when we go live</p>
      )}
      <ProgressBar progress={progress} />
    </div>
  );
}

/** Pre-event bar: frames the climb toward the full run, not a live "subs to go" race. */
function StartingBar({
  progress,
  finalTarget,
}: {
  progress: SkellythonProgress;
  finalTarget: number | null;
}) {
  const { nextGoal, pct } = progress;
  return (
    <div className="mt-3">
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          finalTarget
            ? `Starting line, climbing toward ${finalTarget} subscribers`
            : "Starting line"
        }
        className="h-3 bg-bg-primary rounded-full overflow-hidden border border-purple-core/30"
      >
        <div
          className="h-full bg-gradient-to-r from-electric-pink via-purple-light to-electric-blue transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-text-primary/90 text-sm mt-2">
        {nextGoal && finalTarget ? (
          <>
            first dare unlocks at {nextGoal.target.toLocaleString("en-US")}. help push it to{" "}
            <span className="text-electric-blue">{finalTarget.toLocaleString("en-US")}</span> when we go
            live.
          </>
        ) : (
          "the climb starts june 22."
        )}
      </p>
    </div>
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
