import type { StateCreator, StoreApi } from "zustand";
import type { PlannerAction } from "@/domain/types";
import type { PurePlayState, PurePlayItem, PurePlayPlan } from "../pureplay.types";
import { todayISO, daysBetween, clamp1to1440, getWeekKey } from "../utils/time";
import { uid } from "../constants";

// Local ranking util for JRN
function sortByJRNDesc(a: PurePlayItem, b: PurePlayItem) {
  const sa = (a.J ?? 0) + (a.R ?? 0) + (a.N ?? 0);
  const sb = (b.J ?? 0) + (b.R ?? 0) + (b.N ?? 0);
  if (sb !== sa) return sb - sa;
  return a.name.localeCompare(b.name);
}

type Slice = {
  purePlay: PurePlayState;
  getPurePlayTokenState: () => { remaining: number; resetsInDays: number; cycleStartISO: string };
  resetPurePlayWindowIfNeeded: () => void;
  addPurePlayQueueItem: (item: Omit<PurePlayItem, "id">) => void;
  removePurePlayQueueItem: (id: string) => void;
  movePurePlayToDormant: (id: string) => void;
  promoteNextPurePlayCandidate: () => void;
  usePurePlayTokenForFeature: () => { ok: boolean; reason?: string; usedId?: string };
  consumeTokenAndScheduleFeature: (plan: PurePlayPlan) => { ok: boolean; reason?: string; usedId?: string };
  updatePurePlayItem: (id: string, patch: Partial<PurePlayItem>) => void;
  movePurePlayDormantToQueue: (id: string) => void;
};

export const createPurePlaySlice: StateCreator<
  any,
  [],
  [],
  Slice
