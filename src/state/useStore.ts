"use client";
import { create } from "zustand";
import {
  BoardCard, BoardStatus, Budget, GoalNode, Task, Vision, UserPrefs, PlannerSettings, TabId,
  PlannerAction, ActionTemplate
} from "@/domain/types";
import {
  seedBoards, seedBudgets, seedGoals, seedTasks, seedVisions, seedPrefs, seedSettings
} from "@/domain/sample-data";

// ---------- helpers ----------
const uid = () => Math.random().toString(36).slice(2, 10);
// allow up to 24h (1440m)
const clamp1to1440 = (n:number) => Math.max(1, Math.min(1440, Math.round(n)));

type Horizon = "12+" | "1-3" | "other";
type Rubric = "IART+G" | "JRN" | "UIE";

type ScoreInputs =
  | { rubric: "IART+G"; I?: number; A?: number; R?: number; T?: number; G?: number }
  | { rubric: "JRN"; J?: number; R?: number; N?: number }
  | { rubric: "UIE"; U?: number; I?: number; E?: number };

function scoreFromInputs(inputs?: ScoreInputs): number | undefined {
  if (!inputs) return undefined;
  if (inputs.rubric === "IART+G") {
    const { I, A, R, T } = inputs;
    const vals = [I, A, R, T].filter((v): v is number => typeof v === "number");
    return vals.length === 4 ? Math.round((vals.reduce((a, b) => a + b, 0) / 4) * 10) / 10 : undefined;
  }
  if (inputs.rubric === "JRN") {
    const { J, R, N } = inputs;
    const vals = [J, R, N].filter((v): v is number => typeof v === "number");
    return vals.length === 3 ? Math.round((vals.reduce((a, b) => a + b, 0) / 3) * 10) / 10 : undefined;
  }
  if (inputs.rubric === "UIE") {
    const { U, I, E } = inputs;
    const vals = [U, I, E].filter((v): v is number => typeof v === "number");
    return vals.length === 3 ? Math.round((vals.reduce((a, b) => a + b, 0) / 3) * 10) / 10 : undefined;
  }
  return undefined;
}

// time helpers
const pad2 = (n:number) => String(n).padStart(2, "0");
const timeToMin = (t:string) => {
  const [h,m] = t.split(":").map((x)=>parseInt(x,10));
  return (isFinite(h)?h:0)*60 + (isFinite(m)?m:0);
};
const minToTime = (m:number) => {
  const mm = ((m % (24*60)) + 24*60) % (24*60);
  const h = Math.floor(mm/60); const m2 = mm%60;
  return `${pad2(h)}:${pad2(m2)}`;
};

// Board keys: tab + horizon
function boardKey(tab: TabId, horizon: Horizon): string {
  if (horizon === "12+") return `${tab}-annual`;
  if (horizon === "1-3") return `${tab}-13`;
  return `${tab}-other`;
}

// Caps per board
const CAPS: Record<string, { active: number; incubating: number }> = {
  "passion-annual": { active: 3, incubating: 3 },
  "passion-13": { active: 3, incubating: 3 },
  "play-annual": { active: 3, incubating: 3 },
  "play-13": { active: 1, incubating: 3 },
  "person-13": { active: 1, incubating: 3 }
};

