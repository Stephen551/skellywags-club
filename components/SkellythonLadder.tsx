import TwitchEmbed from "./TwitchEmbed";
import { isGoalReached } from "@/lib/skellython";
import type { SkellythonGoal } from "@/lib/content";

export default function SkellythonLadder({
  goals,
  liveSubs,
  baseline: _baseline,
}: {
  goals: SkellythonGoal[];
  liveSubs: number | null;
  baseline?: number;
}) {
  const sorted = [...goals].sort((a, b) => a.target - b.target);
  const nextIndex = sorted.findIndex((g) => !isGoalReached(g, liveSubs));

  return (
    <ol className="space-y-4 mt-8">
      {sorted.map((goal, i) => {
        const reached = isGoalReached(goal, liveSubs);
        const isNext = i === nextIndex;
        // Extra emphasis for the finale (highest goal) plus the two known
        // marquee dares this event (merch drop + tattoo). The dares are fixed
        // for Skellython; if a future event needs configurable emphasis, add a
        // `featured` flag to SkellythonGoal rather than extending this regex.
        const big = i === sorted.length - 1 || /merch drop|tattoo/i.test(goal.dare);

        const frame = reached
          ? "bg-bg-card border-electric-blue/60 shadow-glow-blue"
          : isNext
          ? "bg-bg-card/70 border-gold/60 shadow-glow-gold"
          : "bg-bg-card/40 border-purple-core/25";

        return (
          <li
            key={`${goal.target}-${i}`}
            className={`rounded-xl border p-4 md:p-5 transition-colors ${frame} ${
              big ? "ring-1 ring-electric-pink/40" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`shrink-0 grid place-items-center rounded-lg font-bebas text-2xl md:text-3xl w-16 h-14 md:w-20 md:h-16 ${
                  reached ? "bg-electric-blue/20 text-electric-blue" : "bg-bg-primary text-text-muted"
                }`}
              >
                {goal.target.toLocaleString("en-US")}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`heading text-xl md:text-2xl ${big ? "text-electric-pink" : "text-white"}`}>
                  {goal.dare}
                </p>
                <p className="mt-1 text-xs font-bebas tracking-widest uppercase">
                  {reached ? (
                    <span className="text-electric-blue">
                      <span aria-hidden="true">✓ </span>reached
                    </span>
                  ) : liveSubs != null ? (
                    <span className="text-text-muted">
                      {Math.max(0, goal.target - liveSubs).toLocaleString("en-US")} subs to go
                    </span>
                  ) : (
                    <span className="text-text-muted">locked</span>
                  )}
                </p>
              </div>
            </div>

            {reached && goal.clip_url ? (
              <div className="mt-4">
                <TwitchEmbed mode="clip" value={goal.clip_url} title={`Clip: ${goal.dare}`} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
