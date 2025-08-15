/**
 * Core domain models for the life planner.
 * Each entity is assigned an `id` (UUID) and scoped by `tabId`.
 */

export interface UserPrefs {
  theme: 'light' | 'dark';
  startOfWeek: number;      // 0 = Sunday … 6 = Saturday
  plannerGridMinutes: number;
}

export interface Budget {
  id: string;       // ISO date of week (yyyy-mm-dd)
  dateRange: string; // "2025-08-11/2025-08-17"
  daily: [number, number, number, number];  // [passion, person, play, misc] percentages
  weekly: [number, number, number, number]; // weekly total hours
}

export interface Vision {
  id: string;      // ties back to a northStar goal id
  tabId: string;   // e.g. "passion", "person-physical"
  legacyText: string;
  personalText: string;
  values: string[];
}

export type GoalType = 'northStar' | 'goal' | 'subGoal' | 'quarterGoal';

export interface GoalNode {
  id: string;
  tabId: string;
  type: GoalType;
  parentId?: string;
  title: string;
  description: string;
  /** A free‑form SMARTIER string (this prototype does not parse the fields) */
  smartier: string;
  /** A map of lead/lag metrics or scoring values */
  weights: Record<string, number>;
}

export type BoardStatus = 'active' | 'incubating' | 'dormant';

/**
 * A card on the Active/Incubating/Dormant boards.
 * The scoring property stores IART+G, UIE, or JRN fields depending on the tab.
 */
export interface BoardCard {
  id: string;
  tabId: string;
  goalId?: string;
  status: BoardStatus;
  title: string;
  notes: string;
  scoring: Record<string, number>;
  /** Arbitrary metrics used for habits/tasks */
  metrics: {
    energy?: number;
    duration?: number;
    freq?: number;
  };
  tags: string[];
}

export interface Task {
  id: string;
  tabId: string;
  cardId?: string;
  title: string;
  start: string;    // ISO datetime
  end: string;      // ISO datetime
  recurringRule?: string;
  metadata?: {
    ifThen?: string;
    experimentNote?: string;
  };
  done?: boolean;
}

export interface PlannerSettings {
  snapMinutes: number;
  timeFormat: '12h' | '24h';
  timezone: string;
}
