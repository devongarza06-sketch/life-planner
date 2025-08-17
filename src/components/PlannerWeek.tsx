"use client";
import { useStore } from "@/state/useStore";

const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const todayIdx = new Date().getDay();

export default function PlannerWeek(){
  const { tasks } = useStore();

  return (
    <div>
      <h3 className="font-semibold mb-2">Weekly Planner</h3>
      <div className="grid grid-cols-7 gap-3">
        {dayNames.map((d, idx)=> (
          <div
            key={d}
            className={`rounded-2xl border p-3 min-h-[220px] ${idx===todayIdx? 'border-indigo-500 bg-indigo-50/10':''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{d}</div>
              {idx===todayIdx && <span className="text-xs lp-chip">Today</span>}
            </div>
            <div className="space-y-2">
              {tasks.filter(t=>t.day===idx).map(t=> (
                <div
                  key={t.id}
                  className={`w-full text-left rounded-xl px-3 py-2 border ${t.fixed? 'bg-white/10':'bg-white/5'} hover:bg-white/10`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{t.start}–{t.end}</span>
                    <span className="lp-chip">{t.bucket}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-100">{t.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
