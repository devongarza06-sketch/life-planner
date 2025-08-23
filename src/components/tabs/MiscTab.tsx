"use client";
import { useStore } from "@/state/useStore";
import SystemCard from "@/components/SystemCard";
import ProjectCard from "@/components/ProjectCard";
import { useMemo } from "react";

export default function MiscTab(){
  const families = [
    "Finance & Money Ops","Home & Environment","Errands & Procurement","Digital Hygiene","Legal & Identity","Healthcare Admin","Work/School Admin","Transportation & Travel","Security & Risk","Life Ops & Organization","Pets & Dependents","Events & Seasonal Prep","Relationships & Civic Admin"
  ];

  const systems = useStore(s => s.systems);
  const addSystem = useStore(s => s.addSystem);

  const projects = useStore(s => s.projects);
  const addProject = useStore(s => s.addProject);

  const activeSystems = systems.filter(s => s.status === "active");
  const dormantSystems = systems.filter(s => s.status === "dormant");

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
        <h3 className="font-semibold mb-2">Systems & Projects Areas</h3>
        <details className="rounded-xl border">
          <summary className="px-3 py-2 cursor-pointer">Show Areas</summary>
          <div className="p-3 grid md:grid-cols-2 gap-2">
            {families.map((name)=> (<div key={name} className="text-sm text-gray-600 dark:text-gray-300">{name}</div>))}
          </div>
        </details>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* LEFT: Systems */}
        <div className="bg-white/5 rounded-2xl p-3 shadow space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Miscellaneous Systems</h4>
            <button className="px-3 py-1 rounded border text-sm" onClick={()=>addSystem()}>+ Add system</button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Active Systems</div>
              {activeSystems.length === 0 && (<div className="text-sm text-gray-500">None yet.</div>)}
              <div className="space-y-3">
                {activeSystems.map(sys => (<SystemCard key={sys.id} system={sys} />))}
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Dormant Systems</div>
              {dormantSystems.length === 0 && (<div className="text-sm text-gray-500">None.</div>)}
              <div className="space-y-3">
                {dormantSystems.map(sys => (<SystemCard key={sys.id} system={sys} />))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Projects */}
        <div className="bg-white/5 rounded-2xl p-3 shadow space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Mini‑Projects</h4>
            <button className="px-3 py-1 rounded border text-sm" onClick={()=>addProject()}>+ Add project</button>
          </div>

          {projects.length === 0 && (
            <div className="text-sm text-gray-500">No mini‑projects yet.</div>
          )}

          <div className="space-y-3">
            {projects.map(p => (<ProjectCard key={p.id} project={p} />))}
          </div>

          {/* Monthly Admin Day helper box retained */}
          <div className="rounded-2xl border p-3">
            <h5 className="font-semibold mb-2">Monthly Admin Day</h5>
            <ul className="list-disc ml-4 text-sm space-y-1">
              <li>Finance sweep: bills, budget, transfers</li>
              <li>Digital sweep: inbox, files, backups</li>
              <li>Subscriptions audit</li>
              <li>Surface & schedule mini-projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
