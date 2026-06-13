import type { SkellythonProgress } from "@/lib/skellython";

export default function SkellythonHeroStat({
  liveSubs,
  progress,
  before,
  ended,
  startDisplay,
  finalTarget,
}: {
  liveSubs: number | null;
  progress: SkellythonProgress;
  before: boolean;
  ended: boolean;
  startDisplay: string;
  finalTarget: number | null;
}) {
  // ENDED: recap the final count, no live race framing.
  if (ended) {
    return (
      <div className="mt-6 border-t border-purple-core/30 pt-5">
        <p className="text-text-muted font-bebas tracking-widest text-xs">THAT WAS SKELLYTHON</p>
        <p className="heading text-5xl md:text-6xl text-white mt-1">
          {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
        </p>
        <p className="text-text-primary/90 text-sm mt-3">
          every dare that fell is below, clips and all.
        </p>
      </div>
    );
  }

  // BEFORE: the starting line, not a live race.
  if (before) {
    return (
      <div className="mt-6 border-t border-purple-core/30 pt-5">
        <p className="text-text-muted font-bebas tracking-widest text-xs">GOES LIVE</p>
        <p className="font-bebas tracking-widest text-gold text-2xl mt-1">{startDisplay}</p>
        <div className="mt-4 border-t border-purple-core/20 pt-4">
          <p className="text-text-muted font-bebas tracking-widest text-xs">STARTING AT</p>
          <p className="heading text-4xl md:text-5xl text-white mt-1">
            {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
          </p>
          {liveSubs == null && (
            <p className="text-text-muted text-xs mt-1">sub count syncs when we go live</p>
          )}
        </div>
        <StartingBar progress={progress} finalTarget={finalTarget} />
      </div>
    );
  }

  // ACTIVE: live counter + race framing.
  return (
    <div className="mt-6 border-t border-purple-core/30 pt-5">
      <p className="text-text-muted font-bebas tracking-widest text-xs">LIVE YOUTUBE SUBS</p>
      <p className="heading text-5xl md:text-6xl text-white mt-1">
        {liveSubs != null ? liveSubs.toLocaleString("en-US") : "—"}
      </p>
      {liveSubs == null && (
        <p className="text-text-muted text-xs mt-1">sub count syncs when we go live</p>
      )}
      <ProgressBar progress={progress} />
    </div>
  );
}

/** Pre-event bar: frames the climb toward the full run, not a live "subs to go" race. */
function StartingBar({
  progress,
  finalTarget,
}: {
  progress: SkellythonProgress;
  finalTarget: number | null;
}) {
  const { nextGoal, pct } = progress;
  return (
    <div className="mt-3">
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          finalTarget
            ? `Starting line, climbing toward ${finalTarget} subscribers`
            : "Starting line"
        }
        className="h-3 bg-bg-primary rounded-full overflow-hidden border border-purple-core/30"
      >
        <div
          className="h-full bg-gradient-to-r from-electric-pink via-purple-light to-electric-blue transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-text-primary/90 text-sm mt-2">
        {nextGoal && finalTarget ? (
          <>
            first dare unlocks at {nextGoal.target.toLocaleString("en-US")}. help push it to{" "}
            <span className="text-electric-blue">{finalTarget.toLocaleString("en-US")}</span> when we go
            live.
          </>
        ) : (
          "the climb starts june 22."
        )}
      </p>
    </div>
  );
}

function ProgressBar({ progress }: { progress: SkellythonProgress }) {
  const { nextGoal, pct, remaining, allReached } = progress;
  return (
    <div className="mt-3">
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          allReached
            ? "All goals reached"
            : nextGoal
            ? `${Math.round(pct)} percent toward ${nextGoal.target} subscribers`
            : "Progress"
        }
        className="h-3 bg-bg-primary rounded-full overflow-hidden border border-purple-core/30"
      >
        <div
          className="h-full bg-gradient-to-r from-electric-pink via-purple-light to-electric-blue transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-text-primary/90 text-sm mt-2">
        {allReached ? (
          "every goal smashed. absolute chaos."
        ) : nextGoal && remaining != null ? (
          <>
            {remaining.toLocaleString("en-US")} subs to go until{" "}
            <span className="text-electric-blue">{nextGoal.dare}</span>
          </>
        ) : nextGoal ? (
          <>
            next up at {nextGoal.target.toLocaleString("en-US")}:{" "}
            <span className="text-electric-blue">{nextGoal.dare}</span>
          </>
        ) : (
          "—"
        )}
      </p>
    </div>
  );
}
