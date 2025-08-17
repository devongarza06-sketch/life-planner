"use client";
import { useStore } from "@/state/useStore";

const categories = ["Passion", "Person", "Play", "Misc"] as const;

export default function BudgetScales() {
  const { budgets, updateBudget } = useStore();
  const budget = budgets[0];

  const handle = (idx: number, v: number) => updateBudget(idx, v);

  const total = budget.daily.reduce((a,b)=>a+b, 0);

  return (
    <div className="mb-4 rounded-3xl border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weekly & Daily Scales</h2>
        <span className="text-xs text-slate-300">Total: {total}% (aim for 100%)</span>
      </div>
      <div className="grid md:grid-cols-4 gap-4 mt-3">
        {categories.map((label, idx) => (
          <div key={label} className="rounded-2xl bg-slate-800/50 p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{label}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={budget.daily[idx]}
              onChange={(e)=>handle(idx, parseInt(e.currentTarget.value))}
              className="w-full"
            />
            <div className="text-xs text-slate-300 mt-1">{budget.daily[idx]}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
