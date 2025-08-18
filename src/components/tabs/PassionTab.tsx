"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import AidBoard from "@/components/AidBoard";
import ActiveQuarterGoals from "@/components/ActiveQuarterGoals";

const directions = [
  { id: "crna", label: "Become a CRNA" },
  { id: "writer", label: "Become a Writer" },
];

export default function PassionTab() {
  const [selected, setSelected] = useState<string>(directions[0].id);
  const vision = useStore((s) => s.visions.find((v) => v.id === selected));

  return (
    <div className="space-y-4">
      {/* Direction chips */}
      <div className="flex gap-2 overflow-auto">
        {directions.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-full ${
              selected === d.id
                ? "bg-accent text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      {/* Vision side-by-side */}
      <VisionBoxes vision={vision} />
      {/* Tree centered below */}
      <GoalTree directionId={selected} />
      {/* A/I/D boards */}
      <div className="space-y-4">
        <AidBoard tabId="passion-annual" title="Annual Themes (12+ months)" rubricLabel="IART+G" />
        <AidBoard tabId="passion-q" title="1–3 Month Goals" rubricLabel="IART+G" />
      </div>
      {/* NEW: 1–3 Month Active Goals cards */}
      <ActiveQuarterGoals variant="passion" />
    </div>
  );
}
