import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt?: string;
  seoDescription?: string;
  html: string;
};

const DIR = path.join(process.cwd(), "content", "blog");

export function listPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((f) => readPost(f.replace(/\.md$/, "")))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function readPost(slug: string): Post | null {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const html = remark().use(remarkHtml).processSync(content).toString();
  return {
    slug,
    title: data.title ?? slug,
    date: toDateString(data.date),
    category: data.category ?? "Just Vibes",
    excerpt: data.excerpt,
    seoDescription: data.seo_description,
    html,
  };
}

function toDateString(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? "" : v.toISOString().slice(0, 10);
  }
  return String(v);
}
