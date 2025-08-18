/**
 * Core domain models for the life planner.
 * Keep intentionally small to run fast in the browser.
 */

export type BoardStatus = 'active' | 'incubating' | 'dormant';
export type TabId = 'passion' | 'person' | 'play';

export interface UserPrefs {
  theme: 'light' | 'dark';
  startOfWeek: number;      // 0 = Sun … 6 = Sat
  plannerGridMinutes: number;
}

export interface Budget {
  id: string;                 // "YYYY-MM-DD" week anchor
  dateRange: string;          // "2025-08-11/2025-08-17"
  daily: [number, number, number, number];   // [Passion, Person, Play, Misc] %
  weekly: [number, number, number, number];  // hours per bucket (optional use)
}

export interface Vision {
  id: string;                 // matches a directionId
  label: string;
  legacyText: string;
  legacyValues: string[];
  personalText: string;
  personalValues: string[];
}

export type GoalType = 'northStar' | 'goal' | 'quarterGoal' | 'monthGoal';

export interface GoalNode {
  id: string;
  tabId: TabId;                          // grouping for boards
  directionId: string;                   // ties to Vision.id
  parentId?: string | null;              // null for root (north star)
  type: GoalType;
  title: string;
  smartier?: string;
  lead?: string;
  lag?: string;
}

export interface BoardCard {
  id: string;
  tabId: string;             // e.g., 'passion', 'play-annual', 'person-physical'
  status: BoardStatus;
  title: string;
  score?: number;            // rubric score (IART+G, UIE, JRN etc.)
  rubric?: string;
}

export interface Task {
  id: string;
  day: number;           // 0..6
  start: string;         // 'HH:MM'
  end: string;           // 'HH:MM'
  bucket: 'Passion' | 'Person' | 'Play' | 'Misc';
  title: string;
  fixed?: boolean;
}

export interface PlannerSettings {
  snapMinutes: number;
  timeFormat: '12h' | '24h';
  timezone: string;
}
