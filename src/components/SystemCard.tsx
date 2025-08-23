"use client";
import { useStore } from "@/state/useStore";
import type { SystemItem } from "@/state/slices/systems.slice";
import { useMemo } from "react";

type Props = { system: SystemItem };

export default function SystemCard({ system }: Props) {
  const updateSystem = useStore(s => s.updateSystem);
  const addAction = useStore(s => s.addSystemAction);
  const updateAction = useStore(s => s.updateSystemAction);
  const removeAction = useStore(s => s.removeSystemAction);
  const schedule = useStore(s => s.scheduleSystemToWeek);

  const days = useMemo(() => (["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]), []);

  return (
    <div className="rounded-xl border p-3 bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <input
          className="bg-black/20 text-white border rounded px-2 py-1 font-semibold opacity-100"
          value={system.title}
          disabled={false}
          onChange={(e)=>updateSystem(system.id,{ title:e.target.value })}
        />
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm bg-black/20 text-white opacity-100"
            value={system.status}
            disabled={false}
            onChange={(e)=>updateSystem(system.id,{ status: e.target.value as any })}
          >
            <option value="active">Active</option>
            <option value="dormant">Dormant</option>
          </select>
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
            onClick={()=>schedule(system.id)}
            title="Schedule all actions this week"
          >
            Schedule actions
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="text-xs text-gray-300 mb-1">Actions</div>
        {(!system.actions || system.actions.length===0) && (
          <div className="text-sm text-gray-400">No actions yet.</div>
        )}
        <div className="space-y-3">
          {(system.actions||[]).map((a)=> {
            const mode = a.mode ?? "specific";
            const durationMin = a.durationMin ?? 30;
            const dayVal = typeof a.day === "number" ? a.day : 1;
            const startVal = a.start ?? "";

            return (
              <div key={a.key} className="rounded-md border p-2">
                <div className="flex gap-2 mb-2">
                  <input
                    className="border rounded px-2 py-1 flex-1 bg-black/20 text-white opacity-100"
                    value={a.label ?? "New action"}
                    disabled={false}
                    onChange={(e)=>updateAction(system.id,a.key,{ label:e.target.value })}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-300">Duration</span>
                    <input
                      className="border rounded px-2 py-1 w-16 bg-black/20 text-white opacity-100"
                      type="number"
                      min={5}
                      step={5}
                      value={durationMin}
                      disabled={false}
                      onChange={(e)=>updateAction(system.id,a.key,{ durationMin: parseInt(e.target.value||"0",10) })}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-2 items-center">
                  <div>
                    <label className="text-xs block mb-1 text-gray-300">Mode</label>
                    <select
                      className="border rounded px-2 py-1 w-full bg-black/20 text-white opacity-100"
                      value={mode}
                      disabled={false}
                      onChange={(e)=>updateAction(system.id,a.key,{ mode: e.target.value as any })}
                    >
                      <option value="specific">Specific</option>
                      <option value="frequency">Frequency</option>
                    </select>
                  </div>

                  {mode === "specific" ? (
                    <>
                      <div>
                        <label className="text-xs block mb-1 text-gray-300">Day</label>
                        <select
                          className="border rounded px-2 py-1 w-full bg-black/20 text-white opacity-100"
                          value={dayVal}
                          disabled={false}
                          onChange={(e)=>updateAction(system.id,a.key,{ day: parseInt(e.target.value,10) as any })}
                        >
                          {days.map((d,i)=>(<option key={i} value={i}>{d}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs block mb-1 text-gray-300">Time (optional)</label>
                        <input
                          className="border rounded px-2 py-1 w-full bg-black/20 text-white placeholder:text-gray-400 opacity-100"
                          placeholder="HH:MM"
                          value={startVal}
                          disabled={false}
                          onChange={(e)=>updateAction(system.id,a.key,{ start: e.target.value||null })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs block mb-1 text-gray-300">Times / week</label>
                        <input
                          className="border rounded px-2 py-1 w-full bg-black/20 text-white opacity-100"
                          type="number"
                          min={1} max={7}
                          value={a.frequencyPerWeek ?? 1}
                          disabled={false}
                          onChange={(e)=>updateAction(system.id,a.key,{ frequencyPerWeek: parseInt(e.target.value||"1",10) })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs block mb-1 text-gray-300">Preferred days (optional)</label>
                        <select
                          className="border rounded px-2 py-1 w-full bg-black/20 text-white opacity-100"
                          multiple
                          value={(a.preferredDays as any) || []}
                          disabled={false}
                          onChange={(e)=>{
                            const opts = Array.from(e.target.selectedOptions).map(o=>parseInt(o.value,10));
                            updateAction(system.id,a.key,{ preferredDays: opts as any });
                          }}
                        >
                          {days.map((d,i)=>(<option key={i} value={i}>{d}</option>))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    className="text-red-400 hover:text-red-300 text-sm"
                    onClick={()=>removeAction(system.id, a.key)}
                  >Remove</button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="mt-2 px-3 py-1 rounded border text-sm"
          onClick={()=>addAction(system.id)}
        >
          + Add action
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded border p-2">
          <div className="font-semibold text-sm mb-1">O‑C‑V‑E‑D‑A‑R</div>
          <div className="text-xs text-gray-500">No entries yet.</div>
        </div>
        <div className="rounded border p-2">
          <div className="font-semibold text-sm mb-1">O‑P‑I‑S‑M‑I‑T</div>
          <div className="text-xs text-gray-500">No entries yet.</div>
        </div>
      </div>
    </div>
  );
}
