const EVENT_TZ = "America/Chicago";

/** Today's date as YYYY-MM-DD in the event timezone (CST/CDT). */
export function cstToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Event is active when CST today is within [start, end] inclusive. */
export function isEventActive(start: string, end: string, now: Date = new Date()): boolean {
  if (!start || !end) return false;
  const today = cstToday(now);
  return today >= start && today <= end;
}

/**
 * Ticker visibility: true from now through the last event day (inclusive).
 * Intentionally has NO lower bound — it shows on pre-event days too, where the
 * EventTicker renders a "coming soon" teaser. Pair with isBeforeEvent() to tell
 * the two phases apart. This is the requested behavior, not a missing guard.
 */
export function isTickerVisible(end: string, now: Date = new Date()): boolean {
  if (!end) return false;
  return cstToday(now) <= end;
}

/** True before the event opens (CST today < start). */
export function isBeforeEvent(start: string, now: Date = new Date()): boolean {
  if (!start) return false;
  return cstToday(now) < start;
}
