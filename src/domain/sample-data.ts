import { Budget, Vision, GoalNode, BoardCard, Task, UserPrefs, PlannerSettings } from "./types";

/**
 * Example seed data for testing the UI.
 * Loaded into the store on first run via db/index.ts.
 */

export const seedBudgets: Budget[] = [
  {
    id: "2025-08-11",
    dateRange: "2025-08-11/2025-08-17",
    daily: [25, 25, 25, 25],
    weekly: [175, 175, 175, 175]
  }
];

export const seedVisions: Vision[] = [
  {
    id: "crna",
    tabId: "passion",
    legacyText: "Leading CRNA recognized for safe, evidence-based care",
    personalText: "Master advanced anesthesia to serve patients",
    values: ["service","mastery","autonomy"]
  },
  {
    id: "writer",
    tabId: "passion",
    legacyText: "Acclaimed novelist sparking ethical conversations",
    personalText: "Fulfill my creative drive through stories",
    values: ["creativity","ethics","curiosity"]
  },
  {
    id: "fitness",
    tabId: "person-physical",
    legacyText: "A strong, energetic practitioner inspiring others",
    personalText: "Feel confident and resilient in my body",
    values: ["health","discipline"]
  }
];

export const seedGoals: GoalNode[] = [
  {
    id: "crna",
    tabId: "passion",
    type: "northStar",
    title: "Become a CRNA",
    description: "",
    smartier: "",
    weights: {}
  },
  {
    id: "writer",
    tabId: "passion",
    type: "northStar",
    title: "Become a Writer",
    description: "",
    smartier: "",
    weights: {}
  },
  {
    id: "crna-prereqs",
    tabId: "passion",
    type: "goal",
    parentId: "crna",
    title: "Finish CRNA prerequisites",
    description: "",
    smartier: "Complete required clinical hours and classes by Q2 2026",
    weights: { lead: 10, lag: 2 }
  },
  {
    id: "crna-prereqs-step",
    tabId: "passion",
    type: "quarterGoal",
    parentId: "crna-prereqs",
    title: "Earn 150 clinical hours",
    description: "",
    smartier: "Log 10 hours/week for 15 weeks",
    weights: { lead: 10, lag: 1 }
  },
  {
    id: "writer-draft",
    tabId: "passion",
    type: "goal",
    parentId: "writer",
    title: "Complete novel draft",
    description: "",
    smartier: "Write 120k words and pass a developmental edit by May 31 2026",
    weights: { lead: 15, lag: 1 }
  },
  {
    id: "writer-draft-20k",
    tabId: "passion",
    type: "quarterGoal",
    parentId: "writer-draft",
    title: "Write first 20k words",
    description: "",
    smartier: "Draft chapters 1–4 by the end of the quarter",
    weights: { lead: 5, lag: 1 }
  }
];

export const seedBoards: BoardCard[] = [
  {
    id: "active-crna-prereqs-step",
    tabId: "passion",
    goalId: "crna-prereqs-step",
    status: "active",
    title: "CRNA clinical hours",
    notes: "",
    scoring: { impact: 4, alignment: 5, readiness: 4, time: 3, energy: 4 },
    metrics: { energy: 3, duration: 15, freq: 10 },
    tags: ["clinical","hours"]
  },
  {
    id: "incubating-writer-draft-20k",
    tabId: "passion",
    goalId: "writer-draft-20k",
    status: "incubating",
    title: "First 20k words",
    notes: "",
    scoring: { impact: 4, alignment: 5, readiness: 3, time: 3, energy: 4 },
    metrics: { energy: 3, duration: 20, freq: 3 },
    tags: ["writing"]
  },
  {
    id: "dormant-writer-marketing",
    tabId: "passion",
    goalId: undefined,
    status: "dormant",
    title: "Plan marketing strategy",
    notes: "",
    scoring: { impact: 3, alignment: 4, readiness: 2, time: 2, energy: 2 },
    metrics: {},
    tags: ["marketing"]
  }
];

export const seedTasks: Task[] = [
  {
    id: "task-1",
    tabId: "passion",
    cardId: "active-crna-prereqs-step",
    title: "Clinic shift",
    start: "2025-08-13T08:00:00",
    end: "2025-08-13T12:00:00",
    metadata: { ifThen: "If canceled → schedule makeup" },
    done: false
  },
  {
    id: "task-2",
    tabId: "passion",
    cardId: "incubating-writer-draft-20k",
    title: "Write 1k words",
    start: "2025-08-14T07:00:00",
    end: "2025-08-14T08:30:00",
    metadata: {},
    done: false
  }
];

export const seedPrefs: UserPrefs[] = [
  {
    theme: "light",
    startOfWeek: 0,
    plannerGridMinutes: 15
  }
];

export const seedSettings: PlannerSettings[] = [
  {
    snapMinutes: 15,
    timeFormat: "24h",
    timezone: "UTC"
  }
];
