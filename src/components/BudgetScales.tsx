"use client";
import { useStore } from "@/state/useStore";

/**
 * Slider controls for adjusting the weekly/daily time budgets
 * for Passion, Person, Play and Misc categories.
 */
const categories = ["Passion", "Person", "Play", "Misc"] as const;

export default function BudgetScales() {
  const { budgets, updateBudget } = useStore();
  const budget = budgets[0] || {
    id: "",
    dateRange: "",
    daily: [25, 25, 25, 25] as [number, number, number, number],
    weekly: [175, 175, 175, 175] as [number, number, number, number]
  };

  const handleChange = (idx: number, value: number) => {
    const daily = [...budget.daily] as [number, number, number, number];
    daily[idx] = value;
    const weekly = daily.map((d) => d * 7) as [number, number, number, number];
    updateBudget({ ...budget, daily, weekly });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Time Budgets</h2>
      <p className="text-sm text-gray-500 mb-3">
        Allocate your focus for the week. Aim for roughly 100% total across buckets.
      </p>
      <div className="grid md:grid-cols-2 gap-2">
        {categories.map((cat, idx) => (
          <div key={cat} className="flex items-center gap-3 py-1">
            <span className="w-24 text-sm font-medium">{cat}</span>
            <input
              aria-label={`${cat} percentage`}
              type="range"
              min={0}
              max={60}
              value={budget.daily[idx]}
              onChange={(e) => handleChange(idx, parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-14 text-right text-sm tabular-nums">{budget.daily[idx]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
