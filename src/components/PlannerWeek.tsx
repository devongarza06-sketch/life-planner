"use client";
import { useMemo } from "react";
import { useStore } from "@/state/useStore";
import PlannerActionCard from "@/components/PlannerActionCard";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PlannerWeek() {
  const { plannerActions, prefs } = useStore();

  const byDay = useMemo(() => {
    const grouped: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const a of plannerActions) grouped[a.day].push(a);
    for (const d of Object.keys(grouped)) {
      grouped[+d] = grouped[+d].sort((a, b) => {
        const sa = a.start ? a.start : "";
        const sb = b.start ? b.start : "";
        if (!sa && !sb) return (a.order || 0) - (b.order || 0);
        if (!sa) return -1; // floating first
        if (!sb) return 1;
        return sa.localeCompare(sb);
      });
    }
    return grouped;
  }, [plannerActions]);

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-4">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Weekly Planner</h3>
        <div className="text-xs text-slate-700">Snap: {prefs.plannerGridMinutes} min</div>
      </header>

      <div className="grid grid-cols-7 gap-3">
        {dayNames.map((d, i) => {
          const floating = byDay[i].filter((a) => !a.start);
          const scheduled = byDay[i].filter((a) => !!a.start);
          return (
            <div
              key={d}
              className="rounded-xl border border-slate-300 bg-slate-50 p-2"
            >
              <div className="font-semibold text-slate-900 mb-2">{d}</div>

              {/* Floating */}
              <div className="mb-3">
                <div className="text-xs text-slate-700 mb-1">Unscheduled</div>
                <div className="space-y-2">
                  {floating.length ? (
                    floating.map((a: any) => <PlannerActionCard key={a.id} action={a} />)
                  ) : (
                    <div className="text-xs text-slate-500">None</div>
                  )}
                </div>
              </div>

              {/* Scheduled */}
              <div>
                <div className="text-xs text-slate-700 mb-1">Scheduled</div>
                <div className="space-y-2">
                  {scheduled.length ? (
                    scheduled.map((a: any) => <PlannerActionCard key={a.id} action={a} />)
                  ) : (
                    <div className="text-xs text-slate-500">None</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
