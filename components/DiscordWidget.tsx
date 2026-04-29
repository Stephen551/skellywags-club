import Image from "next/image";
import SocialIcon from "./SocialIcon";
import GlowButton from "./GlowButton";
import { fetchDiscordStats } from "@/lib/discord";

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default async function DiscordWidget() {
  const stats = await fetchDiscordStats();
  const members = stats?.memberCount ?? 0;
  const online = stats?.onlineCount ?? 0;
  const inviteUrl = stats?.inviteUrl ?? "https://discord.gg/zpWv2cXxB9";
  const guildName = stats?.guildName ?? "SKELLYWAGS DISCORD";

  return (
    <div className="relative bg-bg-card border-2 border-[#5865F2]/60 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-starfield opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#5865F2]/30 blur-3xl pointer-events-none" />

      <div className="relative p-8 md:p-10 grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
        <div className="relative w-24 h-24 mx-auto md:mx-0 rounded-2xl overflow-hidden border-2 border-white shadow-glow-purple bg-bg-secondary flex items-center justify-center">
          {stats?.iconUrl ? (
            <Image
              src={stats.iconUrl}
              alt={`${guildName} icon`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <SocialIcon k="discord" className="w-12 h-12 text-[#C7CCF8]" />
          )}
        </div>

        <div className="text-center md:text-left">
          <p className="font-bangers text-electric-pink tracking-widest text-lg">LIVE FROM</p>
          <h3 className="heading text-3xl md:text-4xl text-white mt-1">{guildName}</h3>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 justify-center md:justify-start">
            <Stat label="MEMBERS" value={formatCount(members)} />
            <Stat label="ONLINE NOW" value={formatCount(online)} pulse />
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <GlowButton variant="purple" size="lg" href={inviteUrl} external>
            JOIN THE CHAOS →
          </GlowButton>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, pulse }: { label: string; value: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {pulse && (
        <span className="relative flex h-3 w-3" aria-hidden>
          <span className="absolute inline-flex h-full w-full rounded-full bg-electric-blue opacity-60 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-electric-blue" />
        </span>
      )}
      <div>
        <p className="font-bebas text-3xl text-white leading-none">{value}</p>
        <p className="font-bebas text-text-muted tracking-widest text-xs mt-1">{label}</p>
      </div>
    </div>
  );
}
