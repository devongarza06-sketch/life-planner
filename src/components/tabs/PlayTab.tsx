"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import { useStore } from "@/state/useStore";

export default function PlayTab() {
  const { selected } = useStore();
  const directionId = selected.play ?? null;

  return (
    <div className="space-y-6">
      {/* Pure Play stays as-is above */}

      {/* Skill Play (Learn & Showcase) */}
      <div className="space-y-4">
        <NorthStarBar tab="play" />
        <VisionBoxes tab="play" />
        <GoalTree directionId={directionId ?? ""} />

        {/* AID boards & 1–3 Month Active (visual shells) */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
          <header className="flex items-center justify-between">
            <h3 className="font-semibold">Annual Themes (12+ months)</h3>
            <span className="text-xs text-slate-400">Rubric: IART+G</span>
          </header>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            {["Active", "Incubating", "Dormant"].map((col) => (
              <div key={col} className="rounded-xl border border-slate-700/60 p-3">
                <div className="font-medium mb-2">{col}</div>
                <div className="text-sm text-slate-400">No items yet.</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
          <header className="flex items-center justify-between">
            <h3 className="font-semibold">1–3 Month Goals</h3>
            <span className="text-xs text-slate-400">Rubric: JRN</span>
          </header>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            {["Active", "Incubating", "Dormant"].map((col) => (
              <div key={col} className="rounded-xl border border-slate-700/60 p-3">
                <div className="font-medium mb-2">{col}</div>
                <div className="text-sm text-slate-400">No items yet.</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
          <h3 className="font-semibold mb-2">1–3 Month Active Goal</h3>
          <div className="text-sm text-slate-400">
            Select the active Skill Play goal to see its weekly/daily breakdown.
          </div>
        </section>
      </div>
    </div>
  );
}
