import SocialIcon from "./SocialIcon";

export default function DiscordWidget() {
  const id = process.env.NEXT_PUBLIC_DISCORD_WIDGET_GUILD_ID;
  // Discord's widget iframe needs a numeric guild ID, not the invite slug.
  // Render iframe only when an ID is present (otherwise show a styled placeholder).
  if (id) {
    return (
      <div className="bg-bg-card border-2 border-[#5865F2]/60 rounded-2xl overflow-hidden">
        <iframe
          src={`https://discord.com/widget?id=${id}&theme=dark`}
          title="Skellywags Discord"
          className="w-full h-[420px] bg-bg-card"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    );
  }

  return (
    <div className="bg-bg-card border-2 border-[#5865F2]/60 rounded-2xl p-10 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-[#5865F2]/20 flex items-center justify-center">
        <SocialIcon k="discord" className="w-9 h-9 text-[#C7CCF8]" />
      </div>
      <h3 className="heading text-3xl text-white mt-5">SKELLYWAGS DISCORD</h3>
      <p className="text-text-primary/85 mt-2">
        the chaos continues nightly. raids, late-night vibes, the occasional good take.
      </p>
      <p className="text-text-muted text-xs mt-3">
        (live widget appears once Discord widget is enabled in server settings.)
      </p>
    </div>
  );
}
