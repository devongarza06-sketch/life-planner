import type { StateCreator, StoreApi } from "zustand";
import type { PlannerAction } from "@/domain/types";
import { getWeekKey, timeToMin, minToTime, clamp1to1440 } from "../utils/time";

type Slice = {
  isSlotFree: (day: 0|1|2|3|4|5|6, startHHMM: string, durationMin: number, excludeId?: string) => boolean;
  findNextFreeSlot: (
    day: 0|1|2|3|4|5|6,
    startHHMM: string,
    durationMin: number,
    direction: "down" | "up",
    snap?: number,
    excludeId?: string
  ) => string;

  generatePlannerActionsForWeek: (weekKey?: string) => void;
  movePlannerAction: (id: string, upd: Partial<Pick<PlannerAction, "day"|"start"|"order">>) => void;
  updatePlannerAction: (id: string, patch: Partial<PlannerAction>) => void;
};

export const createPlannerSlice: StateCreator<any, [], [], Slice> = (set, get, _api: StoreApi<any>) => ({
  // ---------- SLOT HELPERS ----------
  isSlotFree: (day, startHHMM, durationMin, excludeId) => {
    const start = timeToMin(startHHMM);
    const end = start + Math.max(1, durationMin);
    const { plannerActions } = get();
    const sameDay = plannerActions.filter((a:PlannerAction) => a.day === day && a.id !== excludeId);
    return !sameDay.some((a:PlannerAction) => {
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

    const intervals: [number, number][] = plannerActions
      .filter((a:PlannerAction) => a.day === day && a.id !== excludeId && a.start)
      .map((a:PlannerAction) => {
        const s = timeToMin(a.start as string);
        return [s, s + Math.max(1, a.durationMin)] as [number, number];
      })
      .sort((a: [number, number], b: [number, number]) => a[0]-b[0]);

    const collides = (m:number) => {
      const start = m, end = m + dur;
      return intervals.some(([s, e]: [number, number]) => !(end <= s || start >= e));
    };

    if (!collides(cur)) return minToTime(cur);

    if (direction === "down") {
      while (true) {
        let bumped = false;
        for (const [s, e] of intervals) {
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
          const [s, e] = intervals[i];
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
    const active13 = boards.filter((b:any) => b.tabId.endsWith("-13") && b.status === "active");

    for (const card of active13) {
      const g = goals.find((x:any) => x.id === card.id);
      if (!g || !g.actionsTemplate || g.actionsTemplate.length === 0) continue;

      for (const t of g.actionsTemplate as any[]) {
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

    const existingWeek = state.plannerActions.filter((p:PlannerAction) => p.weekKey === wk);
    const existingBySig = new Map<string, PlannerAction>();
    for (const a of existingWeek) {
      existingBySig.set(`${a.goalId}|${a.templateKey}|${a.day}`, a);
    }

    const next: PlannerAction[] = [];

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
        id: (Math.random().toString(36).slice(2,10)),
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

    set((s:any) => {
      const preserved = s.plannerActions.filter(
        (p:PlannerAction) => p.weekKey === wk && p.source && p.source !== 'goal'
      );
      const others = s.plannerActions.filter((p:PlannerAction) => p.weekKey !== wk);
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
    set((s:any) => ({
      plannerActions: s.plannerActions.map((p:PlannerAction) =>
        p.id === id ? { ...p, ...upd } : p
      ),
    })),

  updatePlannerAction: (id, patch) =>
    set((s:any) => ({
      plannerActions: s.plannerActions.map((p:PlannerAction) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),
});
