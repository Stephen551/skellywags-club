import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://skellywags.club";
  const now = new Date();

  const staticRoutes = [
    "",
    "/shop",
    "/videos",
    "/members",
    "/community",
    "/about",
    "/blog",
    "/faq",
    "/shipping-returns",
    "/privacy",
    "/terms",
  ];

  const blogPosts = listPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1.0 : 0.8,
    })),
    ...blogPosts,
  ];
}
