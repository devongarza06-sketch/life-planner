"use client";
import { PlannerAction } from "@/domain/types";

function endFromStart(start?: string | null, durationMin?: number): string | null {
  if (!start || !durationMin) return null;
  const [hh, mm] = start.split(":").map(Number);
  if (isNaN(hh) || isNaN(mm)) return null;
  const total = hh * 60 + mm + durationMin;
  const eH = Math.floor((total % (24 * 60)) / 60);
  const eM = total % 60;
  return `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;
}

/** Planner card: ONLY label + time window. High-contrast by default. */
export default function PlannerActionCard({
  action,
  onClick,
}: {
  action: PlannerAction;
  onClick?: () => void;
}) {
  const end = endFromStart(action.start, action.durationMin);
  const when = action.start ? `${action.start}${end ? `–${end}` : ""}` : "Unscheduled";

  return (
    <div
      className="rounded border border-slate-300 bg-white p-2 text-sm shadow-sm hover:shadow cursor-default"
      onClick={onClick}
      role="group"
      aria-label={`Action ${action.label}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-slate-900 truncate">{action.label}</div>
        <div className="text-xs text-slate-700">{when}</div>
      </div>
    </div>
  );
}
