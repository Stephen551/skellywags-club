import Link from "next/link";
import { getSkellython } from "@/lib/content";
import { isTickerVisible, isBeforeEvent } from "@/lib/skellython-date";

export default function EventTicker() {
  const ev = getSkellython();
  if (!ev.enabled || !isTickerVisible(ev.end_date)) return null;

  const before = isBeforeEvent(ev.start_date);
  const cta = before ? "CHAOS INCOMING" : "WATCH THE CHAOS";
  const piece = [ev.name, ev.start_display, cta]
    .filter(Boolean)
    .join(" · ")
    .concat(" →");

  // One visible track is repeated; a second identical track makes the
  // translateX(-50%) loop seamless.
  const track = Array.from({ length: 6 }, () => piece);

  return (
    <Link
      href="/skellython"
      aria-label={`${ev.name}. ${ev.start_display}. ${cta}.`}
      className="block bg-purple-deep text-lightning border-y border-electric-pink/40 overflow-hidden group"
    >
      <div className="flex whitespace-nowrap py-1.5 font-bebas tracking-widest uppercase text-sm md:text-base animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        {[...track, ...track].map((t, i) => (
          // Decorative repetition; the <Link> aria-label is the single source
          // of the accessible name, so every span is hidden from assistive tech.
          <span key={i} className="mx-6 inline-flex items-center" aria-hidden={true}>
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