> = (set, get, _api: StoreApi<any>) => ({
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

  getPurePlayTokenState: () => {
    const s = get().purePlay as PurePlayState;
    const today = todayISO();
    const elapsed = daysBetween(s.cycleStartISO, today);
    let cycleStartISO = s.cycleStartISO;
    let used = s.usedThisCycle;
    if (elapsed >= s.cycleDays) {
      cycleStartISO = today;
      used = 0;
      set((state:any) => ({ purePlay: { ...state.purePlay, cycleStartISO, usedThisCycle: 0 }}));
    }
    const remaining = Math.max(0, s.tokensPerCycle - used);
    const dayIntoCycle = Math.min(elapsed, s.cycleDays);
    const resetsInDays = Math.max(0, s.cycleDays - dayIntoCycle);
    return { remaining, resetsInDays, cycleStartISO };
  },

  resetPurePlayWindowIfNeeded: () => {
    const s = get().purePlay as PurePlayState;
    const today = todayISO();
    const elapsed = daysBetween(s.cycleStartISO, today);
    if (elapsed >= s.cycleDays) {
      set((state:any) => ({
        purePlay: { ...state.purePlay, cycleStartISO: today, usedThisCycle: 0 }
      }));
    }
  },

  addPurePlayQueueItem: (item) =>
    set((state:any) => {
      const it = { ...item, id: uid() } as PurePlayItem;
      const queue = [...state.purePlay.queue, it].sort(sortByJRNDesc);
      return { purePlay: { ...state.purePlay, queue } };
    }),

  removePurePlayQueueItem: (id) =>
    set((state:any) => ({
      purePlay: { ...state.purePlay, queue: state.purePlay.queue.filter((q:PurePlayItem) => q.id !== id) }
    })),

  movePurePlayToDormant: (id) =>
    set((state:any) => {
      const q = state.purePlay.queue.find((x:PurePlayItem) => x.id === id);
      const queue = state.purePlay.queue.filter((x:PurePlayItem) => x.id !== id);
      const dormant = q ? [q, ...state.purePlay.dormant] : state.purePlay.dormant;
      return { purePlay: { ...state.purePlay, queue, dormant } };
    }),

  promoteNextPurePlayCandidate: () =>
    set((state:any) => {
      const next = [...state.purePlay.queue].sort(sortByJRNDesc)[0] || null;
      return { purePlay: { ...state.purePlay, feature: next } };
    }),

  usePurePlayTokenForFeature: () => {
    const st = get().purePlay as PurePlayState;
    get().resetPurePlayWindowIfNeeded();
    const { remaining } = get().getPurePlayTokenState();
    if (remaining <= 0) return { ok:false, reason:"No tokens remaining in this 8‑day window." };

    const queueSorted = [...st.queue].sort(sortByJRNDesc);
    const useItem = st.feature ?? queueSorted[0] ?? null;
    if (!useItem) return { ok:false, reason:"No item in queue to feature." };

    const nextQueue = st.queue.filter((q:PurePlayItem) => q.id !== useItem.id);
    const nextCandidate = [...nextQueue].sort(sortByJRNDesc)[0] ?? null;

    const today = todayISO();
    set((state:any) => ({
      purePlay: {
        ...state.purePlay,
        usedThisCycle: Math.min(state.purePlay.tokensPerCycle, state.purePlay.usedThisCycle + 1),
        feature: nextCandidate,
        lastFeatureAtISO: today,
        queue: nextQueue,
      }
    }));
    return { ok:true, usedId: useItem.id };
  },

  consumeTokenAndScheduleFeature: (plan) => {
    get().resetPurePlayWindowIfNeeded();
    const { remaining } = get().getPurePlayTokenState();
    if (remaining <= 0) return { ok:false, reason:"No tokens remaining in this 8‑day window." };

    const pp = get().purePlay as PurePlayState;
    const candidateSorted = [...pp.queue].sort(sortByJRNDesc);
    const useItem = pp.feature ?? candidateSorted[0] ?? null;
    if (!useItem) return { ok:false, reason:"No item in queue to feature." };

    const duration = clamp1to1440(plan.durationMin || useItem.durationMin || 60);
    const day = plan.day as 0|1|2|3|4|5|6;

    let start: string | null = null;
    let fixed = false;

    if (plan.mode === "specific" && plan.timeHHMM) {
      const free = get().isSlotFree(day, plan.timeHHMM, duration);
      if (!free) return { ok:false, reason:"That time slot is already taken." };
      start = plan.timeHHMM;
      fixed = true;
    } else {
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

    set((state:any) => {
      const nextQueue = state.purePlay.queue.filter((q:PurePlayItem) => q.id !== useItem.id);
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

  updatePurePlayItem: (id, patch) =>
    set((state:any) => {
      const pp = state.purePlay as PurePlayState;
      const apply = (arr: PurePlayItem[]) => arr.map(x => x.id === id ? { ...x, ...patch } : x);

      const feature =
        pp.feature && pp.feature.id === id ? { ...pp.feature, ...patch } : pp.feature;

      const queue = apply(pp.queue).sort((a, b) => {
        const sa = (a.J ?? 0) + (a.R ?? 0) + (a.N ?? 0);
        const sb = (b.J ?? 0) + (b.R ?? 0) + (b.N ?? 0);
        if (sb !== sa) return sb - sa;
        return a.name.localeCompare(b.name);
      });

      const dormant = apply(pp.dormant);

      return { purePlay: { ...pp, feature, queue, dormant } };
    }),

  movePurePlayDormantToQueue: (id) =>
    set((state:any) => {
      const pp = state.purePlay as PurePlayState;
      const item = pp.dormant.find((x:PurePlayItem) => x.id === id);
      if (!item) return { purePlay: pp };
      const dormant = pp.dormant.filter((x:PurePlayItem) => x.id !== id);
      const queue = [...pp.queue, item].sort((a, b) => {
        const sa = (a.J ?? 0) + (a.R ?? 0) + (a.N ?? 0);
        const sb = (b.J ?? 0) + (b.R ?? 0) + (b.N ?? 0);
        if (sb !== sa) return sb - sa;
        return a.name.localeCompare(b.name);
      });
      return { purePlay: { ...pp, queue, dormant } };
    }),
});
