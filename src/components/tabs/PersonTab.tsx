"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import { useStore } from "@/state/useStore";

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="rounded-2xl border border-slate-700/60 bg-slate-800/40"
      open={defaultOpen}
    >
      <summary className="cursor-pointer select-none px-4 py-2 font-semibold flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs text-slate-400">Direction • Vision • Tree • AID</span>
      </summary>
      <div className="px-4 pb-4 space-y-4">{children}</div>
    </details>
  );
}

export default function PersonTab() {
  const { selected } = useStore();
  const directionId = selected.person ?? null;

  return (
    <div className="space-y-6">
      {["Physical", "Cognitive", "Emotional", "Social", "Meaning"].map((sec, i) => (
        <Section key={sec} title={sec} defaultOpen={i === 0}>
          <NorthStarBar tab="person" />
          <VisionBoxes tab="person" />
          <GoalTree directionId={directionId ?? ""} />

          {/* AID boards & 1–3 Month Active (visual shells) */}
          <section className="rounded-2xl border border-slate-700/60 bg-slate-900/30 p-4">
            <header className="flex items-center justify-between">
              <h4 className="font-semibold">1–3 Month Goals</h4>
              <span className="text-xs text-slate-400">Rubric: UIE</span>
            </header>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              {["Active (1)", "Incubating (≤3)", "Dormant (∞)"].map((col) => (
                <div key={col} className="rounded-xl border border-slate-700/60 p-3">
                  <div className="font-medium mb-2">{col}</div>
                  <div className="text-sm text-slate-400">No items yet.</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/60 bg-slate-900/30 p-4">
            <h4 className="font-semibold mb-2">Selected Active 1–3 Month Goal</h4>
            <div className="text-sm text-slate-400">
              Pick the active goal to see weekly/daily habits and experiments.
            </div>
          </section>
        </Section>
      ))}
    </div>
  );
}
