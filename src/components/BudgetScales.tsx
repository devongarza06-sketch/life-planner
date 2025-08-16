"use client";
import React, { useState } from "react";
import { useStore } from "@/state/useStore";

/**
 * BudgetScales (accessible, high-contrast)
 * - Shows a Week/Day toggle with clear pill buttons (no external UI lib).
 * - Ensures all labels (Passion/Person/Play/Misc) remain readable.
 * - Persists daily/weekly budget math via the store's updateBudget.
 */

const categories = ["Passion", "Person", "Play", "Misc"] as const;

export default function BudgetScales() {
  const { budgets, updateBudget } = useStore();
  const [mode, setMode] = useState<"week" | "day">("week");

  const budget = budgets[0] || {
    id: "",
    dateRange: "",
    daily: [25, 25, 25, 25] as [number, number, number, number],
    weekly: [175, 175, 175, 175] as [number, number, number, number]
  };

  const handleChange = (idx: number, value: number) => {
    // clamp between 0-100 for percentages
    const v = Math.max(0, Math.min(100, value));
    const daily = [...budget.daily] as [number, number, number, number];
    daily[idx] = v;
    const weekly = daily.map((d) => d * 7) as [number, number, number, number];
    updateBudget({ ...budget, daily, weekly });
  };

  const totalPct = budget.daily.reduce((a, b) => a + b, 0);

  return (
    <div
      className="rounded-2xl p-4 shadow border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
      data-component="BudgetScales"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 rounded bg-white/60" />
          <h2 className="text-lg font-semibold">Weekly &amp; Daily Scales</h2>
        </div>

        {/* Week/Day toggle — high contrast */}
        <div className="inline-flex items-center rounded-full bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setMode("week")}
            className={
              "px-3 py-1 rounded-full text-sm font-medium transition " +
              (mode === "week" ? "bg-white text-slate-900" : "text-white hover:bg-white/15")
            }
            aria-pressed={mode === "week"}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setMode("day")}
            className={
              "px-3 py-1 rounded-full text-sm font-medium transition " +
              (mode === "day" ? "bg-white text-slate-900" : "text-white hover:bg-white/15")
            }
            aria-pressed={mode === "day"}
          >
            Day
          </button>
        </div>
      </div>

      <p className="text-sm text-white/80 mt-2">
        Drag sliders to allocate focus. Aim for 100%. This view controls your {mode} distribution.
      </p>

      <div className="mt-3 space-y-2">
        {categories.map((cat, idx) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="w-20 text-sm font-medium text-white drop-shadow-sm">{cat}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={budget.daily[idx]}
              onChange={(e) => handleChange(idx, parseInt(e.target.value, 10))}
              className="flex-1 accent-white"
              aria-label={`${cat} ${mode} percentage`}
            />
            <span className="w-14 text-right text-sm tabular-nums">{budget.daily[idx]}%</span>
          </div>
        ))}
      </div>

      {/* Total bar */}
      <div className="mt-3">
        <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${Math.max(0, Math.min(100, totalPct))}%` }}
          />
        </div>
        <div className="text-xs mt-1 text-white/80">Total: {totalPct}% (aim for 100%)</div>
      </div>
    </div>
  );
}
