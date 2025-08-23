// src/state/useStore.ts
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  BoardCard, BoardStatus, Budget, GoalNode, Task, Vision, UserPrefs, PlannerSettings, TabId,
  PlannerAction
} from "@/domain/types";
import {
  seedBoards, seedBudgets, seedGoals, seedTasks, seedVisions, seedPrefs, seedSettings
} from "@/domain/sample-data";

import { createPurePlaySlice } from "./slices/purePlay.slice";
import { createGoalsSlice } from "./slices/goals.slice";
import { createBoardsSlice } from "./slices/boards.slice";
import { createPlannerSlice } from "./slices/planner.slice";
import type { Horizon } from "./constants";
import type { PurePlayItem, PurePlayPlan, PurePlayState } from "./pureplay.types";
import { createSystemsSlice } from "./slices/systems.slice";
import { createProjectsSlice } from "./slices/projects.slice";
import { demoData } from "./fixtures/demo";

// -------- Store type (public surface stays the same) --------
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
  consumeTokenAndScheduleFeature: (plan: PurePlayPlan) => { ok: boolean; reason?: string; usedId?: string };
  updatePurePlayItem: (id: string, patch: Partial<PurePlayItem>) => void;
  movePurePlayDormantToQueue: (id: string) => void;

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

  isSlotFree: (day: 0|1|2|3|4|5|6, startHHMM: string, durationMin: number, excludeId?: string) => boolean;
  findNextFreeSlot: (
    day: 0|1|2|3|4|5|6,
    startHHMM: string,
    durationMin: number,
    direction: "down" | "up",
    snap?: number,
    excludeId?: string
  ) => string;

  // --- Systems ---
  systems: import("./slices/systems.slice").SystemItem[];
  addSystem: (title?: string) => string;
  updateSystem: (id: string, patch: Partial<Omit<import("./slices/systems.slice").SystemItem, "id">>) => void;
  removeSystem: (id: string) => void;
  addSystemAction: (systemId: string) => void;
  updateSystemAction: (systemId: string, key: string, patch: Partial<import("@/domain/types").ActionTemplate>) => void;
  removeSystemAction: (systemId: string, key: string) => void;
  scheduleSystemToWeek: (systemId: string, weekKey?: string) => { created: number };

  // --- Projects ---
  projects: import("./slices/projects.slice").Project[];
  addProject: (title?: string) => string;
  updateProject: (id: string, patch: Partial<Omit<import("./slices/projects.slice").Project, "id">>) => void;
  removeProject: (id: string) => void;
  addStep: (projectId: string, title?: string) => string;
  updateStep: (projectId: string, stepId: string, patch: Partial<import("./slices/projects.slice").ProjectStep>) => void;
  removeStep: (projectId: string, stepId: string) => void;
  addStepAction: (projectId: string, stepId: string) => void;
  updateStepAction: (projectId: string, stepId: string, key: string, patch: Partial<import("@/domain/types").ActionTemplate>) => void;
  removeStepAction: (projectId: string, stepId: string, key: string) => void;
  scheduleProjectToWeek: (projectId: string, weekKey?: string) => { created: number };
  scheduleStepToWeek: (projectId: string, stepId: string, weekKey?: string) => { created: number };

  // --- Persistence helpers ---
  loadDemo: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => { ok: boolean; error?: string };
  resetAll: () => void;
};

// Re-export
export type { PurePlayItem, PurePlayPlan } from "./pureplay.types";

// Guarded storage for Next.js (no SSR access to localStorage)
const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") return undefined as unknown as Storage;
  return window.localStorage;
});

// IMPORTANT: we wrap with persist and keep the same API
export const useStore = create<Store>()(
  persist(
    (set, get, api) => ({
      // ----- Core seeds -----
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

      // ----- Feature slices -----
      ...createPurePlaySlice(set, get, api),
      ...createGoalsSlice(set, get, api),
      ...createBoardsSlice(set, get, api),
      ...createPlannerSlice(set, get, api),
      ...createSystemsSlice(set, get, api),
      ...createProjectsSlice(set, get, api),

      // ----- Budget update (unchanged) -----
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

      // ----- Persistence helpers -----
      loadDemo: () => {
        const demo = demoData();
        // merge without nuking your existing seeds
        set((s) => ({
          systems: demo.systems.concat(s.systems ?? []),
          projects: demo.projects.concat(s.projects ?? []),
          purePlay: {
            ...s.purePlay,
            queue: (s.purePlay?.queue ?? []).concat(demo.purePlayQueue),
          },
        }));
      },

      exportJSON: () => {
        const s = get();
        const data = {
          budgets: s.budgets,
          visions: s.visions,
          goals: s.goals,
          boards: s.boards,
          tasks: s.tasks,
          prefs: s.prefs,
          settings: s.settings,
          selected: s.selected,
          selectedPerson: s.selectedPerson,
          visionTab: s.visionTab,
          visionSection: s.visionSection,
          plannerActions: s.plannerActions,
          purePlay: s.purePlay,
          systems: (s as any).systems ?? [],
          projects: (s as any).projects ?? [],
        };
        return JSON.stringify(data, null, 2);
      },

      importJSON: (json: string) => {
        try {
          const data = JSON.parse(json);
          set(() => ({
            budgets: data.budgets ?? seedBudgets,
            visions: data.visions ?? seedVisions,
            goals: data.goals ?? seedGoals,
            boards: data.boards ?? seedBoards,
            tasks: data.tasks ?? seedTasks,
            prefs: data.prefs ?? seedPrefs[0],
            settings: data.settings ?? seedSettings[0],
            selected: data.selected ?? { passion: null, person: null, play: null },
            selectedPerson: data.selectedPerson ?? { physical: null, cognitive: null, emotional: null, social: null, meaning: null },
            visionTab: data.visionTab ?? {},
            visionSection: data.visionSection ?? {},
            plannerActions: data.plannerActions ?? [],
            purePlay: data.purePlay ?? get().purePlay,
            systems: data.systems ?? (get() as any).systems ?? [],
            projects: data.projects ?? (get() as any).projects ?? [],
          }));
          return { ok: true };
        } catch (e:any) {
          return { ok: false, error: e?.message || "Invalid JSON" };
        }
      },

      resetAll: () => {
        set(() => ({
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
          plannerActions: [],
          // leave slices to their own initializers
          ...(createPurePlaySlice as any)((x:any)=>x, ()=>({}), {}), // no-op; we keep current purePlay
        }));
        // Also wipe the persisted storage key so a reload starts clean
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("life-planner");
        }
      },
    }),
    {
      name: "life-planner",
      version: 1,
      storage: safeStorage,
      // Persist only user-ish state
      partialize: (s: Store) => ({
        budgets: s.budgets,
        visions: s.visions,
        goals: s.goals,
        boards: s.boards,
        tasks: s.tasks,
        prefs: s.prefs,
        settings: s.settings,
        selected: s.selected,
        selectedPerson: s.selectedPerson,
        visionTab: s.visionTab,
        visionSection: s.visionSection,
        plannerActions: s.plannerActions,
        purePlay: s.purePlay,
        systems: (s as any).systems ?? [],
        projects: (s as any).projects ?? [],
      }),
      migrate: (persisted, from) => {
        // Simple forward-compatible migration
        if (!persisted) return persisted as any;
        if (from < 1) {
          // future migrations
        }
        return persisted as any;
      },
    }
  )
);
