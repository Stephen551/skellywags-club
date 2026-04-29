import GlowButton from "./GlowButton";
import { YOUTUBE_MEMBERSHIP_URL } from "@/lib/constants";

type Tier = {
  name: string;
  price: string;
  perks: readonly string[];
  variant: "ghost" | "purple" | "gold";
  cta: string;
  featured?: boolean;
};

export default function MemberTierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl bg-bg-card p-7 lift transition-all
        ${tier.featured
          ? "border-2 border-gold shadow-glow-gold"
          : "border border-purple-core/30 hover:border-purple-light"}`}
    >
      {tier.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-bg-primary text-xs font-bangers px-3 py-1 rounded-full tracking-wider">
          MOST CHAOS
        </span>
      )}
      <h3 className="heading text-3xl text-white">{tier.name}</h3>
      <p className="font-bebas text-5xl text-gold mt-2">
        {tier.price}
        <span className="text-text-muted text-lg align-middle">/mo</span>
      </p>
      <ul className="mt-6 space-y-3 flex-1">
        {tier.perks.map((p) => (
          <li key={p} className="flex gap-3 text-text-primary/90">
            <SkullBullet />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <GlowButton variant={tier.variant} size="md" href={YOUTUBE_MEMBERSHIP_URL} className="mt-7">
        {tier.cta}
      </GlowButton>
    </div>
  );
}

function SkullBullet() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mt-0.5 text-electric-pink shrink-0" fill="currentColor">
      <path d="M12 2c-5 0-9 4-9 9 0 3 1.5 5 3 6v3a1 1 0 0 0 1 1h2v-2h2v2h2v-2h2v2h2a1 1 0 0 0 1-1v-3c1.5-1 3-3 3-6 0-5-4-9-9-9Zm-3 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
    </svg>
  );
}
