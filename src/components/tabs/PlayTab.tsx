"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";

// Keep these paths relative to this folder.
// If any of these live elsewhere, tell me the correct path and I’ll adjust.
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import AidBoard from "@/components/AidBoard";
import ScoreBadge from "@/components/ScoreBadge";

// NEW section for 1–3 Month Active Goals under Skill Play
import ActiveQuarterGoals from "@/components/ActiveQuarterGoals";

export default function PlayTab() {
  const [selectedDir, setSelectedDir] = useState<string>("musician");
  const vision = useStore((s) => s.visions.find((v) => v.id === selectedDir));

  return (
    <div className="space-y-4">
      {/* Pure Play (Recharge) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
        <h3 className="font-semibold mb-2">Pure Play (Recharge)</h3>
        <div className="flex items-center gap-2">
          <span className="font-medium">Feature: Board-game night</span>
          <ScoreBadge scoring={{ joy: 5, restoration: 4, novelty: 3 }} />
        </div>
        <div className="mt-2">
          <h4 className="font-semibold text-sm">Play Queue</h4>
          <ul className="list-disc pl-5 text-sm">
            <li>Hike with friends</li>
            <li>Museum afternoon</li>
            <li>Pottery intro</li>
          </ul>
        </div>
      </div>

      {/* Skill Play (Learn & Showcase) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
        <h3 className="font-semibold mb-2">Skill Play (Learn & Showcase)</h3>

        {/* Direction chips */}
        <div className="flex gap-2 overflow-auto mb-2">
          {["musician", "photography", "painting"].map((id) => (
            <button
              key={id}
              onClick={() => setSelectedDir(id)}
              className={`whitespace-nowrap px-3 py-1 rounded-full ${
                selectedDir === id
                  ? "bg-accent text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
              }`}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>

        {/* North Star visuals */}
        <VisionBoxes vision={vision} />
        <GoalTree directionId={selectedDir} />

        {/* AID boards */}
        <div className="space-y-4 mt-4">
          <AidBoard tabId="play-annual" title="Annual Themes (12+ months)" rubricLabel="JRN" />
          <AidBoard tabId="play-q" title="1–3 Month Goals" rubricLabel="JRN" />
        </div>

        {/* NEW: 1–3 Month Active Goals (per your screenshot) */}
        <div className="mt-4">
          <ActiveQuarterGoals />
        </div>
      </div>
    </div>
  );
}
