import Image from "next/image";
import MemberTierCard from "@/components/MemberTierCard";
import GlowButton from "@/components/GlowButton";
import { getPerksTable, getSite, getTheme, getTiers } from "@/lib/content";

export const metadata = { title: "Skellywags Club" };

export default function MembersPage() {
  const tiers = getTiers();
  const site = getSite();
  const perks = getPerksTable();
  const theme = getTheme();
  return (
    <>
      {/* HERO */}
      <section className="relative bg-starfield-dense noise-overlay">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="reveal">
            <h1 className="heading text-6xl md:text-7xl text-white">{site.members_hero_heading}</h1>
            <p className="text-xl text-text-primary/85 mt-5 max-w-md">
              {site.members_hero_subtitle}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end reveal">
            <div className="relative animate-drift">
              <div className="absolute inset-0 bg-electric-pink/40 blur-3xl rounded-full" />
              <Image src={theme.avatar_url || "/avatar.png"} alt="Skelly" width={420} height={420} className="relative drop-shadow-[0_0_40px_rgba(155,95,192,0.7)]" unoptimized={theme.avatar_url?.startsWith("/uploads/")} />
            </div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.key} className="reveal">
              <MemberTierCard tier={t} />
            </div>
          ))}
        </div>
      </section>

      {/* TWITCH CALLOUT */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 pb-20">
        <div className="bg-bg-card border-2 border-[#9146FF] rounded-2xl p-8 md:p-10 reveal">
          <p className="font-bangers text-3xl text-[#C8A8FF]">{site.twitch_callout_heading}</p>
          <p className="text-text-primary/90 mt-3">{site.twitch_callout_body}</p>
          <div className="mt-6">
            <GlowButton variant="purple" href={site.twitch_callout_cta_href}>{site.twitch_callout_cta_label}</GlowButton>
          </div>
        </div>
      </section>

      {/* PERKS TABLE */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <h2 className="heading text-4xl text-white">{perks.heading}</h2>
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-text-muted font-bebas tracking-wider">
                <th className="py-3 pr-4">PERK</th>
                <th className="py-3 px-4 text-center">MATEYS</th>
                <th className="py-3 px-4 text-center">BOATSWAIN</th>
                <th className="py-3 px-4 text-center">FIRST MATE</th>
              </tr>
            </thead>
            <tbody>
              {perks.rows.map((r) => (
                <tr key={r.perk} className="border-t border-purple-core/20">
                  <td className="py-3 pr-4 text-text-primary">{r.perk}</td>
                  <td className="py-3 px-4 text-center">{r.matey ? "💀" : "—"}</td>
                  <td className="py-3 px-4 text-center">{r.boatswain ? "💀" : "—"}</td>
                  <td className="py-3 px-4 text-center">{r.first ? "💀" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-10">
          <GlowButton variant="gold" size="lg" href={site.youtube_membership_url}>
            {perks.cta_label}
          </GlowButton>
        </div>
      </section>
    </>
  );
}
