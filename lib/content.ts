import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const ROOT = path.join(process.cwd(), "content");

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
    lastUpdated: data.last_updated ?? "",
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
        date: data.date ?? "",
        caption: data.caption,
      } as FanArt;
    })
    .filter((x): x is FanArt => x !== null);
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}
