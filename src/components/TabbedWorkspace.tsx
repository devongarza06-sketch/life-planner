"use client";
import React, { useState } from "react";
import PassionTab from "./tabs/PassionTab";
import PersonTab from "./tabs/PersonTab";
import PlayTab from "./tabs/PlayTab";
import MiscTab from "./tabs/MiscTab";

const TABS = ["Passion", "Person", "Play", "Misc"] as const;

export default function TabbedWorkspace() {
  const [tab, setTab] = useState<typeof TABS[number]>("Passion");

  return (
    <div className="lp-card p-2 md:p-3">
      {/* Solid background so tabs never overlay transparent content */}
      <div className="flex items-center gap-2 sticky top-2 z-10 rounded-xl border border-slate-700/60 bg-slate-900 px-2 py-2">
        {TABS.map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "lp-chip transition-colors",
                isActive
                  ? // Active: solid violet, readable text, keep ring accent
                    "bg-violet-600 text-white ring-2 ring-[var(--lp-ring)]"
                  : // Inactive: solid slate, readable text, subtle hover
                    "bg-slate-700 text-slate-100 hover:bg-slate-600",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="p-3 md:p-4">
        {tab === "Passion" && <PassionTab />}
        {tab === "Person" && <PersonTab />}
        {tab === "Play" && <PlayTab />}
        {tab === "Misc" && <MiscTab />}
      </div>
    </div>
  );
}
