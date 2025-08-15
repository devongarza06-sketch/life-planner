"use client";
/**
 * Zustand store managing all planner state and syncing to IndexedDB (Dexie).
 * - Local-first: all data persists in IndexedDB via src/db/index.ts
 * - Export/Import: JSON round-trip for backups and migration
 * - Safe Dexie.transaction usage (array form) to satisfy TS overloads
 */

import { create } from "zustand";
import { db } from "@/db";
import type {
  BoardCard,
  BoardStatus,
  Budget,
  GoalNode,
  PlannerSettings,
  Task,
  UserPrefs,
  Vision
} from "@/domain/types";
import { uuidv4 } from "@/utils/uuid";

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

  /** Replace or update a budget record */
  updateBudget: (budget: Budget) => void;

  /** Task CRUD */
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;

  /** Move a board card to a new status */
  moveBoardCard: (id: string, status: BoardStatus) => void;

  /** Initialize store from IndexedDB (also seeds on first run) */
  init: () => Promise<void>;

  /** Export state as JSON */
  exportJSON: () => any;

  /** Import state from JSON (clears DB then loads) */
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
      const exists = state.budgets.some((b) => b.id === budget.id);
      const budgets = exists
        ? state.budgets.map((b) => (b.id === budget.id ? budget : b))
        : [...state.budgets, budget];
      // persist
      void db.budgets.put(budget);
      return { budgets };
    });
  },

  addTask: (task) => {
    const newTask: Task = { ...task, id: uuidv4() };
    set((state) => {
      void db.tasks.add(newTask);
      return { tasks: [...state.tasks, newTask] };
    });
  },

  updateTask: (task) => {
    set((state) => {
      void db.tasks.put(task);
      return { tasks: state.tasks.map((t) => (t.id === task.id ? task : t)) };
    });
  },

  removeTask: (id) => {
    set((state) => {
      void db.tasks.delete(id);
      return { tasks: state.tasks.filter((t) => t.id !== id) };
    });
  },

  moveBoardCard: (id, status) => {
    set((state) => {
      const card = state.boards.find((c) => c.id === id);
      if (!card) return state;
      const updated = { ...card, status };
      void db.boards.put(updated);
      const boards = state.boards.map((c) => (c.id === id ? updated : c));
      return { boards };
    });
  },

  init: async () => {
    // Seed DB on first open
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
    // ✅ Use Dexie.transaction array form to avoid the 3–7 args overload
    await db.transaction(
      "rw",
      [db.budgets, db.visions, db.goals, db.boards, db.tasks, db.prefs, db.settings],
      async () => {
        // Clear all tables in parallel
        await Promise.all([
          db.budgets.clear(),
          db.visions.clear(),
          db.goals.clear(),
          db.boards.clear(),
          db.tasks.clear(),
          db.prefs.clear(),
          db.settings.clear()
        ]);

        // Bulk insert if present
        if (data?.budgets?.length) await db.budgets.bulkAdd(data.budgets as Budget[]);
        if (data?.visions?.length) await db.visions.bulkAdd(data.visions as Vision[]);
        if (data?.goals?.length) await db.goals.bulkAdd(data.goals as GoalNode[]);
        if (data?.boards?.length) await db.boards.bulkAdd(data.boards as BoardCard[]);
        if (data?.tasks?.length) await db.tasks.bulkAdd(data.tasks as Task[]);
        if (data?.prefs?.[0]) await db.prefs.add(data.prefs[0] as UserPrefs);
        if (data?.settings?.[0]) await db.settings.add(data.settings[0] as PlannerSettings);
      }
    );

    // Reload store from DB after import
    await get().init();
  }
}));
