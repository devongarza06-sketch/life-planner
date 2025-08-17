"use client";
import { useStore } from "@/state/useStore";

const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const todayIdx = new Date().getDay();

export default function PlannerWeek(){
  const { tasks } = useStore();

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow">
      <h3 className="font-semibold mb-2">Weekly Planner</h3>
      <div className="grid grid-cols-7 gap-3">
        {dayNames.map((d, idx)=> (
          <div key={d} className={`rounded-2xl border p-3 min-h-[220px] ${idx===todayIdx? 'border-indigo-500 bg-indigo-50/40 dark:bg-gray-700/30':''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{d}</div>
              {idx===todayIdx && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-200">Today</span>}
            </div>
            <div className="space-y-2">
              {tasks.filter(t=>t.day===idx).map(t=> (
                <div key={t.id} className={`w-full text-left rounded-xl px-3 py-2 border ${t.fixed? 'bg-slate-100/80 dark:bg-gray-700/50':'bg-white dark:bg-gray-700'} hover:bg-slate-50 dark:hover:bg-gray-600`}>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-300">
                    <span>{t.start}–{t.end}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-gray-600 dark:text-gray-100">{t.bucket}</span>
                  </div>
                  <div className="text-sm font-medium">{t.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
