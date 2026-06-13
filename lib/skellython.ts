import type { SkellythonGoal } from "./content";

/** A goal counts as reached when the live sub count passes it, or Skelly forces it. */
export function isGoalReached(goal: SkellythonGoal, liveSubs: number | null): boolean {
  if (goal.reached_override) return true;
  if (liveSubs == null) return false;
  return liveSubs >= goal.target;
}

export type SkellythonProgress = {
  sorted: SkellythonGoal[];
  reachedCount: number;
  nextGoal: SkellythonGoal | null;
  pct: number; // 0..100 toward nextGoal
  remaining: number | null; // subs to next goal; null if no live count
  allReached: boolean;
};

export function computeProgress(
  goals: SkellythonGoal[],
  liveSubs: number | null,
  baseline?: number
): SkellythonProgress {
  const sorted = [...goals].sort((a, b) => a.target - b.target);
  const reachedCount = sorted.filter((g) => isGoalReached(g, liveSubs)).length;
  const nextGoal = sorted.find((g) => !isGoalReached(g, liveSubs)) ?? null;
  // length>0 guard avoids a false "all done" celebration on an empty goal list.
  const allReached = nextGoal === null && sorted.length > 0;

  let pct = 0;
  let remaining: number | null = null;

  if (allReached) {
    pct = 100;
  } else if (nextGoal && liveSubs != null) {
    const idx = sorted.indexOf(nextGoal);
    // Bar floor: previous reached goal's target, else the configured baseline,
    // else one step below the first goal so goal #1 doesn't render near-empty.
    // With 2+ goals the "step" is the gap between the first two; with a lone
    // goal there's no gap to infer, so assume a 25-sub step (our event cadence).
    const fallbackFloor =
      sorted.length > 1 ? sorted[0].target - (sorted[1].target - sorted[0].target) : nextGoal.target - 25;
    const prev = idx > 0 ? sorted[idx - 1].target : baseline ?? fallbackFloor;
    const span = nextGoal.target - prev;
    pct = span > 0 ? Math.max(0, Math.min(100, ((liveSubs - prev) / span) * 100)) : 0;
    remaining = Math.max(0, nextGoal.target - liveSubs);
  }

  return { sorted, reachedCount, nextGoal, pct, remaining, allReached };
}
