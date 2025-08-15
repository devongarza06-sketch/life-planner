"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";
import VisionBoxes from "../VisionBoxes";
import GoalTree from "../GoalTree";
import AidBoard from "../AidBoard";
import ScoreBadge from "../ScoreBadge";

/**
 * Play tab – includes Pure Play (recharge) and Skill Play (learning).
 */
export default function PlayTab() {
  const [selectedDir, setSelectedDir] = useState<string>("musician");
  const vision = useStore((state) => state.visions.find((v) => v.id === selectedDir));

  return (
    <div className="space-y-4">
      {/* Pure Play */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-3 shadow">
        <h3 className="font-semibold mb-2">Pure Play (Recharge)</h3>
        <p className="text-sm mb-2">Pick your feature of the week and queue up fun activities.</p>
        {/* Example of Feature of Week (JRN scoring) */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Feature: Jam Session</span>
          <ScoreBadge scoring={{ joy: 5, restoration: 4, novelty: 3 }} />
        </div>
        <div className="mt-2">
          <h4 className="font-semibold text-sm">Play Queue</h4>
          <ul className="list-disc pl-5 text-sm">
            <li>Hike with friends</li>
            <li>Cook a new recipe</li>
          </ul>
        </div>
      </div>

      {/* Skill Play */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-3 shadow">
        <h3 className="font-semibold mb-2">Skill Play (Learn & Showcase)</h3>
        <div className="flex gap-2 overflow-auto">
          {["musician","photography","painting"].map((id) => (
            <button
              key={id}
              onClick={() => setSelectedDir(id)}
              className={`whitespace-nowrap px-3 py-1 rounded-full ${
                selectedDir === id ? "bg-accent text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        {vision && <VisionBoxes vision={vision} />}
        <GoalTree directionId={selectedDir} />
        <AidBoard tabId="play" />
      </div>
    </div>
  );
}
