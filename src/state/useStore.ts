"use client";
import { create } from "zustand";
import {
  BoardCard, BoardStatus, Budget, GoalNode, Task, Vision, UserPrefs, PlannerSettings, TabId
} from "@/domain/types";
import {
  seedBoards, seedBudgets, seedGoals, seedTasks, seedVisions, seedPrefs, seedSettings
} from "@/domain/sample-data";

const uid = () => Math.random().toString(36).slice(2, 10);

type Store = {
  budgets: Budget[];
  visions: Vision[];
  goals: GoalNode[];
  boards: BoardCard[];
  tasks: Task[];
  prefs: UserPrefs;
  settings: PlannerSettings;

  /** selections per tab */
  selected: Record<TabId, string | null>;
  /** registry for new directions created per tab */
  visionTab: Record<string, TabId | undefined>;

  /** selectors */
  visibleVisionsForTab: (tab: TabId) => Vision[];
  goalsForDirection: (directionId: string) => GoalNode[];

  /** existing actions */
  updateBudget: (idx: number, value: number) => void;
  moveBoardCard: (cardId: string, status: BoardStatus) => void;

  /** vision/direction actions */
  selectDirection: (tab: TabId, directionId: string | null) => void;
  addDirection: (tab: TabId, label?: string) => string;
  removeDirection: (tab: TabId, directionId: string) => void;
  updateVision: (directionId: string, patch: Partial<Pick<Vision,
    "label" | "legacyText" | "legacyValues" | "personalText" | "personalValues">>) => void;

  /** goal authoring actions */
  updateGoal: (id: string, patch: Partial<Pick<GoalNode, "title" | "smartier" | "lead" | "lag" | "type">>) => void;
  addChildGoal: (parentId: string, title?: string) => string;
  addSiblingGoal: (nodeId: string, title?: string) => string;
  /** NEW: delete a goal and all of its descendants */
  removeGoalCascade: (id: string) => void;
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
  visionTab: {},

  visibleVisionsForTab: (tab) => {
    const { visions, goals, visionTab } = get();
    const explicit = visions.filter((v) => visionTab[v.id] === tab);
    const inferred = visions.filter((v) =>
      goals.some((g) => g.directionId === v.id && g.tabId === tab)
    );
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

  selectDirection: (tab, directionId) =>
    set((state) => ({ selected: { ...state.selected, [tab]: directionId } })),

  addDirection: (tab, label = "New direction") => {
    const id = uid();
    const newVision: Vision = {
      id,
      label,
      legacyText: "",
      legacyValues: [],
      personalText: "",
      personalValues: [],
    };
    set((state) => ({
      visions: [newVision, ...state.visions],
      visionTab: { ...state.visionTab, [id]: tab },
      selected: { ...state.selected, [tab]: id },
    }));
    // create root goal
    const newRoot: GoalNode = {
      id: uid(),
      tabId: tab,
      directionId: id,
      parentId: null,
      type: "northStar",
      title: label,
    };
    set((state) => ({ goals: [newRoot, ...state.goals] }));
    return id;
  },

  removeDirection: (tab, directionId) =>
    set((state) => {
      const visions = state.visions.filter((v) => v.id !== directionId);
      const goals = state.goals.filter((g) => g.directionId !== directionId);
      const visionTab = { ...state.visionTab };
      delete visionTab[directionId];
      const wasSelected = state.selected[tab] === directionId;
      return {
        visions,
        goals,
        visionTab,
        selected: { ...state.selected, [tab]: wasSelected ? null : state.selected[tab] },
      };
    }),

  updateVision: (directionId, patch) =>
    set((state) => ({
      visions: state.visions.map((v) => (v.id === directionId ? { ...v, ...patch } : v)),
    })),

  /** ------- Goal authoring ------- */
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
    };
    set((state) => ({ goals: [...state.goals, node] }));
    return id;
  },

  addSiblingGoal: (nodeId, title = "New peer goal") => {
    const node = get().goals.find((g) => g.id === nodeId);
    if (!node || node.parentId == null) return ""; // no siblings for root
    const id = uid();
    const peer: GoalNode = {
      id,
      tabId: node.tabId,
      directionId: node.directionId,
      parentId: node.parentId,
      type: "goal",
      title,
    };
    set((state) => ({ goals: [...state.goals, peer] }));
    return id;
  },

  /** Delete node and all descendants */
  removeGoalCascade: (id) => {
    const all = get().goals;
    const childrenOf = (pid: string | null | undefined) =>
      all.filter((g) => g.parentId === pid);

    // collect ids to delete
    const toDelete = new Set<string>();
    const walk = (nid: string) => {
      toDelete.add(nid);
      childrenOf(nid).forEach((c) => walk(c.id));
    };
    walk(id);

    set((state) => ({
      goals: state.goals.filter((g) => !toDelete.has(g.id)),
    }));
  },
}));
