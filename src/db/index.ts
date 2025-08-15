import Dexie, { Table } from "dexie";
import { Budget, Vision, GoalNode, BoardCard, Task, UserPrefs, PlannerSettings } from "@/domain/types";
import { seedBudgets, seedVisions, seedGoals, seedBoards, seedTasks, seedPrefs, seedSettings } from "@/domain/sample-data";

/** Dexie database storing all entities in IndexedDB. */
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
    this.version(1).stores({
      budgets: "id",
      visions: "id, tabId",
      goals: "id, tabId, parentId",
      boards: "id, tabId, status",
      tasks: "id, tabId, cardId, start, end",
      prefs: "theme",
      settings: "snapMinutes"
    });
  }

  async seed() {
    const budgetCount = await this.budgets.count();
    if (budgetCount === 0) {
      // ✅ Use the array form to avoid the 3–7 arguments overload issue
      await this.transaction(
        "rw",
        [this.budgets, this.visions, this.goals, this.boards, this.tasks, this.prefs, this.settings],
        async () => {
          await this.budgets.bulkAdd(seedBudgets);
          await this.visions.bulkAdd(seedVisions);
          await this.goals.bulkAdd(seedGoals);
          await this.boards.bulkAdd(seedBoards);
          await this.tasks.bulkAdd(seedTasks);
          await this.prefs.bulkAdd(seedPrefs);
          await this.settings.bulkAdd(seedSettings);
        }
      );
    }
  }
}

export const db = new LifePlannerDB();
