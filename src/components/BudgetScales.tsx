"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/state/useStore";

const categories = ["Passion", "Person", "Play", "Misc"] as const;

export default function BudgetScales() {
  const { budgets, updateBudget } = useStore();
  const budget = budgets[0];

  // Client-only render gate to avoid hydration warnings in dev.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // Render a minimal shell to keep layout stable
    return <div suppressHydrationWarning className="min-h-[120px]" />;
  }

  const handle = (idx: number, v: number) => updateBudget(idx, v);
  const total = budget.daily.reduce((a, b) => a + b, 0);

  return (
    <div suppressHydrationWarning>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg md:text-xl font-semibold">Weekly & Daily Scales</h3>
        <div className="flex gap-2">
          <span className="lp-chip">Week</span>
          <span className="lp-chip">Day</span>
        </div>
      </div>
      <p className="lp-sub mb-3">
        Drag to allocate focus. Aim for 100%. Use Amplify to boost 1–2 buckets this week.
      </p>

      <div className="grid md:grid-cols-4 gap-4">
        {categories.map((label, idx) => (
          <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{label}</div>
              <button className="lp-chip">Amplify</button>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={budget.daily[idx]}
              onChange={(e) => handle(idx, parseInt(e.currentTarget.value))}
              className="w-full"
            />
            <div className="text-xs text-slate-300 mt-1">
              {budget.daily[idx]}% • of weekly controllable hours
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-300">Total: {total}% (aim for 100%)</div>
    </div>
  );
}
