"use client";
import { create } from "zustand";
import {
  BoardCard, BoardStatus, Budget, GoalNode, Task, Vision, UserPrefs, PlannerSettings, TabId
} from "@/domain/types";
import {
  seedBoards, seedBudgets, seedGoals, seedTasks, seedVisions, seedPrefs, seedSettings
} from "@/domain/sample-data";

// ---------- helpers ----------
const uid = () => Math.random().toString(36).slice(2, 10);

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

// Board keys: tab + horizon
function boardKey(tab: TabId, horizon: Horizon): string {
  if (horizon === "12+") return `${tab}-annual`;
  if (horizon === "1-3") return `${tab}-13`;
  return `${tab}-other`; // shouldn't be placed, but key maintained
}

// Caps per board
const CAPS: Record<string, { active: number; incubating: number }> = {
  // passion
  "passion-annual": { active: 3, incubating: 3 },
  "passion-13": { active: 3, incubating: 3 },
  // play
  "play-annual": { active: 3, incubating: 3 },
  "play-13": { active: 1, incubating: 3 },
  // person
  "person-13": { active: 1, incubating: 3 }
};

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
  visionTab: Record<string, TabId | undefined>;

  visibleVisionsForTab: (tab: TabId) => Vision[];
  goalsForDirection: (directionId: string) => GoalNode[];

  // existing
  updateBudget: (idx: number, value: number) => void;
  moveBoardCard: (cardId: string, status: BoardStatus) => void;

  // directions
  selectDirection: (tab: TabId, directionId: string | null) => void;
  addDirection: (tab: TabId, label?: string) => string;
  removeDirection: (tab: TabId, directionId: string) => void;
  updateVision: (directionId: string, patch: Partial<Vision>) => void;

  // goals & boards
  updateGoal: (id: string, patch: Partial<GoalNode>) => void;
  addChildGoal: (parentId: string, title?: string) => string;
  addSiblingGoal: (nodeId: string, title?: string) => string;
  removeGoalCascade: (id: string) => void;

  // NEW: update timeline/rubric for a goal and ensure AID board item
  upsertBoardForGoal: (goalId: string) => void;
  rebalanceBoard: (tab: TabId, horizon: Horizon) => void;
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
    const newRoot: GoalNode = {
      id: uid(),
      tabId: tab,
      directionId: id,
      parentId: null,
      type: "northStar",
      title: label,
      // NEW default fields
      horizon: "other",
      rubric: undefined,
      rubricInputs: undefined,
    };
    set((state) => ({
      visions: [newVision, ...state.visions],
      visionTab: { ...state.visionTab, [id]: tab },
      selected: { ...state.selected, [tab]: id },
      goals: [newRoot, ...state.goals],
    }));
    return id;
  },

  removeDirection: (tab, directionId) =>
    set((state) => {
      const visions = state.visions.filter((v) => v.id !== directionId);
      const goals = state.goals.filter((g) => g.directionId !== directionId);
      const visionTab = { ...state.visionTab };
      delete visionTab[directionId];
      const wasSelected = state.selected[tab] === directionId;

      // also remove any boards belonging to that direction's tab (safe coarse cleanup)
      const boards = state.boards.filter((b) => !b.tabId.startsWith(tab));

      return {
        visions,
        goals,
        visionTab,
        boards,
        selected: { ...state.selected, [tab]: wasSelected ? null : state.selected[tab] },
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
      boards: state.boards.filter((b) => !toDelete.has(b.id)), // we’ll store board id = goalId
    }));
  },

  upsertBoardForGoal: (goalId) => {
    const state = get();
    const g = state.goals.find((x) => x.id === goalId);
    if (!g) return;

    const h = g.horizon as Horizon | undefined;
    if (!h || h === "other") {
      // remove board item if exists
      set((s) => ({ boards: s.boards.filter((b) => b.id !== goalId) }));
      return;
    }

    // Person has no annual board
    if (g.tabId === "person" && h === "12+") {
      set((s) => ({ boards: s.boards.filter((b) => b.id !== goalId) }));
      return;
    }

    const key = boardKey(g.tabId, h);
    const rubric: Rubric =
      g.tabId === "passion" ? "IART+G" : g.tabId === "play" ? "JRN" : "UIE";

    const score = scoreFromInputs(g.rubricInputs as ScoreInputs | undefined);

    // Upsert with '?' score if undefined
    const nextCard: BoardCard = {
      id: goalId, // 1:1 mapping for simplicity
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

    // after upsert + (optional) score -> rebalance
    get().rebalanceBoard(g.tabId, h);
  },

  rebalanceBoard: (tab, horizon) => {
    const key = boardKey(tab, horizon);
    const caps = CAPS[key];
    if (!caps) return;

    // Sort by score desc (undefined score at bottom)
    const items = get()
      .boards
      .filter((b) => b.tabId === key)
      .sort((a, b) => {
        const sa = typeof a.score === "number" ? a.score : -Infinity;
        const sb = typeof b.score === "number" ? b.score : -Infinity;
        if (sb !== sa) return sb - sa;
        // tie-breaker: existing status then title
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
}));
