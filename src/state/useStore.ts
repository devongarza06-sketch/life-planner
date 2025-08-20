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
const clamp01to59 = (n:number) => Math.max(1, Math.min(59, Math.round(n)));

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
  // person (shared across sections for now)
  "person-13": { active: 1, incubating: 3 }
};

// week key helper (ISO week-like, simplified)
function getWeekKey(d = new Date()): string {
  const dt = new Date(d);
  const onejan = new Date(dt.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((dt.getTime() - onejan.getTime()) / 86400000) + 1;
  const week = Math.ceil((dayOfYear + ((onejan.getDay() + 6) % 7)) / 7);
  return `${dt.getFullYear()}-${String(week).padStart(2, "0")}`;
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

  /** Tab-level selection (passion, play). Person uses selectedPerson by section. */
  selected: Record<TabId, string | null>;
  /** Person section-level selection: keys are 'physical'|'cognitive'|'emotional'|'social'|'meaning'. */
  selectedPerson: Record<string, string | null>;

  /** Vision ownership: which tab a vision belongs to (unchanged). */
  visionTab: Record<string, TabId | undefined>;
  /** NEW: which person section a vision belongs to (only for tab='person') */
  visionSection: Record<string, string | undefined>;

  // UI state for edit modals
  openRubricForGoalId: string | null;
  setOpenRubricForGoalId: (id: string | null) => void;
  openActive13ForGoalId: string | null;
  setOpenActive13ForGoalId: (id: string | null) => void;

  // Planner instances (per week)
  plannerActions: PlannerAction[];

  /** Now accepts optional sectionKey for person tab. */
  visibleVisionsForTab: (tab: TabId, sectionKey?: string) => Vision[];
  goalsForDirection: (directionId: string) => GoalNode[];

  updateBudget: (idx: number, value: number) => void;
  moveBoardCard: (cardId: string, status: BoardStatus) => void;

  // directions
  /** If tab==='person', sectionKey scopes the selection. */
  selectDirection: (tab: TabId, directionId: string | null, sectionKey?: string) => void;
  /** If tab==='person', sectionKey assigns the new vision to that section. */
  addDirection: (tab: TabId, label?: string, sectionKey?: string) => string;
  removeDirection: (tab: TabId, directionId: string) => void;
  updateVision: (directionId: string, patch: Partial<Vision>) => void;

  // goals & boards
  updateGoal: (id: string, patch: Partial<GoalNode>) => void;
  addChildGoal: (parentId: string, title?: string) => string;
  addSiblingGoal: (nodeId: string, title?: string) => string;
  removeGoalCascade: (id: string) => void;

  upsertBoardForGoal: (goalId: string) => void;
  rebalanceBoard: (tab: TabId, horizon: Horizon) => void;

  // planner API
  generatePlannerActionsForWeek: (weekKey?: string) => void;
  movePlannerAction: (id: string, upd: Partial<Pick<PlannerAction, "day"|"start"|"order">>) => void;
  updatePlannerAction: (id: string, patch: Partial<PlannerAction>) => void;
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

  // UI state
  openRubricForGoalId: null,
  setOpenRubricForGoalId: (id) => set(() => ({ openRubricForGoalId: id })),
  openActive13ForGoalId: null,
  setOpenActive13ForGoalId: (id) => set(() => ({ openActive13ForGoalId: id })),

  // planner
  plannerActions: [],

  visibleVisionsForTab: (tab, sectionKey) => {
    const { visions, goals, visionTab, visionSection } = get();

    // Explicitly assigned to tab (+section for person)
    const explicit = visions.filter((v) => {
      if (visionTab[v.id] !== tab) return false;
      if (tab === "person" && sectionKey) return visionSection[v.id] === sectionKey;
      if (tab === "person" && !sectionKey) return false; // person always needs section scoping
      return true;
    });

    // Inferred (has any goal under tab and (if person) section)
    const inferred = visions.filter((v) => {
      const byTab = goals.some((g) => g.directionId === v.id && g.tabId === tab);
      if (!byTab) return false;
      if (tab !== "person") return true;
      if (!sectionKey) return false;
      // infer section if any child goal has a tag we can’t know; we rely on explicit section assignment
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

      // also remove any boards belonging to that direction's tab (safe coarse cleanup)
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
      boards: state.boards.filter((b) => !toDelete.has(b.id)), // board id = goalId
      plannerActions: state.plannerActions.filter((p) => !toDelete.has(p.goalId)),
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

    // Upsert
    const nextCard: BoardCard = {
      id: goalId, // 1:1 mapping
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

    // rebalance
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

  // ---------- planner ----------
  generatePlannerActionsForWeek: (weekKey) => {
    const wk = weekKey || getWeekKey();
    const { boards, goals } = get();

    // Only active 1–3 items
    const active13 = boards.filter(b => b.tabId.endsWith("-13") && b.status === "active");

    const newly: PlannerAction[] = [];
    for (const card of active13) {
      const g = goals.find(x => x.id === card.id);
      if (!g || !g.actionsTemplate || g.actionsTemplate.length === 0) continue;

      for (const t of g.actionsTemplate) {
        if (t.mode === "specific") {
          if (t.durationMin && typeof t.day === "number") {
            newly.push({
              id: uid(),
              weekKey: wk,
              goalId: g.id,
              templateKey: t.key,
              label: t.label,
              day: t.day,
              durationMin: clamp01to59(t.durationMin),
              start: t.start ?? null,
              ifThenYet: t.ifThenYet,
              rationale: t.rationale,
              order: 0,
              fixed: !!t.start, // SPECIFIC with explicit time => fixed
            });
          }
          continue;
        }
        // frequency
        if (t.mode === "frequency" && t.durationMin && (t.frequencyPerWeek || 0) > 0) {
          const freq = Math.max(1, Math.min(7, Math.round(t.frequencyPerWeek as number)));
          let days = (t.preferredDays && t.preferredDays.length)
            ? t.preferredDays.slice(0)
            : [1,3,5,0,2,4,6]; // M/W/F bias then others
          // expand/cycle to freq
          const picks: number[] = [];
          let i = 0;
          while (picks.length < freq) {
            picks.push(days[i % days.length] as number);
            i++;
          }
          for (const d of picks) {
            newly.push({
              id: uid(),
              weekKey: wk,
              goalId: g.id,
              templateKey: t.key,
              label: t.label,
              day: (d as 0|1|2|3|4|5|6),
              durationMin: clamp01to59(t.durationMin),
              start: t.preferredStart ?? null,
              ifThenYet: t.ifThenYet,
              rationale: t.rationale,
              order: 0,
              fixed: false, // FREQUENCY items are floating even if preferredStart exists
            });
          }
        }
      }
    }

    // Remove any existing instances for this week (re-gen fresh)
    set((s) => ({
      plannerActions: [
        ...s.plannerActions.filter(p => p.weekKey !== wk),
        ...newly
      ]
    }));
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
