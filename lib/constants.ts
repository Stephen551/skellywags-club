export const SOCIAL_LINKS = [
  { key: "youtube", label: "YouTube", handle: "@officiallyskelly", url: "https://www.youtube.com/@officiallyskelly", color: "#FF0033" },
  { key: "twitch", label: "Twitch", handle: "officiallyskelly", url: "https://twitch.tv/officiallyskelly", color: "#9146FF" },
  { key: "discord", label: "Discord", handle: "skellywags", url: "https://discord.gg/zpWv2cXxB9", color: "#5865F2" },
  { key: "instagram", label: "Instagram", handle: "@officiallyskelly", url: "https://instagram.com/officiallyskelly", color: "#E4405F" },
  { key: "x", label: "X", handle: "@itsmeskelly", url: "https://twitter.com/itsmeskelly", color: "#FFFFFF" },
  { key: "tiktok", label: "TikTok", handle: "@officiallyskelly", url: "https://tiktok.com/@officiallyskelly", color: "#FF0050" },
] as const;

export const STREAM_SCHEDULE = [
  { day: "TUESDAY", start: "8:00 PM", end: "12:00 AM", tz: "EST" },
  { day: "WEDNESDAY", start: "4:30 PM", end: "10:30 PM", tz: "EST" },
  { day: "FRIDAY", start: "12:00 PM", end: "3:00 PM", tz: "EST" },
  { day: "SUNDAY", start: "12:00 PM", end: "3:00 PM", tz: "EST" },
] as const;

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/videos", label: "Videos" },
  { href: "/members", label: "Members" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
] as const;

export const TIERS = [
  {
    key: "matey",
    name: "Skellywag Mateys",
    price: "$1.99",
    perks: [
      "Loyalty badges",
      "Custom emoji",
      "Member shout-outs",
      "Members-only chat rooms",
      "Early access to new videos",
    ],
    variant: "ghost" as const,
    cta: "JOIN FOR $1.99",
  },
  {
    key: "boatswain",
    name: "Skellywag Boatswain",
    price: "$4.99",
    perks: [
      "Members-only videos",
      "Members-only live streams",
      "All Mateys perks",
    ],
    variant: "purple" as const,
    cta: "JOIN FOR $4.99",
  },
  {
    key: "first-mate",
    name: "Skellywag First Mate",
    price: "$9.99",
    perks: [
      "Skelly's Community Cluster Server (Discord)",
      "All Boatswain perks",
      "All Mateys perks",
    ],
    variant: "gold" as const,
    cta: "JOIN FOR $9.99",
    featured: true,
  },
] as const;

export const YOUTUBE_MEMBERSHIP_URL =
  "https://www.youtube.com/channel/officiallyskelly/join";

export const FOURTHWALL_SHOP_URL =
  process.env.NEXT_PUBLIC_FOURTHWALL_SHOP_URL || "";