// week key helper (ISO-ish)
function getWeekKey(d = new Date()): string {
  const dt = new Date(d);
  const onejan = new Date(dt.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((dt.getTime() - onejan.getTime()) / 86400000) + 1;
  const week = Math.ceil((dayOfYear + ((onejan.getDay() + 6) % 7)) / 7);
  return `${dt.getFullYear()}-${String(week).padStart(2, "0")}`;
}

/** Simple add-days returning ISO date (yyyy-mm-dd) */
function addDaysISO(iso:string, days:number): string {
  const [y,m,d] = iso.split("-").map(n=>parseInt(n,10));
  const dt = new Date(y, (m-1), d);
  dt.setDate(dt.getDate()+days);
  return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
}
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function daysBetween(aISO:string, bISO:string): number {
  const [ya,ma,da] = aISO.split("-").map(n=>parseInt(n,10));
  const [yb,mb,db] = bISO.split("-").map(n=>parseInt(n,10));
  const a = new Date(ya,ma-1,da); a.setHours(0,0,0,0);
  const b = new Date(yb,mb-1,db); b.setHours(0,0,0,0);
  return Math.round((b.getTime()-a.getTime())/86400000);
}

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

type PurePlayState = {
  cycleDays: number;        // 8
  tokensPerCycle: number;   // 2
  cycleStartISO: string;    // beginning of current window (local)
  usedThisCycle: number;    // how many spent within window
  feature: PurePlayItem | null;
  lastFeatureAtISO: string | null;
  queue: PurePlayItem[];    // incubating
  dormant: PurePlayItem[];  // retired
};

function sortByJRNDesc(a: PurePlayItem, b: PurePlayItem) {
  const sa = (a.J ?? 0) + (a.R ?? 0) + (a.N ?? 0);
  const sb = (b.J ?? 0) + (b.R ?? 0) + (b.N ?? 0);
  if (sb !== sa) return sb - sa;
  return a.name.localeCompare(b.name);
}



// ---------- store ----------
type Store = {
  budgets: Budget[];
  visions: Vision[];
  goals: GoalNode[];
  boards: BoardCard[];
  tasks: Task[];
  prefs: UserPrefs;
  settings: PlannerSettings;

  selected: Record<TabId, string | null>;
  selectedPerson: Record<string, string | null>;
  visionTab: Record<string, TabId | undefined>;
  visionSection: Record<string, string | undefined>;

  openRubricForGoalId: string | null;
  setOpenRubricForGoalId: (id: string | null) => void;
  openActive13ForGoalId: string | null;
  setOpenActive13ForGoalId: (id: string | null) => void;

  plannerActions: PlannerAction[];

  /** PURE PLAY */
  purePlay: PurePlayState;
  getPurePlayTokenState: () => { remaining: number; resetsInDays: number; cycleStartISO: string };
  resetPurePlayWindowIfNeeded: () => void;
  addPurePlayQueueItem: (item: Omit<PurePlayItem, "id">) => void;
  removePurePlayQueueItem: (id: string) => void;
  movePurePlayToDormant: (id: string) => void;
  promoteNextPurePlayCandidate: () => void;
  usePurePlayTokenForFeature: () => { ok: boolean; reason?: string; usedId?: string };
  /** NEW: spend 1 token and place the current feature into the weekly planner. */
  consumeTokenAndScheduleFeature: (plan: PurePlayPlan) => { ok: boolean; reason?: string; usedId?: string };

  visibleVisionsForTab: (tab: TabId, sectionKey?: string) => Vision[];
  goalsForDirection: (directionId: string) => GoalNode[];

  updateBudget: (idx: number, value: number) => void;
  moveBoardCard: (cardId: string, status: BoardStatus) => void;

  selectDirection: (tab: TabId, directionId: string | null, sectionKey?: string) => void;
  addDirection: (tab: TabId, label?: string, sectionKey?: string) => string;
  removeDirection: (tab: TabId, directionId: string) => void;
  updateVision: (directionId: string, patch: Partial<Vision>) => void;

  updateGoal: (id: string, patch: Partial<GoalNode>) => void;
  addChildGoal: (parentId: string, title?: string) => string;
  addSiblingGoal: (nodeId: string, title?: string) => string;
  removeGoalCascade: (id: string) => void;

  upsertBoardForGoal: (goalId: string) => void;
  rebalanceBoard: (tab: TabId, horizon: Horizon) => void;

  generatePlannerActionsForWeek: (weekKey?: string) => void;
  movePlannerAction: (id: string, upd: Partial<Pick<PlannerAction, "day"|"start"|"order">>) => void;
  updatePlannerAction: (id: string, patch: Partial<PlannerAction>) => void;

  /** SLOT HELPERS (for planner/editor UIs) */
  isSlotFree: (day: 0|1|2|3|4|5|6, startHHMM: string, durationMin: number, excludeId?: string) => boolean;
  findNextFreeSlot: (
    day: 0|1|2|3|4|5|6,
    startHHMM: string,
    durationMin: number,
    direction: "down" | "up",
    snap?: number,
    excludeId?: string
  ) => string;
};

export const useStore = create<Store>((set, get) => ({
  budgets: seedBudgets,
  visions: seedVisions,
  goals: seedGoals,
  boards: seedBoards,
  tasks: seedTasks,
  prefs: seedPrefs[0],
  settings: seedSettings[0],

  selected: { passion: null, person: null, play: null },
  selectedPerson: { physical: null, cognitive: null, emotional: null, social: null, meaning: null },
  visionTab: {},
  visionSection: {},

  openRubricForGoalId: null,
  setOpenRubricForGoalId: (id) => set(() => ({ openRubricForGoalId: id })),
  openActive13ForGoalId: null,
  setOpenActive13ForGoalId: (id) => set(() => ({ openActive13ForGoalId: id })),

  plannerActions: [],

  /** ---------- PURE PLAY init ---------- */
  purePlay: {
    cycleDays: 8,
    tokensPerCycle: 2,
    cycleStartISO: todayISO(),   // start today
    usedThisCycle: 0,
    feature: null,
    lastFeatureAtISO: null,
    queue: [],
    dormant: [],
  },

  /** Compute remaining & days to reset; also auto-reset if window passed */
  getPurePlayTokenState: () => {
    const s = get().purePlay;
    const today = todayISO();
    const elapsed = daysBetween(s.cycleStartISO, today);
    let cycleStartISO = s.cycleStartISO;
    let used = s.usedThisCycle;
    if (elapsed >= s.cycleDays) {
      // reset
      cycleStartISO = today;
      used = 0;
      set((state) => ({ purePlay: { ...state.purePlay, cycleStartISO, usedThisCycle: 0 }}));
    }
    const remaining = Math.max(0, s.tokensPerCycle - used);
    const dayIntoCycle = Math.min(elapsed, s.cycleDays);
    const resetsInDays = Math.max(0, s.cycleDays - dayIntoCycle);
    return { remaining, resetsInDays, cycleStartISO };
  },

  resetPurePlayWindowIfNeeded: () => {
    const s = get().purePlay;
    const today = todayISO();
    const elapsed = daysBetween(s.cycleStartISO, today);
    if (elapsed >= s.cycleDays) {
      set((state) => ({
        purePlay: { ...state.purePlay, cycleStartISO: today, usedThisCycle: 0 }
      }));
    }
  },

  addPurePlayQueueItem: (item) =>
    set((state) => {
      const it = { ...item, id: uid() } as PurePlayItem;
      const queue = [...state.purePlay.queue, it].sort(sortByJRNDesc);
      return { purePlay: { ...state.purePlay, queue } };
    }),

  removePurePlayQueueItem: (id) =>
    set((state) => ({
      purePlay: { ...state.purePlay, queue: state.purePlay.queue.filter(q => q.id !== id) }
    })),

  movePurePlayToDormant: (id) =>
    set((state) => {
      const q = state.purePlay.queue.find(x => x.id === id);
      const queue = state.purePlay.queue.filter(x => x.id !== id);
      const dormant = q ? [q, ...state.purePlay.dormant] : state.purePlay.dormant;
      return { purePlay: { ...state.purePlay, queue, dormant } };
    }),

  /** Peek top candidate by JRN and set it as 'feature' (not consuming token). */
  promoteNextPurePlayCandidate: () =>
    set((state) => {
      const next = [...state.purePlay.queue].sort(sortByJRNDesc)[0] || null;
      return { purePlay: { ...state.purePlay, feature: next } };
    }),

  /** Consume 1 token for Feature of the Week — *without* scheduling. */
  usePurePlayTokenForFeature: () => {
    const st = get().purePlay;
    // reset window if needed
    get().resetPurePlayWindowIfNeeded();
    const { remaining } = get().getPurePlayTokenState();
    if (remaining <= 0) return { ok:false, reason:"No tokens remaining in this 8‑day window." };

    const queueSorted = [...st.queue].sort(sortByJRNDesc);
    const useItem = st.feature ?? queueSorted[0] ?? null;
    if (!useItem) return { ok:false, reason:"No item in queue to feature." };

    // Remove used from queue
    const nextQueue = st.queue.filter(q => q.id !== useItem.id);
    // Compute next candidate
    const nextCandidate = [...nextQueue].sort(sortByJRNDesc)[0] ?? null;

    const today = todayISO();
    set((state) => ({
      purePlay: {
        ...state.purePlay,
        usedThisCycle: Math.min(state.purePlay.tokensPerCycle, state.purePlay.usedThisCycle + 1),
        feature: nextCandidate,            // feature "goes away" after usage; we show the next candidate
        lastFeatureAtISO: today,
        queue: nextQueue,
      }
    }));
    return { ok:true, usedId: useItem.id };
  },

  /** NEW: Spend 1 token *and* schedule the current candidate into the planner. */
  consumeTokenAndScheduleFeature: (plan) => {
    // Ensure window is valid and tokens remain
    get().resetPurePlayWindowIfNeeded();
    const { remaining } = get().getPurePlayTokenState();
    if (remaining <= 0) return { ok:false, reason:"No tokens remaining in this 8‑day window." };

    const pp = get().purePlay;
    const candidateSorted = [...pp.queue].sort(sortByJRNDesc);
    const useItem = pp.feature ?? candidateSorted[0] ?? null;
    if (!useItem) return { ok:false, reason:"No item in queue to feature." };

    const duration = clamp1to1440(plan.durationMin || useItem.durationMin || 60);
    const day = plan.day as 0|1|2|3|4|5|6;

    let start: string | null = null;
    let fixed = false;

    if (plan.mode === "specific" && plan.timeHHMM) {
      // must not overlap; if taken, fail
      const free = get().isSlotFree(day, plan.timeHHMM, duration);
      if (!free) return { ok:false, reason:"That time slot is already taken." };
      start = plan.timeHHMM;
      fixed = true;
    } else {
      // floating: find next available slot (jump past conflicts)
      const snap = get().settings.snapMinutes || 15;
      const hint = plan.timeHHMM ?? "05:00";
      start = get().findNextFreeSlot(day, hint, duration, "down", snap);
      fixed = false;
    }

    const wk = getWeekKey();
    const action: PlannerAction = {
      id: uid(),
      weekKey: wk,
      goalId: `pureplay:${useItem.id}`,
      templateKey: "feature",
      label: useItem.name,
      day,
      durationMin: duration,
      start,
      order: 0,
      fixed,
      source: 'pureplay',
    };

    // Commit: add action, consume token, promote next, remove from queue
    set((state) => {
      const nextQueue = state.purePlay.queue.filter(q => q.id !== useItem.id);
      const nextCandidate = [...nextQueue].sort(sortByJRNDesc)[0] ?? null;
      return {
        plannerActions: [...state.plannerActions, action],
        purePlay: {
          ...state.purePlay,
          usedThisCycle: Math.min(state.purePlay.tokensPerCycle, state.purePlay.usedThisCycle + 1),
          feature: nextCandidate,
          lastFeatureAtISO: todayISO(),
          queue: nextQueue,
        }
      };
    });

    return { ok:true, usedId: useItem.id };
  },

  /** Edit Pure‑Play item details (name/J/R/N/duration) wherever it lives. */
  updatePurePlayItem: (id: string, patch: Partial<PurePlayItem>) =>
    set((state) => {
      const pp = state.purePlay;
      const apply = (arr: PurePlayItem[]) => arr.map(x => x.id === id ? { ...x, ...patch } : x);

      const feature =
        pp.feature && pp.feature.id === id ? { ...pp.feature, ...patch } : pp.feature;

      // re‑rank queue by JRN after edit
      const queue = apply(pp.queue).sort((a, b) => {
        const sa = (a.J ?? 0) + (a.R ?? 0) + (a.N ?? 0);
        const sb = (b.J ?? 0) + (b.R ?? 0) + (b.N ?? 0);
        if (sb !== sa) return sb - sa;
        return a.name.localeCompare(b.name);
      });

      const dormant = apply(pp.dormant);

      return { purePlay: { ...pp, feature, queue, dormant } };
    }),

  /** Move an item from Dormant back to the Queue (auto re‑rank). */
  movePurePlayDormantToQueue: (id: string) =>
    set((state) => {
      const pp = state.purePlay;
      const item = pp.dormant.find(x => x.id === id);
      if (!item) return { purePlay: pp };
      const dormant = pp.dormant.filter(x => x.id !== id);
      const queue = [...pp.queue, item].sort((a, b) => {
        const sa = (a.J ?? 0) + (a.R ?? 0) + (a.N ?? 0);
        const sb = (b.J ?? 0) + (b.R ?? 0) + (b.N ?? 0);
        if (sb !== sa) return sb - sa;
        return a.name.localeCompare(b.name);
      });
      return { purePlay: { ...pp, queue, dormant } };
    }),



  /** ------------ Existing selectors/actions below ------------ */

  visibleVisionsForTab: (tab, sectionKey) => {
    const { visions, goals, visionTab, visionSection } = get();
    const explicit = visions.filter((v) => {
      if (visionTab[v.id] !== tab) return false;
      if (tab === "person" && sectionKey) return visionSection[v.id] === sectionKey;
      if (tab === "person" && !sectionKey) return false;
      return true;
    });
    const inferred = visions.filter((v) => {
      const byTab = goals.some((g) => g.directionId === v.id && g.tabId === tab);
      if (!byTab) return false;
      if (tab !== "person") return true;
      if (!sectionKey) return false;
      return visionSection[v.id] === sectionKey;
    });
    const byId: Record<string, Vision> = {};
    [...explicit, ...inferred].forEach((v) => (byId[v.id] = v));
    return Object.values(byId);
  },

  goalsForDirection: (directionId) =>
    get().goals.filter((g) => g.directionId === directionId),

  updateBudget: (idx, value) =>
    set((state) => {
      const next = [...state.budgets];
      const b = {
        ...next[0],
        daily: [...next[0].daily] as [number, number, number, number],
      };
      b.daily[idx] = Math.max(0, Math.min(100, Math.round(value)));
      next[0] = b;
      return { budgets: next };
    }),

  moveBoardCard: (cardId, status) =>
    set((state) => ({
      boards: state.boards.map((c) => (c.id === cardId ? { ...c, status } : c)),
    })),

  selectDirection: (tab, directionId, sectionKey) =>
    set((state) => {
      if (tab === "person" && sectionKey) {
        return {
          selectedPerson: { ...state.selectedPerson, [sectionKey]: directionId },
        };
      }
      return { selected: { ...state.selected, [tab]: directionId } };
    }),

  addDirection: (tab, label = "New direction", sectionKey) => {
    const id = uid();
    const newVision: Vision = {
      id,
      label,
      legacyText: "",
      legacyValues: [],
      personalText: "",
      personalValues: [],
    };
    const newRoot: GoalNode = {
      id: uid(),
      tabId: tab,
      directionId: id,
      parentId: null,
      type: "northStar",
      title: label,
      horizon: "other",
      rubric: undefined,
      rubricInputs: undefined,
    };
    set((state) => {
      const next: Partial<Store> = {
        visions: [newVision, ...state.visions],
        goals: [newRoot, ...state.goals],
        visionTab: { ...state.visionTab, [id]: tab },
      };
      if (tab === "person" && sectionKey) {
        next.visionSection = { ...state.visionSection, [id]: sectionKey };
        next.selectedPerson = { ...state.selectedPerson, [sectionKey]: id };
      } else {
        next.selected = { ...state.selected, [tab]: id };
      }
      return next as Store;
    });
    return id;
  },

  removeDirection: (tab, directionId) =>
    set((state) => {
      const visions = state.visions.filter((v) => v.id !== directionId);
      const goals = state.goals.filter((g) => g.directionId !== directionId);
      const visionTab = { ...state.visionTab };
      delete visionTab[directionId];

      const visionSection = { ...state.visionSection };
      const removedSection = visionSection[directionId];
      delete visionSection[directionId];

      let selected = state.selected;
      let selectedPerson = state.selectedPerson;

      if (tab === "person") {
        if (removedSection && selectedPerson[removedSection] === directionId) {
          selectedPerson = { ...selectedPerson, [removedSection]: null };
        }
      } else {
        if (selected[tab] === directionId) {
          selected = { ...selected, [tab]: null };
        }
      }

      const boards = state.boards.filter((b) => !b.tabId.startsWith(tab));

      return {
        visions,
        goals,
        visionTab,
        visionSection,
        boards,
        selected,
        selectedPerson,
      };
    }),

  updateVision: (directionId, patch) =>
    set((state) => ({
      visions: state.visions.map((v) => (v.id === directionId ? { ...v, ...patch } : v)),
    })),

  updateGoal: (id, patch) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    })),

  addChildGoal: (parentId, title = "New sub‑goal") => {
    const parent = get().goals.find((g) => g.id === parentId);
    if (!parent) return "";
    const id = uid();
    const node: GoalNode = {
      id,
      tabId: parent.tabId,
      directionId: parent.directionId,
      parentId: parentId,
      type: "goal",
      title,
      horizon: "other",
      rubric: undefined,
      rubricInputs: undefined,
    };
    set((state) => ({ goals: [...state.goals, node] }));
    return id;
  },

  addSiblingGoal: (nodeId, title = "New peer goal") => {
    const node = get().goals.find((g) => g.id === nodeId);
    if (!node || node.parentId == null) return "";
    const id = uid();
    const peer: GoalNode = {
      id,
      tabId: node.tabId,
      directionId: node.directionId,
      parentId: node.parentId,
      type: "goal",
      title,
      horizon: "other",
      rubric: undefined,
      rubricInputs: undefined,
    };
    set((state) => ({ goals: [...state.goals, peer] }));
    return id;
  },

  removeGoalCascade: (id) => {
    const all = get().goals;
    const childrenOf = (pid: string | null | undefined) =>
      all.filter((g) => g.parentId === pid);
    const toDelete = new Set<string>();
    const walk = (nid: string) => {
      toDelete.add(nid);
      childrenOf(nid).forEach((c) => walk(c.id));
    };
    walk(id);

    set((state) => ({
      goals: state.goals.filter((g) => !toDelete.has(g.id)),
      boards: state.boards.filter((b) => !toDelete.has(b.id)),
      plannerActions: state.plannerActions.filter((p) => !toDelete.has(p.goalId)),
    }));
  },

  upsertBoardForGoal: (goalId) => {
    const state = get();
    const g = state.goals.find((x) => x.id === goalId);
    if (!g) return;

    const h = g.horizon as Horizon | undefined;
    if (!h || h === "other") {
      set((s) => ({ boards: s.boards.filter((b) => b.id !== goalId) }));
      return;
    }

    if (g.tabId === "person" && h === "12+") {
      set((s) => ({ boards: s.boards.filter((b) => b.id !== goalId) }));
      return;
    }

    const key = boardKey(g.tabId, h);
    const rubric: Rubric =
      g.tabId === "passion" ? "IART+G" : g.tabId === "play" ? "JRN" : "UIE";

    const score = scoreFromInputs(g.rubricInputs as ScoreInputs | undefined);

    const nextCard: BoardCard = {
      id: goalId,
      tabId: key,
      status: "dormant",
      title: g.title,
      score: typeof score === "number" ? score : undefined,
      rubric
    };

    set((s) => {
      const exists = s.boards.some((b) => b.id === goalId);
      const boards = exists
        ? s.boards.map((b) => (b.id === goalId ? { ...nextCard } : b))
        : [...s.boards, nextCard];
      return { boards };
    });

    get().rebalanceBoard(g.tabId, h);
  },

  rebalanceBoard: (tab, horizon) => {
    const key = boardKey(tab, horizon);
    const caps = CAPS[key];
    if (!caps) return;

    const items = get()
      .boards
      .filter((b) => b.tabId === key)
      .sort((a, b) => {
        const sa = typeof a.score === "number" ? a.score : -Infinity;
        const sb = typeof b.score === "number" ? b.score : -Infinity;
        if (sb !== sa) return sb - sa;
        return (a.title || "").localeCompare(b.title || "");
      });

    const active = items.slice(0, caps.active);
    const incubating = items.slice(caps.active, caps.active + caps.incubating);
    const dormant = items.slice(caps.active + caps.incubating);

    set((state) => ({
      boards: state.boards.map((b) => {
        if (b.tabId !== key) return b;
        if (active.find((x) => x.id === b.id)) return { ...b, status: "active" };
        if (incubating.find((x) => x.id === b.id)) return { ...b, status: "incubating" };
        if (dormant.find((x) => x.id === b.id)) return { ...b, status: "dormant" };
        return b;
      })
    }));
  },

  // ---------- SLOT HELPERS ----------
  isSlotFree: (day, startHHMM, durationMin, excludeId) => {
    const start = timeToMin(startHHMM);
    const end = start + Math.max(1, durationMin);
    const { plannerActions } = get();
    const sameDay = plannerActions.filter(a => a.day === day && a.id !== excludeId);
    return !sameDay.some(a => {
      const s = a.start ? timeToMin(a.start) : null;
      if (s == null) return false; // floating items without start don't block until placed
      const e = s + Math.max(1, a.durationMin);
      return !(end <= s || start >= e); // overlap if ranges intersect
    });
  },

  findNextFreeSlot: (day, startHHMM, durationMin, direction, snap = 15, excludeId) => {
    const start0 = timeToMin(startHHMM);
    const dur = Math.max(1, durationMin);
    const clamp = (m:number) => Math.max(5*60, Math.min(23*60 - snap, m)); // keep within 05:00–23:00 window
    let cur = clamp(start0);
    const step = Math.max(1, snap);
    const { plannerActions } = get();

    const intervals = plannerActions
      .filter(a => a.day === day && a.id !== excludeId && a.start)
      .map(a => {
        const s = timeToMin(a.start as string);
        return [s, s + Math.max(1, a.durationMin)] as [number, number];
      })
      .sort((a,b) => a[0]-b[0]);

    const collides = (m:number) => {
      const start = m, end = m + dur;
      return intervals.some(([s,e]) => !(end <= s || start >= e));
    };

    if (!collides(cur)) return minToTime(cur);

    if (direction === "down") {
      while (true) {
        let bumped = false;
        for (const [s,e] of intervals) {
          if (!(cur + dur <= s || cur >= e)) {
            cur = Math.max(cur, e);
            cur = Math.ceil(cur/step)*step;
            cur = clamp(cur);
            bumped = true;
          }
        }
        if (!bumped) break;
        if (!collides(cur)) break;
      }
      return minToTime(cur);
    } else {
      while (true) {
        let bumped = false;
        for (let i = intervals.length-1; i>=0; i--) {
          const [s,e] = intervals[i];
          if (!(cur + dur <= s || cur >= e)) {
            cur = Math.min(cur, s - dur);
            cur = Math.floor(cur/step)*step;
            cur = clamp(cur);
            bumped = true;
          }
        }
        if (!bumped) break;
        if (!collides(cur)) break;
      }
      return minToTime(cur);
    }
  },

  // ---------- planner ----------
  generatePlannerActionsForWeek: (weekKey) => {
    const wk = weekKey || getWeekKey();
    const state = get();
    const { boards, goals, settings } = state;
    const snap = settings.snapMinutes || 15;

    const findNextFreeSlot = state.findNextFreeSlot;

    type Desired = {
      sig: string;
      goalId: string;
      templateKey: string;
      label: string;
      day: 0|1|2|3|4|5|6;
      durationMin: number;
      start: string | null;
      fixed: boolean;
    };

    const desired: Desired[] = [];
    const active13 = boards.filter(b => b.tabId.endsWith("-13") && b.status === "active");

    for (const card of active13) {
      const g = goals.find(x => x.id === card.id);
      if (!g || !g.actionsTemplate || g.actionsTemplate.length === 0) continue;

      for (const t of g.actionsTemplate) {
        const dur = clamp1to1440(t.durationMin || 0);
        if (!dur) continue;

        if (t.mode === "specific") {
          if (typeof t.day !== "number") continue;
          const d = t.day as 0|1|2|3|4|5|6;
          desired.push({
            sig: `${g.id}|${t.key}|${d}`,
            goalId: g.id,
            templateKey: t.key,
            label: t.label,
            day: d,
            durationMin: dur,
            start: t.start ?? null,
            fixed: !!t.start,
          });
          continue;
        }

        if (t.mode === "frequency" && (t.frequencyPerWeek || 0) > 0) {
          const freq = Math.max(1, Math.min(7, Math.round(t.frequencyPerWeek as number)));
          let days = (t.preferredDays && t.preferredDays.length)
            ? t.preferredDays.slice(0)
            : [1,3,5,0,2,4,6];
          const picks: number[] = [];
          let i = 0;
          while (picks.length < freq) { picks.push(days[i % days.length] as number); i++; }
          for (const d of picks) {
            desired.push({
              sig: `${g.id}|${t.key}|${d}`,
              goalId: g.id,
              templateKey: t.key,
              label: t.label,
              day: d as 0|1|2|3|4|5|6,
              durationMin: dur,
              start: null,
              fixed: false,
            });
          }
        }
      }
    }

    const existingWeek = state.plannerActions.filter(p => p.weekKey === wk);
    const existingBySig = new Map<string, typeof existingWeek[number]>();
    for (const a of existingWeek) {
      existingBySig.set(`${a.goalId}|${a.templateKey}|${a.day}`, a);
    }

    const next: typeof existingWeek = [];

    const placeNonOverlapping = (day: 0|1|2|3|4|5|6, durationMin: number, startHint: string | null, fixed: boolean, excludeId?: string) => {
      const start = findNextFreeSlot(day, startHint ?? "05:00", durationMin, "down", snap, excludeId);
      return { start, fixed };
    };

    // keep existing
    for (const d of desired) {
      const ex = existingBySig.get(d.sig);
      if (ex) {
        next.push({
          ...ex,
          label: d.label,
          durationMin: d.durationMin,
          fixed: d.fixed ? true : false,
        });
        existingBySig.delete(d.sig);
      }
    }

    // add missing
    for (const d of desired) {
      if ([...next, ...existingWeek].some(a => `${a.goalId}|${a.templateKey}|${a.day}` === d.sig)) {
        continue;
      }
      const placed = placeNonOverlapping(d.day, d.durationMin, d.start, d.fixed);
      next.push({
        id: uid(),
        weekKey: wk,
        goalId: d.goalId,
        templateKey: d.templateKey,
        label: d.label,
        day: d.day,
        durationMin: d.durationMin,
        start: placed.start,
        ifThenYet: undefined,
        rationale: undefined,
        order: 0,
        fixed: d.fixed,
        source: 'goal',
      });
    }

set((s) => {
  // Keep any existing actions for this week that are NOT from 'goal'
  const preserved = s.plannerActions.filter(
    p => p.weekKey === wk && p.source && p.source !== 'goal'
  );
  const others = s.plannerActions.filter(p => p.weekKey !== wk);
  return {
    plannerActions: [
      ...others,
      ...preserved,
      ...next, // regenerated goal actions
    ],
  };
});

  },

  movePlannerAction: (id, upd) =>
    set((s) => ({
      plannerActions: s.plannerActions.map((p) =>
        p.id === id ? { ...p, ...upd } : p
      ),
    })),

  updatePlannerAction: (id, patch) =>
    set((s) => ({
      plannerActions: s.plannerActions.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),
}));
