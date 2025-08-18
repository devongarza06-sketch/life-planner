"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";
import VisionBoxes from "../../VisionBoxes";
import GoalTree from "../../GoalTree";
import AidBoard from "../../AidBoard";
import ActiveQuarterGoals from "../../ActiveQuarterGoals";

export default function PersonSection({ section }:{section:{id:string; label:string}}){
  // minimal: only physical has defined data in seeds (athlete)
  const directions = section.id === 'physical'
    ? [{id:'athlete', label:'Athletic Clinician'}]
    : [{id:`${section.id}-tbd`, label:'Add Direction'}];

  const [open, setOpen] = useState<boolean>(section.id==='physical');
  const [selected, setSelected] = useState<string>(directions[0].id);
  const vision = useStore((s)=> s.visions.find(v=> v.id === selected));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex justify-between items-center">
        <span className="font-semibold">{section.label}</span>
        <span className="text-xl">{open? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-3">
          <div className="flex gap-2 overflow-auto">
            {directions.map(d=> (
              <button key={d.id} onClick={()=>setSelected(d.id)} className={`whitespace-nowrap px-3 py-1 rounded-full ${selected===d.id? 'bg-accent text-white':'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100'}`}>{d.label}</button>
            ))}
          </div>
          <VisionBoxes vision={vision}/>
          <GoalTree directionId={selected}/>
          <AidBoard tabId={`person-${section.id}`} rubricLabel="UIE"/>
          {/* NEW: 1–3 Month Active Goals — single card for person section */}
          <ActiveQuarterGoals variant="person" sectionId={section.id} />
        </div>
      )}
    </div>
  );
}
