import type { StateCreator } from "zustand";
import type { Vision, GoalNode, TabId } from "@/domain/types";
import { uid } from "../constants";

type Slice = {
  visibleVisionsForTab: (tab: TabId, sectionKey?: string) => Vision[];
  goalsForDirection: (directionId: string) => GoalNode[];

  selectDirection: (tab: TabId, directionId: string | null, sectionKey?: string) => void;
  addDirection: (tab: TabId, label?: string, sectionKey?: string) => string;
  removeDirection: (tab: TabId, directionId: string) => void;
  updateVision: (directionId: string, patch: Partial<Vision>) => void;

  updateGoal: (id: string, patch: Partial<GoalNode>) => void;
  addChildGoal: (parentId: string, title?: string) => string;
  addSiblingGoal: (nodeId: string, title?: string) => string;
  removeGoalCascade: (id: string) => void;
};

export const createGoalsSlice: StateCreator<any, [], [], Slice> = (set, get) => ({
  visibleVisionsForTab: (tab, sectionKey) => {
    const { visions, goals, visionTab, visionSection } = get();
    const explicit = visions.filter((v:Vision) => {
      if (visionTab[v.id] !== tab) return false;
      if (tab === "person" && sectionKey) return visionSection[v.id] === sectionKey;
      if (tab === "person" && !sectionKey) return false;
      return true;
    });
    const inferred = visions.filter((v:Vision) => {
      const byTab = goals.some((g:GoalNode) => g.directionId === v.id && g.tabId === tab);
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
    get().goals.filter((g:GoalNode) => g.directionId === directionId),

  selectDirection: (tab, directionId, sectionKey) =>
    set((state:any) => {
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
    set((state:any) => {
      const next: any = {
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
      return next;
    });
    return id;
  },

  removeDirection: (tab, directionId) =>
    set((state:any) => {
      const visions = state.visions.filter((v:Vision) => v.id !== directionId);
      const goals = state.goals.filter((g:GoalNode) => g.directionId !== directionId);
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

      const boards = state.boards.filter((b:any) => !b.tabId.startsWith(tab));

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
    set((state:any) => ({
      visions: state.visions.map((v:Vision) => (v.id === directionId ? { ...v, ...patch } : v)),
    })),

  updateGoal: (id, patch) =>
    set((state:any) => ({
      goals: state.goals.map((g:GoalNode) => (g.id === id ? { ...g, ...patch } : g)),
    })),

  addChildGoal: (parentId, title = "New sub‑goal") => {
    const parent = get().goals.find((g:GoalNode) => g.id === parentId);
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
    set((state:any) => ({ goals: [...state.goals, node] }));
    return id;
  },

  addSiblingGoal: (nodeId, title = "New peer goal") => {
    const node = get().goals.find((g:GoalNode) => g.id === nodeId);
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
    set((state:any) => ({ goals: [...state.goals, peer] }));
    return id;
  },

  removeGoalCascade: (id) => {
    const all = get().goals as GoalNode[];
    const childrenOf = (pid: string | null | undefined) => all.filter((g) => g.parentId === pid);
    const toDelete = new Set<string>();
    const walk = (nid: string) => {
      toDelete.add(nid);
      childrenOf(nid).forEach((c) => walk(c.id));
    };
    walk(id);

    set((state:any) => ({
      goals: state.goals.filter((g:GoalNode) => !toDelete.has(g.id)),
      boards: state.boards.filter((b:any) => !toDelete.has(b.id)),
      plannerActions: state.plannerActions.filter((p:any) => !toDelete.has(p.goalId)),
    }));
  },
});
