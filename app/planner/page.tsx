import BudgetScales from "@/components/BudgetScales";
import PlannerWeek from "@/components/PlannerWeek";
import TabbedWorkspace from "@/components/TabbedWorkspace";

/**
 * Planner page – wraps budgets, calendar, and the tabbed workspace.
 * All visuals are delegated to src/components for modularity.
 */
export default function PlannerPage() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      <BudgetScales />
      <PlannerWeek />
      <TabbedWorkspace />
    </div>
  );
}
