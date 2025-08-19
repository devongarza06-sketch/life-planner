"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import AIDBoard from "@/components/AIDBoard";
import { useStore } from "@/state/useStore";
import Active13Panel from "@/components/Active13Panel";


export default function PlayTab() {
  const { selected } = useStore();
  const directionId = selected.play ?? null;

  return (
    <div className="space-y-6">
      {/* PURE PLAY */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
        <header className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Pure Play (Recharge)</h2>
          <span className="text-xs text-slate-400">FoW + Queue</span>
        </header>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="text-sm text-slate-300 mb-1">Feature of the Week</div>
            <div className="font-semibold">—</div>
            <div className="text-sm text-slate-400 mt-2">Duration: —</div>
            <div className="text-xs text-slate-500 mt-2">JRN: Joy — • Restor — • Novel —</div>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="text-sm text-slate-300 mb-1">Play Queue (Incubating)</div>
            <ul className="list-disc list-inside text-slate-200 space-y-1">
              <li className="text-sm text-slate-400">No items yet.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
            <div className="text-sm text-slate-300 mb-1">Dormant</div>
            <ul className="list-disc list-inside text-slate-200 space-y-1">
              <li className="text-sm text-slate-400">No items yet.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SKILL PLAY */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Skill Play (Learn &amp; Showcase)</h2>
          <span className="text-xs text-slate-400">A/I/D (+JRN)</span>
        </header>

        <div className="space-y-4">
          <NorthStarBar tab="play" />
          <VisionBoxes tab="play" />
          <GoalTree directionId={directionId ?? ""} />
        </div>

        <AIDBoard
          label="Annual Themes (12+ months)"
          rubricLabel="JRN"
          tabKey="play-annual"
          columns={["Active (3)", "Incubating (≤3)", "Dormant (∞)"]}
        />

        <AIDBoard
          label="1–3 Month Goals"
          rubricLabel="JRN"
          tabKey="play-13"
          columns={["Active (1)", "Incubating (≤3)", "Dormant (∞)"]}
        />

        <Active13Panel tabKey="play-13" title="1–3 Month Active Goal" />
      </section>
    </div>
  );
}
