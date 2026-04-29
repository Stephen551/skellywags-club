import Image from "next/image";
import MemberTierCard from "@/components/MemberTierCard";
import GlowButton from "@/components/GlowButton";
import { TIERS, YOUTUBE_MEMBERSHIP_URL } from "@/lib/constants";

export const metadata = { title: "Skellywags Club" };

const PERK_ROWS = [
  { perk: "Loyalty badges + custom emoji", matey: true, boatswain: true, first: true },
  { perk: "Members-only chat rooms", matey: true, boatswain: true, first: true },
  { perk: "Member shout-outs", matey: true, boatswain: true, first: true },
  { perk: "Early access to new videos", matey: true, boatswain: true, first: true },
  { perk: "Members-only videos", matey: false, boatswain: true, first: true },
  { perk: "Members-only live streams", matey: false, boatswain: true, first: true },
  { perk: "Skelly's Community Cluster Server (Discord)", matey: false, boatswain: false, first: true },
];

export default function MembersPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-starfield-dense noise-overlay">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="reveal">
            <h1 className="heading text-6xl md:text-7xl text-white">JOIN THE SKELLYWAG CREW</h1>
            <p className="text-xl text-text-primary/85 mt-5 max-w-md">
              exclusive videos. members-only streams. discord chaos. pick your chaos level.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end reveal">
            <div className="relative animate-drift">
              <div className="absolute inset-0 bg-electric-pink/40 blur-3xl rounded-full" />
              <Image src="/avatar.jpg" alt="Skelly" width={420} height={420} className="relative rounded-2xl border-2 border-white shadow-glow-purple-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((t) => (
            <div key={t.key} className="reveal">
              <MemberTierCard tier={t} />
            </div>
          ))}
        </div>
      </section>

      {/* TWITCH CALLOUT */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 pb-20">
        <div className="bg-bg-card border-2 border-[#9146FF] rounded-2xl p-8 md:p-10 reveal">
          <p className="font-bangers text-3xl text-[#C8A8FF]">ALREADY A TWITCH SUB? 👀</p>
          <p className="text-text-primary/90 mt-3">
            Link your Twitch account at checkout on the merch store for an exclusive sub discount.
            Skelly rewards loyalty.
          </p>
          <div className="mt-6">
            <GlowButton variant="purple" href="/shop">SHOP THE STORE →</GlowButton>
          </div>
        </div>
      </section>

      {/* PERKS TABLE */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <h2 className="heading text-4xl text-white">PERKS BY TIER</h2>
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
              {PERK_ROWS.map((r) => (
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
          <GlowButton variant="gold" size="lg" href={YOUTUBE_MEMBERSHIP_URL}>
            JOIN ON YOUTUBE →
          </GlowButton>
        </div>
      </section>
    </>
  );
}
