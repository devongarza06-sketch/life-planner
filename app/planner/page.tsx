"use client";

import React from "react";

import BudgetScales from "@/components/BudgetScales";
import PlannerWeek from "@/components/PlannerWeek";
import TabbedWorkspace from "@/components/TabbedWorkspace";

export default function PlannerPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* HERO */}
      <section className="lp-hero p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="lp-title">Design your week like a pro.</h1>
            <p className="lp-sub mt-1">
              Turn motives into motion: focus budgets, visible wins, tiny experiments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="lp-chip">Streak: 7</span>
            <span className="lp-chip">Wins today: 3</span>
          </div>
        </div>
      </section>

      {/* WEEKLY/DAILY SCALES */}
      <section className="lp-card p-4 md:p-6">
        <BudgetScales />
      </section>

      {/* WEEKLY PLANNER */}
      <section className="lp-card p-4 md:p-6">
        <PlannerWeek />
      </section>

      {/* TABS */}
      <TabbedWorkspace />

      <p className="text-center text-xs text-slate-400">
        Prototype UI: swap sample data with your goals, rituals, and experiments.
      </p>
    </div>
  );
}
