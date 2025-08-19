"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import AIDBoard from "@/components/AIDBoard";
import { useStore } from "@/state/useStore";
import Active13Panel from "@/components/Active13Panel";


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
      className="rounded-2xl border border-slate-700/60 bg-slate-800"
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

          <AIDBoard
            label="1–3 Month Goals"
            rubricLabel="UIE"
            tabKey="person-13"
            columns={["Active (1)", "Incubating (≤3)", "Dormant (∞)"]}
          />

          <Active13Panel tab="person" title="Selected Active 1–3 Month Goal" />
        </Section>
      ))}
    </div>
  );
}
