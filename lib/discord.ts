export type DiscordInviteStats = {
  guildName: string;
  iconUrl: string | null;
  memberCount: number;
  onlineCount: number;
  inviteUrl: string;
};

const INVITE_CODE = "zpWv2cXxB9";

export async function fetchDiscordStats(): Promise<DiscordInviteStats | null> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/invites/${INVITE_CODE}?with_counts=true`,
      { next: { revalidate: 300 }, headers: { "User-Agent": "skellywags.club/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const guild = data.guild;
    if (!guild) return null;
    const iconUrl = guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
      : null;
    return {
      guildName: guild.name,
      iconUrl,
      memberCount: data.approximate_member_count ?? 0,
      onlineCount: data.approximate_presence_count ?? 0,
      inviteUrl: `https://discord.gg/${INVITE_CODE}`,
    };
  } catch {
    return null;
  }
}
