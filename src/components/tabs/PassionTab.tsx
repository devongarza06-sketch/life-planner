"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import AIDBoard from "@/components/AIDBoard";
import { useStore } from "@/state/useStore";
import Active13Panel from "@/components/Active13Panel";


export default function PassionTab() {
  const { selected } = useStore();
  const directionId = selected.passion ?? null;

  return (
    <div className="space-y-6">
      <NorthStarBar tab="passion" />
      <VisionBoxes tab="passion" />

      <div className="mt-2">
        <GoalTree directionId={directionId ?? ""} />
      </div>

      <AIDBoard
        label="Annual Themes (12+ months)"
        rubricLabel="IART+G"
        tabKey="passion-annual"
        columns={["Active (3)", "Incubating (≤3)", "Dormant (∞)"]}
      />

      <AIDBoard
        label="1–3 Month Goals"
        rubricLabel="IART+G"
        tabKey="passion-13"
        columns={["Active (3)", "Incubating (≤3)", "Dormant (∞)"]}
      />

      <Active13Panel tabKey="passion-13" title="1–3 Month Active Goals" />
    </div>
  );
}
