"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";
import VisionBoxes from "../VisionBoxes";
import GoalTree from "../GoalTree";
import AidBoard from "../AidBoard";

/**
 * Passion tab – manages north‑star directions, vision boards, goal tree and AID board.
 */
const directions = [
  { id: "crna", label: "Become a CRNA" },
  { id: "writer", label: "Become a Writer" }
];

export default function PassionTab() {
  const [selected, setSelected] = useState<string>(directions[0].id);
  const visions = useStore((state) => state.visions.filter((v) => v.id === selected));
  return (
    <div className="space-y-4" data-component="PassionTab">
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
      {visions.length > 0 && <VisionBoxes vision={visions[0]} />}
      <GoalTree directionId={selected} />
      <AidBoard tabId="passion" />
    </div>
  );
}
