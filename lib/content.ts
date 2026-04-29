import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const ROOT = path.join(process.cwd(), "content");

function toDateString(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? "" : v.toISOString().slice(0, 10);
  }
  return String(v);
}

export type Tier = {
  key: string;
  name: string;
  price: string;
  perks: string[];
  variant: "ghost" | "purple" | "gold";
  cta: string;
  featured?: boolean;
};

export type ScheduleBlock = { day: string; start: string; end: string };
export type Schedule = { timezone_label: string; blocks: ScheduleBlock[] };

export type AboutContent = { title: string; html: string };

export type LegalContent = { title: string; lastUpdated: string; html: string };

export type FaqItem = { question: string; answer: string };
export type FaqContent = { intro: string; items: FaqItem[] };

export type Stats = {
  skellywags_count: string;
  streams_survived: string;
};

export type SiteSettings = {
  handle: string;
  channel_name: string;
  tagline: string;
  hero_cta_primary_label: string;
  hero_cta_primary_href: string;
  hero_cta_secondary_label: string;
  hero_cta_secondary_href: string;
  drop_banner_enabled: boolean;
  drop_banner_title: string;
  drop_banner_subtitle: string;
  fresh_content_heading: string;
  fresh_content_subtitle: string;
  club_pitch_heading: string;
  club_pitch_body: string;
  club_pitch_cta_label: string;
  live_strip_heading: string;
  merch_train_callout: string;
  merch_train_link_label: string;
  members_hero_heading: string;
  members_hero_subtitle: string;
  twitch_callout_heading: string;
  twitch_callout_body: string;
  twitch_callout_cta_label: string;
  twitch_callout_cta_href: string;
  stats_heading: string;
  youtube_membership_url: string;
  twitch_url: string;
  discord_invite_url: string;
};

export type SocialLink = {
  key: string;
  label: string;
  handle: string;
  url: string;
};

export type MerchTrainStep = { n: string; text: string };
export type MerchTrain = {
  heading: string;
  intro: string;
  steps: MerchTrainStep[];
  cta_label: string;
};

export type PerksRow = { perk: string; matey: boolean; boatswain: boolean; first: boolean };
export type PerksTable = { heading: string; rows: PerksRow[]; cta_label: string };

export type FanArt = {
  slug: string;
  artist: string;
  social_url?: string;
  image: string;
  date: string;
  caption?: string;
};

export function getTiers(): Tier[] {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "tiers.json"), "utf8"));
  return raw.tiers as Tier[];
}

export function getSchedule(): Schedule {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "schedule.json"), "utf8"));
}

export function getAbout(): AboutContent {
  const raw = fs.readFileSync(path.join(ROOT, "about.md"), "utf8");
  const { data, content } = matter(raw);
  const html = remark().use(remarkHtml).processSync(content).toString();
  return { title: data.title ?? "WHO IS SKELLY?", html };
}

function loadLegal(filename: string, fallbackTitle: string): LegalContent {
  const file = path.join(ROOT, filename);
  if (!fs.existsSync(file)) {
    return { title: fallbackTitle, lastUpdated: "", html: "" };
  }
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const html = remark().use(remarkHtml).processSync(content).toString();
  return {
    title: data.title ?? fallbackTitle,
    lastUpdated: toDateString(data.last_updated),
    html,
  };
}

export function getPrivacy(): LegalContent {
  return loadLegal("privacy.md", "PRIVACY POLICY");
}

export function getTerms(): LegalContent {
  return loadLegal("terms.md", "TERMS");
}

export function getShippingReturns(): LegalContent {
  return loadLegal("shipping-returns.md", "SHIPPING & RETURNS");
}

export function getFaq(): FaqContent {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "faq.json"), "utf8"));
    return { intro: raw.intro ?? "", items: raw.items ?? [] };
  } catch {
    return { intro: "", items: [] };
  }
}

export function getStats(): Stats {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "stats.json"), "utf8"));
  } catch {
    return { skellywags_count: "", streams_survived: "" };
  }
}

const SITE_DEFAULTS: SiteSettings = {
  handle: "@OFFICIALLYSKELLY",
  channel_name: "OFFICIALLYSKELLY",
  tagline: "chaos, bad decisions, and surviving barely.",
  hero_cta_primary_label: "GET THE DRIP →",
  hero_cta_primary_href: "/shop",
  hero_cta_secondary_label: "JOIN THE SKELLYWAGS →",
  hero_cta_secondary_href: "/members",
  drop_banner_enabled: true,
  drop_banner_title: "⚠ NEW DROP INCOMING ⚠",
  drop_banner_subtitle: "drop your email to get notified when the chaos goes live.",
  fresh_content_heading: "FRESH CONTENT FROM THE VOID",
  fresh_content_subtitle: "latest uploads, freshly recovered from the chaos.",
  club_pitch_heading: "THINK YOU CAN HANDLE IT?",
  club_pitch_body:
    "Join the Skellywags. Get exclusive videos, members-only streams, Discord access, and the eternal bragging rights of surviving Skelly's chaos.",
  club_pitch_cta_label: "BECOME A SKELLYWAG →",
  live_strip_heading: "CATCH SKELLY LIVE",
  merch_train_callout: "🔥 GIFT MERCH TO TWITCH CHAT WHILE SKELLY IS LIVE",
  merch_train_link_label: "HOW IT WORKS →",
  members_hero_heading: "JOIN THE SKELLYWAG CREW",
  members_hero_subtitle: "exclusive videos. members-only streams. discord chaos. pick your chaos level.",
  twitch_callout_heading: "ALREADY A TWITCH SUB? 👀",
  twitch_callout_body:
    "Link your Twitch account at checkout on the merch store for an exclusive sub discount. Skelly rewards loyalty.",
  twitch_callout_cta_label: "SHOP THE STORE →",
  twitch_callout_cta_href: "/shop",
  stats_heading: "THE NUMBERS DON'T LIE",
  youtube_membership_url: "https://www.youtube.com/@officiallyskelly/join",
  twitch_url: "https://twitch.tv/officiallyskelly",
  discord_invite_url: "https://discord.gg/zpWv2cXxB9",
};

export function getSite(): SiteSettings {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
    return { ...SITE_DEFAULTS, ...raw };
  } catch {
    return SITE_DEFAULTS;
  }
}

export function getSocial(): SocialLink[] {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "social.json"), "utf8"));
    return Array.isArray(raw.links) ? raw.links : [];
  } catch {
    return [];
  }
}

export function getMerchTrain(): MerchTrain {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "merch-train.json"), "utf8"));
  } catch {
    return { heading: "MERCH TRAIN — HOW IT WORKS", intro: "", steps: [], cta_label: "WATCH SKELLY LIVE →" };
  }
}

export function getPerksTable(): PerksTable {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "perks-table.json"), "utf8"));
  } catch {
    return { heading: "PERKS BY TIER", rows: [], cta_label: "JOIN ON YOUTUBE →" };
  }
}

export function getFanArt(): FanArt[] {
  const dir = path.join(ROOT, "fanart");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const items: FanArt[] = files
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data } = matter(raw);
      if (!data.image || !data.artist) return null;
      return {
        slug: f.replace(/\.md$/, ""),
        artist: data.artist,
        social_url: data.social_url,
        image: data.image,
        date: toDateString(data.date),
        caption: data.caption,
      } as FanArt;
    })
    .filter((x): x is FanArt => x !== null);
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}
