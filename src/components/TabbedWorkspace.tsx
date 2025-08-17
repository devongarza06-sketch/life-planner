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
    <div className="rounded-3xl border bg-white dark:bg-gray-800 shadow">
      <div className="flex items-center gap-2 p-3 sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur z-10">
        {TABS.map((t)=> (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded-full border ${tab===t? 'bg-accent text-white border-accent shadow':'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{t}</button>
        ))}
      </div>
      <div className="p-4 md:p-6">
        {tab==='Passion' && <PassionTab/>}
        {tab==='Person' && <PersonTab/>}
        {tab==='Play' && <PlayTab/>}
        {tab==='Misc' && <MiscTab/>}
      </div>
    </div>
  );
}
