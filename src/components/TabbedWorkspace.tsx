"use client";
import React, { useState } from "react";
import PassionTab from "./tabs/PassionTab";
import PersonTab from "./tabs/PersonTab";
import PlayTab from "./tabs/PlayTab";
import MiscTab from "./tabs/MiscTab";

const TABS = ["Passion","Person","Play","Misc"] as const;

export default function TabbedWorkspace(){
  const [tab, setTab] = useState<typeof TABS[number]>("Passion");
  return (
    <div className="lp-card p-2 md:p-3">
      <div className="flex items-center gap-2 sticky top-2 bg-transparent z-10">
        {TABS.map((t)=> (
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={`lp-chip ${tab===t ? "ring-2 ring-[var(--lp-ring)] bg-white/15" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="p-3 md:p-4">
        {tab==='Passion' && <PassionTab/>}
        {tab==='Person' && <PersonTab/>}
        {tab==='Play' && <PlayTab/>}
        {tab==='Misc' && <MiscTab/>}
      </div>
    </div>
  );
}
