import type { StateCreator, StoreApi } from "zustand";
import type { GoalNode, TabId } from "@/domain/types";
import { boardKey, CAPS } from "../constants";
import type { Horizon, Rubric } from "../constants";
import { scoreFromInputs, type ScoreInputs } from "../utils/score";

type Slice = {
  moveBoardCard: (cardId: string, status: "active" | "incubating" | "dormant") => void;
  upsertBoardForGoal: (goalId: string) => void;
  rebalanceBoard: (tab: TabId, horizon: Horizon) => void;
};

export const createBoardsSlice: StateCreator<any, [], [], Slice> = (set, get, _api: StoreApi<any>) => ({
  moveBoardCard: (cardId, status) =>
    set((state:any) => ({
      boards: state.boards.map((c:any) => (c.id === cardId ? { ...c, status } : c)),
    })),

  upsertBoardForGoal: (goalId) => {
    const state = get();
    const g = state.goals.find((x:GoalNode) => x.id === goalId);
    if (!g) return;

    const h = g.horizon as Horizon | undefined;
    if (!h || h === "other") {
      set((s:any) => ({ boards: s.boards.filter((b:any) => b.id !== goalId) }));
      return;
    }

    if (g.tabId === "person" && h === "12+") {
      set((s:any) => ({ boards: s.boards.filter((b:any) => b.id !== goalId) }));
      return;
    }

    const key = boardKey(g.tabId as any, h);
    const rubric: Rubric =
      g.tabId === "passion" ? "IART+G" : g.tabId === "play" ? "JRN" : "UIE";

    const score = scoreFromInputs(g.rubricInputs as ScoreInputs | undefined);

    const nextCard = {
      id: goalId,
      tabId: key,
      status: "dormant" as const,
      title: g.title,
      score: typeof score === "number" ? score : undefined,
      rubric
    };

    set((s:any) => {
      const exists = s.boards.some((b:any) => b.id === goalId);
      const boards = exists
        ? s.boards.map((b:any) => (b.id === goalId ? { ...nextCard } : b))
        : [...s.boards, nextCard];
      return { boards };
    });

    get().rebalanceBoard(g.tabId, h);
  },

  rebalanceBoard: (tab, horizon) => {
    const key = boardKey(tab as any, horizon);
    const caps = CAPS[key];
    if (!caps) return;

    const items = get()
      .boards
      .filter((b:any) => b.tabId === key)
      .sort((a: { score?: number; title?: string }, b: { score?: number; title?: string }) => {
        const sa = typeof a.score === "number" ? a.score : -Infinity;
        const sb = typeof b.score === "number" ? b.score : -Infinity;
        if (sb !== sa) return sb - sa;
        return (a.title || "").localeCompare(b.title || "");
      });

    const active = items.slice(0, caps.active);
    const incubating = items.slice(caps.active, caps.active + caps.incubating);
    const dormant = items.slice(caps.active + caps.incubating);

    set((state:any) => ({
      boards: state.boards.map((b:any) => {
        if (b.tabId !== key) return b;
        if (active.find((x:any) => x.id === b.id)) return { ...b, status: "active" };
        if (incubating.find((x:any) => x.id === b.id)) return { ...b, status: "incubating" };
        if (dormant.find((x:any) => x.id === b.id)) return { ...b, status: "dormant" };
        return b;
      })
    }));
  },
});
