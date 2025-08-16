import Dexie, { Table } from "dexie";
import {
  Budget,
  Vision,
  GoalNode,
  BoardCard,
  Task,
  UserPrefs,
  PlannerSettings,
} from "@/domain/types";
import {
  seedBudgets,
  seedVisions,
  seedGoals,
  seedBoards,
  seedTasks,
  seedPrefs,
  seedSettings,
} from "@/domain/sample-data";

/**
 * Dexie (IndexedDB) database for the Life Planner.
 * NOTE: We use the array form of `transaction(mode, [tables...], fn)` to avoid
 * TypeScript overload complaints about too many parameters.
 */
export class LifePlannerDB extends Dexie {
  budgets!: Table<Budget, string>;
  visions!: Table<Vision, string>;
  goals!: Table<GoalNode, string>;
  boards!: Table<BoardCard, string>;
  tasks!: Table<Task, string>;
  prefs!: Table<UserPrefs, string>;
  settings!: Table<PlannerSettings, string>;

  constructor() {
    super("lifePlannerDB");

    // Define stores. The first index is the primary key.
    // If your entities don’t have explicit IDs yet, keep using natural keys as defined here.
    this.version(1).stores({
      budgets: "id",                 // e.g., ISO date of week
      visions: "id, tabId",
      goals: "id, tabId, parentId",
      boards: "id, tabId, status",
      tasks: "id, tabId, cardId, start, end",
      prefs: "theme",                // single-row table; theme acts as key
      settings: "snapMinutes",       // single-row table; snapMinutes acts as key
    });
  }

  /**
   * Seed initial data only if the DB is empty.
   */
  async seed() {
    const budgetCount = await this.budgets.count();
    if (budgetCount > 0) return;

    // ✅ Use the array form so TypeScript doesn’t complain:
    await this.transaction(
      "rw",
      [
        this.budgets,
        this.visions,
        this.goals,
        this.boards,
        this.tasks,
        this.prefs,
        this.settings,
      ],
      async () => {
        await this.budgets.bulkAdd(seedBudgets);
        await this.visions.bulkAdd(seedVisions);
        await this.goals.bulkAdd(seedGoals);
        await this.boards.bulkAdd(seedBoards);
        await this.tasks.bulkAdd(seedTasks);

        // single-record tables
        if (seedPrefs?.[0]) await this.prefs.add(seedPrefs[0]);
        if (seedSettings?.[0]) await this.settings.add(seedSettings[0]);
      }
    );
  }
}

export const db = new LifePlannerDB();
