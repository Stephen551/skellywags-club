import type { Metadata } from "next";
import EmailCapture from "@/components/EmailCapture";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Subscribe — skellywags.club",
  description: "Drop your email. Get chaos in your inbox.",
  openGraph: {
    title: "subscribe to skellywags.club",
    description: "drop your email. we'll yell when something dumb happens.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "subscribe to skellywags.club",
    description: "drop your email. we'll yell when something dumb happens.",
  },
};

export default function SubscribePage() {
  const site = getSite();
  const bullets = Array.isArray(site.subscribe_page_bullets)
    ? site.subscribe_page_bullets
    : [];

  return (
    <section className="max-w-2xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      <div className="text-center">
        <h1 className="heading text-5xl md:text-7xl text-white leading-[0.95]">
          {site.subscribe_page_heading}
        </h1>
        <p className="text-text-primary/85 mt-6 text-lg md:text-xl">
          {site.subscribe_page_subheading}
        </p>
      </div>

      <div className="mt-10 md:mt-12">
        <EmailCapture cta={site.subscribe_page_cta_label} />
      </div>

      {site.subscribe_page_finepoint && (
        <p className="text-center text-text-muted text-sm mt-4">
          {site.subscribe_page_finepoint}
        </p>
      )}

      {bullets.length > 0 && (
        <ul className="mt-12 md:mt-14 space-y-3 text-text-primary/90">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-electric-pink font-bangers tracking-widest pt-0.5">
                ✦
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
