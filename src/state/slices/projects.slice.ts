import type { StateCreator, StoreApi } from "zustand";
import type { PlannerAction, ActionTemplate } from "@/domain/types";
import { clamp1to1440, getWeekKey } from "../utils/time";
import { uid } from "../constants";

export type ProjectStep = {
  id: string;
  title: string;
  actions: ActionTemplate[];
};

export type Project = {
  id: string;
  title: string;
  steps: ProjectStep[];
};

type Slice = {
  projects: Project[];
  addProject: (title?: string) => string;
  updateProject: (id: string, patch: Partial<Omit<Project, "id">>) => void;
  removeProject: (id: string) => void;

  addStep: (projectId: string, title?: string) => string;
  updateStep: (projectId: string, stepId: string, patch: Partial<ProjectStep>) => void;
  removeStep: (projectId: string, stepId: string) => void;

  addStepAction: (projectId: string, stepId: string) => void;
  updateStepAction: (projectId: string, stepId: string, key: string, patch: Partial<ActionTemplate>) => void;
  removeStepAction: (projectId: string, stepId: string, key: string) => void;

  scheduleProjectToWeek: (projectId: string, weekKey?: string) => { created: number };
  scheduleStepToWeek: (projectId: string, stepId: string, weekKey?: string) => { created: number };
};

export const createProjectsSlice: StateCreator<any, [], [], Slice> = (set, get, _api: StoreApi<any>) => ({
  projects: [],

  addProject: (title = "New mini‑project") => {
    const id = uid();
    set((s:any) => ({ projects: [{ id, title, steps: [] }, ...s.projects] }));
    return id;
  },

  updateProject: (id, patch) =>
    set((s:any) => ({
      projects: s.projects.map((p:Project) => p.id === id ? { ...p, ...patch } : p)
    })),

  removeProject: (id) =>
    set((s:any) => ({
      projects: s.projects.filter((p:Project) => p.id !== id),
      // Purge all scheduled rows tied to this project (all steps)
      plannerActions: s.plannerActions.filter(
        (a:PlannerAction) => !String(a.goalId).startsWith(`project:${id}:`)
      ),
    })),

  addStep: (projectId, title = "New step") => {
    const sid = uid();
    set((s:any) => ({
      projects: s.projects.map((p:Project) => {
        if (p.id !== projectId) return p;
        const step: ProjectStep = { id: sid, title, actions: [] };
        return { ...p, steps: [...p.steps, step] };
      })
    }));
    return sid;
  },

  updateStep: (projectId, stepId, patch) =>
    set((s:any) => ({
      projects: s.projects.map((p:Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          steps: p.steps.map(st => st.id === stepId ? { ...st, ...patch } : st)
        };
      })
    })),

  removeStep: (projectId, stepId) =>
    set((s:any) => ({
      projects: s.projects.map((p:Project) => {
        if (p.id !== projectId) return p;
        return { ...p, steps: p.steps.filter(st => st.id !== stepId) };
      }),
      // Purge scheduled rows tied to this step
      plannerActions: s.plannerActions.filter(
        (a:PlannerAction) => a.goalId !== `project:${projectId}:${stepId}`
      ),
    })),

  addStepAction: (projectId, stepId) =>
    set((s:any) => ({
      projects: s.projects.map((p:Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          steps: p.steps.map(st => {
            if (st.id !== stepId) return st;
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
            return { ...st, actions: [...st.actions, next] };
          })
        };
      })
    })),

  updateStepAction: (projectId, stepId, key, patch) =>
    set((s:any) => ({
      projects: s.projects.map((p:Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          steps: p.steps.map(st => {
            if (st.id !== stepId) return st;
            return {
              ...st,
              actions: st.actions.map(a => a.key === key ? { ...a, ...patch } : a)
            };
          })
        };
      })
    })),

  removeStepAction: (projectId, stepId, key) =>
    set((s:any) => {
      // Remove the template action and sweep scheduled rows for the same templateKey.
      const projects = s.projects.map((p:Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          steps: p.steps.map(st => {
            if (st.id !== stepId) return st;
            return { ...st, actions: st.actions.filter(a => a.key !== key) };
          })
        };
      });
      const plannerActions = s.plannerActions.filter(
        (a:PlannerAction) => !(a.goalId === `project:${projectId}:${stepId}` && a.templateKey === key)
      );
      return { projects, plannerActions };
    }),

  scheduleProjectToWeek: (projectId, weekKey) => {
    const p = get().projects.find((x:Project) => x.id === projectId);
    if (!p) return { created: 0 };
    let sum = 0;
    for (const st of p.steps) {
      const res = get().scheduleStepToWeek(projectId, st.id, weekKey);
      sum += res.created;
    }
    return { created: sum };
  },

  scheduleStepToWeek: (projectId, stepId, weekKey) => {
    const wk = weekKey || getWeekKey();
    const s = get();
    const p = s.projects.find((x:Project) => x.id === projectId);
    const step = p?.steps.find((x:ProjectStep) => x.id === stepId);
    if (!p || !step) return { created: 0 };

    const snap = s.settings?.snapMinutes || 15;
    const place = (day: 0|1|2|3|4|5|6, durationMin: number, hint: string|null, fixed: boolean) => {
      const start = s.findNextFreeSlot(day, hint ?? "05:00", durationMin, "down", snap);
      return { start, fixed };
    };

    let created = 0;

    for (const t of (step.actions || [])) {
      const dur = clamp1to1440(t.durationMin || 0);
      if (!dur) continue;

      if (t.mode === "specific") {
        if (typeof t.day !== "number") continue;
        const d = t.day as 0|1|2|3|4|5|6;
        const placed = t.start ? { start: t.start, fixed: true } : place(d, dur, null, false);
        const action: PlannerAction = {
          id: uid(),
          weekKey: wk,
          goalId: `project:${p.id}:${step.id}`,
          templateKey: t.key,
          label: `${p.title} — ${step.title}: ${t.label}`,
          day: d,
          durationMin: dur,
          start: placed.start,
          order: 0,
          fixed: placed.fixed,
          // Use "manual" to satisfy PlannerAction.source type.
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
            goalId: `project:${p.id}:${step.id}`,
            templateKey: t.key,
            label: `${p.title} — ${step.title}: ${t.label}`,
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
