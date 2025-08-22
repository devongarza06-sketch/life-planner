export type Horizon = "12+" | "1-3" | "other";
export type Rubric = "IART+G" | "JRN" | "UIE";

// Board keys: tab + horizon
export function boardKey(tab: "passion" | "person" | "play", horizon: Horizon): string {
  if (horizon === "12+") return `${tab}-annual`;
  if (horizon === "1-3") return `${tab}-13`;
  return `${tab}-other`;
}

// Caps per board
export const CAPS: Record<string, { active: number; incubating: number }> = {
  "passion-annual": { active: 3, incubating: 3 },
  "passion-13": { active: 3, incubating: 3 },
  "play-annual": { active: 3, incubating: 3 },
  "play-13": { active: 1, incubating: 3 },
  "person-13": { active: 1, incubating: 3 }
};

// Simple uid
export const uid = () => Math.random().toString(36).slice(2, 10);
