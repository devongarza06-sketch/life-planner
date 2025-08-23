"use client";
import { useStore } from "@/state/useStore";
import type { Project } from "@/state/slices/projects.slice";
import { useMemo } from "react";

type Props = { project: Project };

export default function ProjectCard({ project }: Props) {
  const updateProject = useStore(s => s.updateProject);
  const addStep = useStore(s => s.addStep);
  const updateStep = useStore(s => s.updateStep);
  const removeStep = useStore(s => s.removeStep);

  const addStepAction = useStore(s => s.addStepAction);
  const updateStepAction = useStore(s => s.updateStepAction);
  const removeStepAction = useStore(s => s.removeStepAction);

  const scheduleProject = useStore(s => s.scheduleProjectToWeek);
  const scheduleStep = useStore(s => s.scheduleStepToWeek);

  const days = useMemo(() => (["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]), []);

  return (
    <div className="rounded-xl border p-3 bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <input
          className="bg-black/20 text-white border rounded px-2 py-1 font-semibold opacity-100"
          value={project.title}
          disabled={false}
          onChange={(e)=>updateProject(project.id,{ title:e.target.value })}
        />
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
            onClick={()=>scheduleProject(project.id)}
          >Schedule all steps</button>
        </div>
      </div>

      <div className="space-y-4">
        {project.steps.map((st)=>(
          <div key={st.id} className="rounded-lg border p-2">
            <div className="flex items-center justify-between mb-2">
              <input
                className="border rounded px-2 py-1 font-medium bg-black/20 text-white opacity-100"
                value={st.title}
                disabled={false}
                onChange={(e)=>updateStep(project.id, st.id, { title: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded border text-sm"
                  onClick={()=>scheduleStep(project.id, st.id)}
                >Schedule step</button>
                <button
                  className="text-red-400 hover:text-red-300 text-sm"
                  onClick={()=>removeStep(project.id, st.id)}
                >Remove step</button>
              </div>
            </div>

            <div className="text-xs text-gray-300 mb-1">Actions</div>
            {st.actions.length === 0 && (
              <div className="text-sm text-gray-400">No actions yet.</div>
            )}
            <div className="space-y-3">
              {st.actions.map((a)=> {
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
                        onChange={(e)=>updateStepAction(project.id, st.id, a.key, { label: e.target.value })}
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
                          onChange={(e)=>updateStepAction(project.id, st.id, a.key, { durationMin: parseInt(e.target.value||"0",10) })}
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
                          onChange={(e)=>updateStepAction(project.id, st.id, a.key, { mode: e.target.value as any })}
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
                              onChange={(e)=>updateStepAction(project.id, st.id, a.key, { day: parseInt(e.target.value,10) as any })}
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
                              onChange={(e)=>updateStepAction(project.id, st.id, a.key, { start: e.target.value||null })}
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
                              onChange={(e)=>updateStepAction(project.id, st.id, a.key, { frequencyPerWeek: parseInt(e.target.value||"1",10) })}
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
                                updateStepAction(project.id, st.id, a.key, { preferredDays: opts as any });
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
                        onClick={()=>removeStepAction(project.id, st.id, a.key)}
                      >Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="mt-2 px-3 py-1 rounded border text-sm"
              onClick={()=>addStepAction(project.id, st.id)}
            >
              + Add action
            </button>
          </div>
        ))}

        <button
          className="px-3 py-1 rounded border text-sm"
          onClick={()=>addStep(project.id)}
        >
          + Add step
        </button>
      </div>
    </div>
  );
}
