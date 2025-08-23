import type { StateCreator, StoreApi } from "zustand";
import type { PlannerAction, ActionTemplate } from "@/domain/types";
import { clamp1to1440, getWeekKey } from "../utils/time";
import { uid } from "../constants";

export type SystemItem = {
  id: string;
  title: string;
  status: "active" | "dormant";
  actions: ActionTemplate[];
};

type Slice = {
  systems: SystemItem[];
  addSystem: (title?: string) => string;
  updateSystem: (id: string, patch: Partial<Omit<SystemItem, "id">>) => void;
  removeSystem: (id: string) => void;

  addSystemAction: (systemId: string) => void;
  updateSystemAction: (systemId: string, key: string, patch: Partial<ActionTemplate>) => void;
  removeSystemAction: (systemId: string, key: string) => void;

  scheduleSystemToWeek: (systemId: string, weekKey?: string) => { created: number };
};

export const createSystemsSlice: StateCreator<any, [], [], Slice> = (set, get, _api: StoreApi<any>) => ({
  systems: [],

  addSystem: (title = "New system") => {
    const id = uid();
    set((s:any) => ({
      systems: [{ id, title, status: "active", actions: [] }, ...s.systems]
    }));
    return id;
  },

  updateSystem: (id, patch) =>
    set((s:any) => {
      // If flipping to dormant, clear any scheduled planner rows for this system.
      const goingDormant = patch.status === "dormant";
      const systems = s.systems.map((it: SystemItem) => it.id === id ? { ...it, ...patch } : it);
      const plannerActions = goingDormant
        ? s.plannerActions.filter((p: PlannerAction) => p.goalId !== `system:${id}`)
        : s.plannerActions;
      return { systems, plannerActions };
    }),

  removeSystem: (id) =>
    set((s:any) => ({
      systems: s.systems.filter((it: SystemItem) => it.id !== id),
      // Purge any scheduled items tied to this system
      plannerActions: s.plannerActions.filter((p: PlannerAction) => p.goalId !== `system:${id}`)
    })),

  addSystemAction: (systemId) =>
    set((s:any) => ({
      systems: s.systems.map((it: SystemItem) => {
        if (it.id !== systemId) return it;
        const key = uid();
        const next: ActionTemplate = {
          key,
          label: "New action",
          durationMin: 30,
          mode: "specific",
          day: 1,
          start: null,
          frequencyPerWeek: undefined,
          preferredDays: undefined,
        };
        return { ...it, actions: [...(it.actions||[]), next] };
      })
    })),

  updateSystemAction: (systemId, key, patch) =>
    set((s:any) => ({
      systems: s.systems.map((it: SystemItem) => {
        if (it.id !== systemId) return it;
        return {
          ...it,
          actions: (it.actions || []).map(a => a.key === key ? { ...a, ...patch } : a)
        };
      })
    })),

  removeSystemAction: (systemId, key) =>
    set((s:any) => {
      // Remove the action from the system and also sweep planner entries for the same template.
      const systems = s.systems.map((it: SystemItem) => {
        if (it.id !== systemId) return it;
        return { ...it, actions: (it.actions || []).filter(a => a.key !== key) };
      });
      const plannerActions = s.plannerActions.filter(
        (p: PlannerAction) => !(p.goalId === `system:${systemId}` && p.templateKey === key)
      );
      return { systems, plannerActions };
    }),

  scheduleSystemToWeek: (systemId, weekKey) => {
    const wk = weekKey || getWeekKey();
    const s = get();
    const sys = s.systems.find((x: SystemItem) => x.id === systemId);
    if (!sys) return { created: 0 };

    const snap = s.settings?.snapMinutes || 15;
    const place = (day: 0|1|2|3|4|5|6, durationMin: number, hint: string|null, fixed: boolean) => {
      const start = s.findNextFreeSlot(day, hint ?? "05:00", durationMin, "down", snap);
      return { start, fixed };
    };

    let created = 0;

    for (const t of (sys.actions || [])) {
      const dur = clamp1to1440(t.durationMin || 0);
      if (!dur) continue;

      if (t.mode === "specific") {
        if (typeof t.day !== "number") continue;
        const d = t.day as 0|1|2|3|4|5|6;
        const placed = t.start ? { start: t.start, fixed: true } : place(d, dur, null, false);
        const action: PlannerAction = {
          id: uid(),
          weekKey: wk,
          goalId: `system:${sys.id}`,
          templateKey: t.key,
          label: t.label,
          day: d,
          durationMin: dur,
          start: placed.start,
          order: 0,
          fixed: placed.fixed,
          // PlannerAction.source supports "goal" | "pureplay" | "manual".
          // We use "manual" for systems.
          source: "manual",
        };
        set((st:any) => ({ plannerActions: [...st.plannerActions, action] }));
        created++;
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
          const placed = place(d as any, dur, null, false);
          const action: PlannerAction = {
            id: uid(),
            weekKey: wk,
            goalId: `system:${sys.id}`,
            templateKey: t.key,
            label: t.label,
            day: d as any,
            durationMin: dur,
            start: placed.start,
            order: 0,
            fixed: false,
            source: "manual",
          };
          set((st:any) => ({ plannerActions: [...st.plannerActions, action] }));
          created++;
        }
      }
    }
    return { created };
  },
});
