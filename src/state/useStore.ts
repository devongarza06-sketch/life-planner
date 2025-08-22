"use client";
import { create } from "zustand";
import {
  BoardCard, BoardStatus, Budget, GoalNode, Task, Vision, UserPrefs, PlannerSettings, TabId,
  PlannerAction, ActionTemplate
} from "@/domain/types";
import {
  seedBoards, seedBudgets, seedGoals, seedTasks, seedVisions, seedPrefs, seedSettings
} from "@/domain/sample-data";

import { createPurePlaySlice } from "./slices/purePlay.slice";
import { createGoalsSlice } from "./slices/goals.slice";
import { createBoardsSlice } from "./slices/boards.slice";
import { createPlannerSlice } from "./slices/planner.slice";
import type { Horizon, Rubric } from "./constants";
import type { ScoreInputs } from "./utils/score";
import type { PurePlayItem, PurePlayPlan, PurePlayState } from "./pureplay.types";

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
};

// Re-export types to preserve public API
export type { PurePlayItem, PurePlayPlan } from "./pureplay.types";

// IMPORTANT: include the 3rd argument `api` and pass it to slices
export const useStore = create<Store>()((set, get, api) => ({
  // ----- Core seeds & simple UI state (unchanged behavior) -----
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

  // ----- Merge feature slices (now with api) -----
  ...createPurePlaySlice(set, get, api),
  ...createGoalsSlice(set, get, api),
  ...createBoardsSlice(set, get, api),
  ...createPlannerSlice(set, get, api),

  // ----- Budget update stays local (simple) -----
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
}));
