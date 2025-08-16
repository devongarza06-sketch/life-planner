"use client";
import { create } from "zustand";
import {
  BoardCard,
  BoardStatus,
  Budget,
  GoalNode,
  Task,
  Vision,
  UserPrefs,
  PlannerSettings
} from "@/domain/types";
import { db } from "@/db";

/**
 * Zustand store managing all planner state and syncing to IndexedDB.
 * On initial load it seeds the DB and populates the store.
 */

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Fallback if crypto.randomUUID is unavailable
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface AppState {
  budgets: Budget[];
  visions: Vision[];
  goals: GoalNode[];
  boards: BoardCard[];
  tasks: Task[];
  prefs: UserPrefs | null;
  settings: PlannerSettings | null;
  selectedTab: "passion" | "person" | "play" | "misc";
  setSelectedTab: (tab: "passion" | "person" | "play" | "misc") => void;
  updateBudget: (budget: Budget) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
  moveBoardCard: (id: string, status: BoardStatus) => void;
  init: () => Promise<void>;
  exportJSON: () => any;
  importJSON: (data: any) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  budgets: [],
  visions: [],
  goals: [],
  boards: [],
  tasks: [],
  prefs: null,
  settings: null,
  selectedTab: "passion",

  setSelectedTab: (tab) => set({ selectedTab: tab }),

  updateBudget: (budget) => {
    set((state) => {
      const budgets = state.budgets.some((b) => b.id === budget.id)
        ? state.budgets.map((b) => (b.id === budget.id ? budget : b))
        : [...state.budgets, budget];
      db.budgets.put(budget);
      return { budgets };
    });
  },

  addTask: (task) => {
    const newTask = { ...task, id: newId() };
    set((state) => {
      db.tasks.add(newTask);
      return { tasks: [...state.tasks, newTask] };
    });
  },

  updateTask: (task) => {
    set((state) => {
      db.tasks.put(task);
      return { tasks: state.tasks.map((t) => (t.id === task.id ? task : t)) };
    });
  },

  removeTask: (id) => {
    set((state) => {
      db.tasks.delete(id);
      return { tasks: state.tasks.filter((t) => t.id !== id) };
    });
  },

  moveBoardCard: (id, status) => {
    set((state) => {
      const card = state.boards.find((c) => c.id === id);
      if (!card) return state;
      const updated = { ...card, status };
      db.boards.put(updated);
      const boards = state.boards.map((c) => (c.id === id ? updated : c));
      return { boards };
    });
  },

  init: async () => {
    await db.seed();
    const [budgets, visions, goals, boards, tasks, prefs, settings] = await Promise.all([
      db.budgets.toArray(),
      db.visions.toArray(),
      db.goals.toArray(),
      db.boards.toArray(),
      db.tasks.toArray(),
      db.prefs.toArray(),
      db.settings.toArray()
    ]);
    set({
      budgets,
      visions,
      goals,
      boards,
      tasks,
      prefs: prefs[0] || null,
      settings: settings[0] || null
    });
  },

  exportJSON: () => {
    const state = get();
    return {
      budgets: state.budgets,
      visions: state.visions,
      goals: state.goals,
      boards: state.boards,
      tasks: state.tasks,
      prefs: state.prefs ? [state.prefs] : [],
      settings: state.settings ? [state.settings] : []
    };
  },

  importJSON: async (data) => {
    // ✅ Use array form to satisfy Dexie TS overloads
    await db.transaction(
      "rw",
      [
        db.budgets,
        db.visions,
        db.goals,
        db.boards,
        db.tasks,
        db.prefs,
        db.settings
      ],
      async () => {
        await Promise.all([
          db.budgets.clear(),
          db.visions.clear(),
          db.goals.clear(),
          db.boards.clear(),
          db.tasks.clear(),
          db.prefs.clear(),
          db.settings.clear()
        ]);

        // Use bulkPut so re-imports don’t fail on duplicate keys
        if (data.budgets?.length) await db.budgets.bulkPut(data.budgets);
        if (data.visions?.length) await db.visions.bulkPut(data.visions);
        if (data.goals?.length) await db.goals.bulkPut(data.goals);
        if (data.boards?.length) await db.boards.bulkPut(data.boards);
        if (data.tasks?.length) await db.tasks.bulkPut(data.tasks);

        if (data.prefs?.[0]) await db.prefs.put(data.prefs[0]);
        if (data.settings?.[0]) await db.settings.put(data.settings[0]);
      }
    );

    await get().init();
  }
}));
