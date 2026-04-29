import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/constants";
import SocialIcon from "@/components/SocialIcon";
import SectionDivider from "@/components/SectionDivider";
import { fetchChannelStats, formatCount } from "@/lib/youtube";
import { getAbout, getStats } from "@/lib/content";

export const revalidate = 3600;
export const metadata = { title: "The Lore" };

export default async function AboutPage() {
  const stats = await fetchChannelStats();
  const about = getAbout();
  const cms = getStats();

  return (
    <>
      <section className="bg-starfield-dense noise-overlay relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <h1 className="heading text-6xl md:text-8xl text-white">{about.title}</h1>
          <div className="mt-10 flex justify-center reveal">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-core blur-3xl opacity-50 rounded-full" />
              <Image
                src="/avatar.png"
                alt="Skelly"
                width={420}
                height={420}
                className="relative drop-shadow-[0_0_40px_rgba(155,95,192,0.7)]"
              />
            </div>
          </div>
          <div
            className="mt-10 text-left prose-skelly reveal"
            dangerouslySetInnerHTML={{ __html: about.html }}
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="heading text-5xl text-white text-center">FIND SKELLY EVERYWHERE</h2>
        <SectionDivider />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group bg-bg-card border border-purple-core/30 rounded-xl p-6 flex items-center gap-4 lift hover:border-electric-blue hover:shadow-glow-blue"
            >
              <SocialIcon
                k={s.key as any}
                className="w-9 h-9 text-text-primary group-hover:text-electric-blue transition-colors"
              />
              <div>
                <p className="heading text-xl text-white">{s.label}</p>
                <p className="text-text-muted text-sm">{s.handle}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="heading text-5xl text-white text-center">THE NUMBERS DON'T LIE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <Stat label="SUBSCRIBERS" value={formatCount(stats?.subscriberCount)} />
            <Stat
              label="SKELLYWAGS"
              value={cms.skellywags_count || "—"}
              hint={cms.skellywags_count ? "channel members" : "(soon)"}
            />
            <Stat label="STREAMS SURVIVED" value={cms.streams_survived || "∞"} />
            <Stat label="CHAOS LEVEL" value="MAX" bar />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  bar,
}: {
  label: string;
  value: string;
  hint?: string;
  bar?: boolean;
}) {
  return (
    <div className="bg-bg-card border border-purple-core/30 rounded-xl p-6 text-center">
      <p className="text-text-muted font-bebas tracking-widest text-sm">{label}</p>
      <p className="heading text-5xl text-gold mt-2">{value}</p>
      {hint && <p className="text-text-muted text-xs mt-1">{hint}</p>}
      {bar && (
        <div className="mt-3 h-2 bg-bg-primary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-electric-pink via-purple-light to-electric-blue animate-glow-pulse" />
        </div>
      )}
    </div>
  );
}
