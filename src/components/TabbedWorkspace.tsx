"use client";
import { useStore } from "@/state/useStore";
import PassionTab from "./tabs/PassionTab";
import PersonTab from "./tabs/PersonTab";
import PlayTab from "./tabs/PlayTab";
import MiscTab from "./tabs/MiscTab";

/**
 * Top‑level workspace containing four tabs and their content.
 */
const tabList = [
  { id: "passion", label: "Passion" },
  { id: "person", label: "Person" },
  { id: "play", label: "Play" },
  { id: "misc", label: "Misc" }
];

export default function TabbedWorkspace() {
  const { selectedTab, setSelectedTab } = useStore();

  return (
    <div>
      <div className="flex gap-2 border-b" data-component="TabbedWorkspace">
      {tabList.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSelectedTab(tab.id as any)}
          className={`px-4 py-2 border-b-2 ${
            selectedTab === tab.id
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
      </div>
      <div className="pt-4">
        {selectedTab === "passion" && <PassionTab />}
        {selectedTab === "person" && <PersonTab />}
        {selectedTab === "play" && <PlayTab />}
        {selectedTab === "misc" && <MiscTab />}
      </div>
    </div>
  );
}
