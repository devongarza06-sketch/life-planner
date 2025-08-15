"use client";
import { useStore } from "@/state/useStore";

/**
 * Slider controls for adjusting the weekly/daily time budgets
 * for Passion, Person, Play and Misc categories.
 */
const categories = ["Passion", "Person", "Play", "Misc"];

export default function BudgetScales() {
  const { budgets, updateBudget } = useStore();
  const budget = budgets[0] || {
    id: "",
    dateRange: "",
    daily: [25, 25, 25, 25],
    weekly: [175, 175, 175, 175]
  };

  const handleChange = (idx: number, value: number) => {
    const daily = [...budget.daily] as [number, number, number, number];
    daily[idx] = value;
    const weekly = daily.map((d) => d * 7) as [number, number, number, number];
    updateBudget({ ...budget, daily, weekly });
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Time Budgets</h2>
      {categories.map((cat, idx) => (
        <div key={cat} className="flex items-center gap-3 py-1">
          <span className="w-20 text-sm font-medium">{cat}</span>
          <input
            type="range"
            min={5}
            max={60}
            value={budget.daily[idx]}
            onChange={(e) => handleChange(idx, parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="w-12 text-right text-sm">{budget.daily[idx]}%</span>
        </div>
      ))}
    </div>
  );
}
