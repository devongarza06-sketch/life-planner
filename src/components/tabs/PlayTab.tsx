"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import { useStore } from "@/state/useStore";

export default function PlayTab() {
  const { selected } = useStore();
  const directionId = selected.play ?? null;

  // Annual (JRN) shows 3 active; 1–3 month (JRN) shows 1 active
  const COLS_12 = ["Active (3)", "Incubating (≤3)", "Dormant (∞)"];
  const COLS_13 = ["Active (1)", "Incubating (≤3)", "Dormant (∞)"];

  return (
    <div className="space-y-6">
      {/* -------------------- PURE PLAY (Recharge) -------------------- */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
        <header className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Pure Play (Recharge)</h2>
          <span className="text-xs text-slate-400">FoW + Queue</span>
        </header>

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {/* Feature of the Week */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="text-sm text-slate-300 mb-1">Feature of the Week</div>
            <div className="font-semibold">—</div>
            <div className="text-sm text-slate-400 mt-2">Duration: —</div>
            <div className="text-xs text-slate-500 mt-2">JRN: Joy — • Restor — • Novel —</div>
          </div>

          {/* Play Queue (Incubating) */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="text-sm text-slate-300 mb-1">Play Queue (Incubating)</div>
            <ul className="list-disc list-inside text-slate-200 space-y-1">
              <li className="text-sm text-slate-400">No items yet.</li>
            </ul>
          </div>

          {/* Dormant */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="text-sm text-slate-300 mb-1">Dormant</div>
            <ul className="list-disc list-inside text-slate-200 space-y-1">
              <li className="text-sm text-slate-400">No items yet.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------- SKILL PLAY (Learn & Showcase) -------------------- */}
      {/* New outer card wrapper + header to parallel Pure Play */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Skill Play (Learn &amp; Showcase)</h2>
          <span className="text-xs text-slate-400">A/I/D (+JRN)</span>
        </header>

        {/* Direction/Visions/Tree */}
        <div className="space-y-4">
          <NorthStarBar tab="play" />
          <VisionBoxes tab="play" />
          <GoalTree directionId={directionId ?? ""} />
        </div>

        {/* Annual Themes (12+ months) — JRN rubric, Active (3) */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
          <header className="flex items-center justify-between">
            <h3 className="font-semibold">Annual Themes (12+ months)</h3>
            <span className="text-xs text-slate-400">Rubric: JRN</span>
          </header>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            {COLS_12.map((col) => (
              <div key={col} className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
                <div className="font-medium mb-2">{col}</div>
                <div className="text-sm text-slate-400">No items yet.</div>
              </div>
            ))}
          </div>
        </section>

        {/* 1–3 Month Goals — JRN rubric, Active (1) */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
          <header className="flex items-center justify-between">
            <h3 className="font-semibold">1–3 Month Goals</h3>
            <span className="text-xs text-slate-400">Rubric: JRN</span>
          </header>
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            {COLS_13.map((col) => (
              <div key={col} className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
                <div className="font-medium mb-2">{col}</div>
                <div className="text-sm text-slate-400">No items yet.</div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected active goal helper */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
          <h3 className="font-semibold mb-2">1–3 Month Active Goal</h3>
          <div className="text-sm text-slate-400">
            Select the active Skill Play goal to see its weekly/daily breakdown.
          </div>
        </section>
      </section>
    </div>
  );
}
