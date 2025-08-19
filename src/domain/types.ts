/**
 * Core domain models for the life planner.
 * Keep intentionally small to run fast in the browser.
 */

export type BoardStatus = 'active' | 'incubating' | 'dormant';
export type TabId = 'passion' | 'person' | 'play';

/** Which horizon a goal belongs to for AID boards. */
export type Horizon = '12+' | '1-3' | 'other';

/** Which rubric a goal uses for scoring. */
export type Rubric = 'IART+G' | 'JRN' | 'UIE';

/** Rubric-specific input shapes used to calculate a score. */
export type IARTGInputs = { rubric: 'IART+G'; I?: number; A?: number; R?: number; T?: number; G?: number };
export type JRNInputs   = { rubric: 'JRN';    J?: number; R?: number; N?: number };
export type UIEInputs   = { rubric: 'UIE';    U?: number; I?: number; E?: number };

/** Union used in GoalNode.rubricInputs */
export type ScoreInputs = IARTGInputs | JRNInputs | UIEInputs;

/** Experimentation & Problem‑solving frameworks (optional, 1–3 goals) */
export interface OCvEDaR {
  O?: string; C?: string; V?: string; E?: string; D?: string; A?: string; R?: string;
}
export interface OPISMIT {
  O?: string; P?: string; I?: string; S?: string; M?: string; I2?: string; T?: string;
}

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

  // Metrics (primarily useful for 1–3 goals)
  lead?: string;
  lag?: string;

  /** Where this goal belongs for AID boards (select in GoalTree edit) */
  horizon?: Horizon;                     // '12+' | '1-3' | 'other'

  /** Rubric family used to score this goal */
  rubric?: Rubric;                       // 'IART+G' | 'JRN' | 'UIE'

  /** Raw rubric inputs (used to compute BoardCard.score) */
  rubricInputs?: ScoreInputs;

  /** 1–3 month only – used by the “Selected Active 1–3” panel */
  weekly?: string[];     // milestones
  daily?: string[];      // tasks & habits
  ifThenYet?: string;
  rationale?: string;
  ocvedar?: OCvEDaR;
  opismit?: OPISMIT;
}

export interface BoardCard {
  id: string;               // we map this 1:1 to GoalNode.id
  tabId: string;            // e.g., 'passion-annual', 'passion-13', 'play-annual', 'person-13'
  status: BoardStatus;
  title: string;
  score?: number;           // computed rubric score
  rubric?: string;          // label for display only
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
