"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";
import VisionBoxes from "../../VisionBoxes";
import GoalTree from "../../GoalTree";
import AidBoard from "../../AidBoard";

/**
 * Collapsible section for each Person domain.  Contains direction chips,
 * vision board, goal tree and AID board specific to this domain.
 */
export default function PersonSection({ section }: { section: { id: string; label: string } }) {
  const directions: { id: string; label: string }[] = {
    physical: [
      { id: "fitness", label: "Build Strength" },
      { id: "cardio", label: "Run 5K" }
    ],
    cognitive: [
      { id: "research", label: "Read Research" },
      { id: "memory", label: "Memory Training" }
    ],
    emotional: [
      { id: "resilience", label: "Emotional Resilience" },
      { id: "therapy", label: "Weekly Therapy" }
    ],
    social: [
      { id: "community", label: "Grow Community" },
      { id: "network", label: "Networking" }
    ],
    meaning: [
      { id: "service", label: "Service Projects" },
      { id: "spiritual", label: "Spiritual Practice" }
    ]
  }[section.id] || [];

  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(directions[0]?.id || "");

  const vision = useStore((state) => state.visions.find((v) => v.id === selected));

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-3 shadow">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex justify-between items-center">
        <span className="font-semibold">{section.label}</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-3">
          <div className="flex gap-2 overflow-auto">
            {directions.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-full ${
                  selected === d.id ? "bg-accent text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {vision && <VisionBoxes vision={vision} />}
          <GoalTree directionId={selected} />
          <AidBoard tabId={`person-${section.id}`} />
        </div>
      )}
    </div>
  );
}
