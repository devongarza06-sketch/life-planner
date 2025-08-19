// src/domain/sample-data.ts
import { BoardCard, Budget, GoalNode, Task, Vision, UserPrefs, PlannerSettings } from "./types";

// ---------- Budgets ----------
export const seedBudgets: Budget[] = [
  {
    id: "2025-08-18",
    dateRange: "2025-08-18/2025-08-24",
    daily: [40, 30, 20, 10],
    weekly: [20, 15, 10, 5],
  },
];

// ---------- Visions (Directions) ----------
export const seedVisions: Vision[] = [
  {
    id: "v1",
    label: "Become a CRNA",
    legacyText: "Known as a calm, expert ICU nurse anesthetist",
    legacyValues: ["Mastery", "Service"],
    personalText: "Provide safe anesthesia care with precision",
    personalValues: ["Growth", "Compassion"],
  },
  {
    id: "v2",
    label: "Write a Novel",
    legacyText: "Recognized as a thoughtful storyteller",
    legacyValues: ["Creativity", "Insight"],
    personalText: "Complete a publishable first draft",
    personalValues: ["Discipline", "Expression"],
  },
  {
    id: "v3",
    label: "Fitness & Health",
    legacyText: "Strong and consistent in training",
    legacyValues: ["Consistency"],
    personalText: "Feel energized and improve endurance",
    personalValues: ["Vitality"],
  },
  {
    id: "v4",
    label: "Learn Guitar",
    legacyText: "Able to perform songs for friends",
    legacyValues: ["Fun"],
    personalText: "Enjoy daily music practice",
    personalValues: ["Playfulness"],
  },
];

// ---------- Goals ----------
export const seedGoals: GoalNode[] = [
  // Passion: CRNA path
  {
    id: "g1",
    tabId: "passion",
    directionId: "v1",
    parentId: null,
    type: "northStar",
    title: "Become a CRNA",
    horizon: "12+",
    rubric: "IART+G",
    rubricInputs: { rubric: "IART+G", I: 5, A: 4, R: 5, T: 4, G: 3 },
  },
  {
    id: "g2",
    tabId: "passion",
    directionId: "v1",
    parentId: "g1",
    type: "goal",
    title: "Ace ICU rotations",
    horizon: "1-3",
    rubric: "IART+G",
    rubricInputs: { rubric: "IART+G", I: 4, A: 4, R: 4, T: 5, G: 4 },
    weekly: ["Pass CCRN practice test"],
    daily: ["Review hemodynamics 30m"],
    ifThenYet: "If I feel tired → study 10m instead of skipping",
    rationale: "Consistent study > cramming for exams",
  },

  // Passion: Novel writing
  {
    id: "g3",
    tabId: "passion",
    directionId: "v2",
    parentId: null,
    type: "northStar",
    title: "Write a Novel",
    horizon: "12+",
    rubric: "IART+G",
    rubricInputs: { rubric: "IART+G", I: 3, A: 4, R: 3, T: 3, G: 4 },
  },
  {
    id: "g4",
    tabId: "passion",
    directionId: "v2",
    parentId: "g3",
    type: "goal",
    title: "Finish draft outline",
    horizon: "1-3",
    rubric: "IART+G",
    rubricInputs: { rubric: "IART+G", I: 4, A: 3, R: 3, T: 4, G: 4 },
    weekly: ["Outline 3 chapters"],
    daily: ["Write 300 words"],
  },

  // Person: Fitness
  {
    id: "g5",
    tabId: "person",
    directionId: "v3",
    parentId: null,
    type: "northStar",
    title: "Fitness & Health",
    horizon: "1-3",
    rubric: "UIE",
    rubricInputs: { rubric: "UIE", U: 5, I: 4, E: 5 },
    weekly: ["Run 15 miles total"],
    daily: ["Stretch 10m", "Lift weights 3x/wk"],
    ifThenYet: "If raining → treadmill run instead",
    rationale: "Health is foundational to everything else",
  },

  // Play: Guitar
  {
    id: "g6",
    tabId: "play",
    directionId: "v4",
    parentId: null,
    type: "northStar",
    title: "Learn Guitar",
    horizon: "1-3",
    rubric: "JRN",
    rubricInputs: { rubric: "JRN", J: 4, R: 4, N: 5 },
    weekly: ["Learn 2 songs"],
    daily: ["Practice 20m"],
  },
];

// ---------- Boards (auto-generated in app, but seed some to demo) ----------
export const seedBoards: BoardCard[] = [
  { id: "g1", tabId: "passion-annual", status: "active", title: "Become a CRNA", score: 4.5, rubric: "IART+G" },
  { id: "g2", tabId: "passion-13", status: "active", title: "Ace ICU rotations", score: 4.3, rubric: "IART+G" },
  { id: "g3", tabId: "passion-annual", status: "incubating", title: "Write a Novel", score: 3.4, rubric: "IART+G" },
  { id: "g4", tabId: "passion-13", status: "incubating", title: "Finish draft outline", score: 3.6, rubric: "IART+G" },
  { id: "g5", tabId: "person-13", status: "active", title: "Fitness & Health", score: 4.7, rubric: "UIE" },
  { id: "g6", tabId: "play-13", status: "active", title: "Learn Guitar", score: 4.3, rubric: "JRN" },
];

// ---------- Tasks (Weekly Planner) ----------
export const seedTasks: Task[] = [
  { id: "t1", day: 1, start: "08:00", end: "09:00", bucket: "Passion", title: "Review hemodynamics" },
  { id: "t2", day: 3, start: "19:00", end: "19:30", bucket: "Passion", title: "Write 300 words" },
  { id: "t3", day: 5, start: "07:30", end: "08:15", bucket: "Person", title: "Morning run" },
  { id: "t4", day: 2, start: "20:00", end: "20:30", bucket: "Play", title: "Guitar practice" },
];

// ---------- Prefs & Settings ----------
export const seedPrefs: UserPrefs[] = [
  { theme: "dark", startOfWeek: 1, plannerGridMinutes: 30 },
];

export const seedSettings: PlannerSettings[] = [
  { snapMinutes: 30, timeFormat: "24h", timezone: "America/Chicago" },
];
