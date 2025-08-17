"use client";
import { create } from "zustand";
import { BoardCard, BoardStatus, Budget, GoalNode, Task, Vision, UserPrefs, PlannerSettings } from "@/domain/types";
import { seedBoards, seedBudgets, seedGoals, seedTasks, seedVisions, seedPrefs, seedSettings } from "@/domain/sample-data";

type Store = {
  budgets: Budget[];
  visions: Vision[];
  goals: GoalNode[];
  boards: BoardCard[];
  tasks: Task[];
  prefs: UserPrefs;
  settings: PlannerSettings;

  updateBudget: (idx: number, value: number) => void;
  moveBoardCard: (cardId: string, status: BoardStatus) => void;
};

export const useStore = create<Store>((set, get) => ({
  budgets: seedBudgets,
  visions: seedVisions,
  goals: seedGoals,
  boards: seedBoards,
  tasks: seedTasks,
  prefs: seedPrefs[0],
  settings: seedSettings[0],

  updateBudget: (idx, value) =>
    set((state) => {
      const next = [...state.budgets];
      const b = { ...next[0], daily: [...next[0].daily] as [number,number,number,number] };
      b.daily[idx] = Math.max(0, Math.min(100, Math.round(value)));
      next[0] = b;
      return { budgets: next };
    }),

  moveBoardCard: (cardId, status) =>
    set((state) => ({
      boards: state.boards.map((c) => (c.id === cardId ? { ...c, status } : c))
    }))
}));
