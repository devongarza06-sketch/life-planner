"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import { useStore } from "@/state/useStore";

export default function PassionTab() {
  const { selected } = useStore();
  const directionId = selected.passion ?? null;

  // shared column labels for Passion (both boards)
  const COLS = ["Active (3)", "Incubating (≤3)", "Dormant (∞)"];

  return (
    <div className="space-y-6">
      <NorthStarBar tab="passion" />
      <VisionBoxes tab="passion" />

      <div className="mt-2">
        <GoalTree directionId={directionId ?? ""} />
      </div>

      {/* Annual Themes (12+ months) */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
        <header className="flex items-center justify-between">
          <h3 className="font-semibold">Annual Themes (12+ months)</h3>
          <span className="text-xs text-slate-400">Rubric: IART+G</span>
        </header>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {COLS.map((col) => (
            <div key={col} className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
              <div className="font-medium mb-2">{col}</div>
              <div className="text-sm text-slate-400">No items yet.</div>
            </div>
          ))}
        </div>
      </section>

      {/* 1–3 Month Goals */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
        <header className="flex items-center justify-between">
          <h3 className="font-semibold">1–3 Month Goals</h3>
          <span className="text-xs text-slate-400">Rubric: IART+G</span>
        </header>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {COLS.map((col) => (
            <div key={col} className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
              <div className="font-medium mb-2">{col}</div>
              <div className="text-sm text-slate-400">No items yet.</div>
            </div>
          ))}
        </div>
      </section>

      {/* 1–3 Month Active Goals detail area */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
        <h3 className="font-semibold mb-2">1–3 Month Active Goals</h3>
        <div className="text-sm text-slate-400">
          Select an active goal to see its weekly/daily breakdown.
        </div>
      </section>
    </div>
  );
}
