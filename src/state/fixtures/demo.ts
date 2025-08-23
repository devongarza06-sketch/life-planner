// src/state/fixtures/demo.ts
import type { PurePlayItem } from "@/state/pureplay.types";
import type { SystemItem } from "@/state/slices/systems.slice";
import type { Project } from "@/state/slices/projects.slice";
import { uid } from "@/state/constants";

export function demoData() {
  // Systems
  const sys1: SystemItem = {
    id: uid(),
    title: "Weekly Finance Sweep",
    status: "active",
    actions: [
      { key: uid(), label: "Budget & transfers", durationMin: 30, mode: "specific", day: 0, start: "10:00" },
      { key: uid(), label: "Pay bills", durationMin: 25, mode: "frequency", frequencyPerWeek: 1, preferredDays: [1] },
    ],
  };
  const sys2: SystemItem = {
    id: uid(),
    title: "Digital Hygiene",
    status: "active",
    actions: [
      { key: uid(), label: "Inbox zero sprint", durationMin: 20, mode: "frequency", frequencyPerWeek: 3, preferredDays: [1,3,5] },
      { key: uid(), label: "Backups check", durationMin: 15, mode: "specific", day: 6, start: "16:00" },
    ],
  };

  // Projects
  const proj1: Project = {
    id: uid(),
    title: "Apartment Deep Clean",
    steps: [
      {
        id: uid(),
        title: "Kitchen",
        actions: [
          { key: uid(), label: "Oven + fridge", durationMin: 45, mode: "specific", day: 6, start: "11:00" },
        ],
      },
      {
        id: uid(),
        title: "Bedroom",
        actions: [
          { key: uid(), label: "Closet declutter", durationMin: 40, mode: "frequency", frequencyPerWeek: 1, preferredDays: [0,6] },
        ],
      },
    ],
  };

  // Pure Play queue
  const ppQueue: PurePlayItem[] = [
    { id: uid(), name: "Trail photo walk", J: 5, R: 4, N: 4, durationMin: 90 },
    { id: uid(), name: "Cozy indie game", J: 4, R: 5, N: 3, durationMin: 60 },
  ];

  return {
    systems: [sys1, sys2],
    projects: [proj1],
    purePlayQueue: ppQueue,
  };
}
