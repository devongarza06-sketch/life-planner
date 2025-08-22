/** PURE PLAY domain */
export type PurePlayItem = {
  id: string;
  name: string;
  // JRN 1–5 each (optional but used for ranking)
  J?: number; R?: number; N?: number;
  // optional suggested duration (minutes) for display/planning later
  durationMin?: number;
};

/** Typed plan for scheduling a feature into the planner (fixes 'any' warnings). */
export type PurePlayPlan = {
  durationMin: number;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;             // 0=Sun … 6=Sat
  mode: "specific" | "floating";
  /** Required when mode === "specific"; ignored for floating. */
  timeHHMM?: string | null;
};

export type PurePlayState = {
  cycleDays: number;        // 8
  tokensPerCycle: number;   // 2
  cycleStartISO: string;    // beginning of current window (local)
  usedThisCycle: number;    // how many spent within window
  feature: PurePlayItem | null;
  lastFeatureAtISO: string | null;
  queue: PurePlayItem[];    // incubating
  dormant: PurePlayItem[];  // retired
};
