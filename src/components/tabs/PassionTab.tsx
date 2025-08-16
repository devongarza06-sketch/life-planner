"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";
import VisionBoxes from "../VisionBoxes";
import GoalTree from "../GoalTree";
import AidBoard from "../AidBoard";

/**
 * Passion tab – North Star selector, Vision side-by-side, Tree centered, AID board.
 */
const directions = [
  { id: "crna", label: "Become a CRNA" },
  { id: "writer", label: "Become a Writer" }
];

export default function PassionTab() {
  const [selected, setSelected] = useState<string>(directions[0].id);
  const vision = useStore((s) => s.visions.find((v) => v.id === selected));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-auto pb-2">
        {directions.map((dir) => (
          <button
            key={dir.id}
            onClick={() => setSelected(dir.id)}
            className={`whitespace-nowrap px-4 py-1 rounded-full ${
              selected === dir.id ? "bg-accent text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {dir.label}
          </button>
        ))}
      </div>

      {/* Vision boxes side-by-side */}
      <VisionBoxes vision={vision} />

      {/* Family-style tree centered below */}
      <GoalTree directionId={selected} />

      {/* A/I/D board */}
      <AidBoard tabId="passion" />
    </div>
  );
}
