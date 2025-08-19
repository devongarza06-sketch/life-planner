"use client";
import { useMemo } from "react";
import { useStore } from "@/state/useStore";
import type { GoalNode, PlannerAction, TabId } from "@/domain/types";
import Active13EditModal from "@/components/Active13EditModal";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function endFromStart(start?: string | null, durationMin?: number): string | null {
  if (!start || !durationMin) return null;
  const [hh, mm] = start.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const total = (hh * 60 + mm + durationMin) % (24 * 60);
  const eh = Math.floor(total / 60);
  const em = total % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

export default function Active13Panel({ tab }: { tab?: TabId }) {
  const { boards, goals, setOpenActive13ForGoalId, plannerActions } = useStore();

  const activeCards = useMemo(() => {
    const all = boards.filter((b) => b.tabId.endsWith("-13") && b.status === "active");
    if (!tab) return all;
    const key = `${tab}-13`;
    return all.filter((b) => b.tabId === key);
  }, [boards, tab]);

  const items = activeCards
    .map((c) => goals.find((g) => g.id === c.id))
    .filter(Boolean) as GoalNode[];

  return (
    <>
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
        <header className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-100">Selected Active 1–3 Month Goals</h3>
        </header>

        {items.length === 0 ? (
          <div className="text-sm text-slate-300">No active 1–3 month goals yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                actionsForGoal={plannerActions.filter((p) => p.goalId === g.id)}
                onEdit={() => setOpenActive13ForGoalId(g.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Active13EditModal />
    </>
  );
}

function GoalCard({
  goal,
  actionsForGoal,
  onEdit,
}: {
  goal: GoalNode;
  actionsForGoal: PlannerAction[];
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-700 p-3 bg-slate-900/30">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-slate-100">{goal.title}</div>
        <div className="flex items-center gap-2">
          {goal.lead && (
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
              Lead: {goal.lead}
            </span>
          )}
          {goal.lag && (
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
              Lag: {goal.lag}
            </span>
          )}
          <button
            onClick={onEdit}
            aria-label="Edit 1–3 month details"
            className="text-xs rounded border border-slate-600 px-2 py-1 text-slate-200 hover:bg-slate-800"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-2">
        <div className="text-xs font-semibold text-slate-200 mb-1">Milestones</div>
        {goal.milestones && goal.milestones.length > 0 ? (
          <ul className="text-sm list-disc pl-5 space-y-1">
            {goal.milestones.map((m) => (
              <li key={m.key} className="text-slate-100">
                {m.label}
                {m.target ? <span className="text-slate-300"> — {m.target}</span> : null}
                {m.dueWeek ? <span className="ml-2 text-slate-400">({m.dueWeek})</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-300">No milestones yet.</div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3">
        <div className="text-xs font-semibold text-slate-200 mb-1">Actions</div>
        {goal.actionsTemplate && goal.actionsTemplate.length > 0 ? (
          <div className="space-y-2">
            {goal.actionsTemplate.map((a) => {
              let when = "";
              if (a.mode === "specific") {
                const d = typeof a.day === "number" ? DAY[a.day] : "Day?";
                when = `${d}${a.start ? ` ${a.start}` : ""} • ${a.durationMin}m`;
              } else {
                const freq = a.frequencyPerWeek ?? 0;
                const days =
                  a.preferredDays && a.preferredDays.length
                    ? " " + a.preferredDays.map((i) => DAY[i]).join("/")
                    : "";
                const t = a.preferredStart ? ` ${a.preferredStart}` : "";
                when = `${freq}×/wk${days}${t} • ${a.durationMin}m`;
              }

              const instances = actionsForGoal.filter((p) => p.templateKey === a.key);
              const weekLine =
                instances.length > 0
                  ? "This week: " +
                    instances
                      .map((p) => {
                        const end = endFromStart(p.start, p.durationMin);
                        if (!p.start) return `${DAY[p.day]} (unscheduled)`;
                        return `${DAY[p.day]} ${p.start}${end ? `-${end}` : ""}`;
                      })
                      .join(", ")
                  : "";

              return (
                <div key={a.key} className="rounded border border-slate-700 bg-slate-900/40 p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-100">{a.label}</div>
                    <div className="text-xs text-slate-300">{when}</div>
                  </div>

                  {(a.ifThenYet || a.rationale) && (
                    <div className="mt-1 text-xs text-slate-300 space-y-0.5">
                      {a.ifThenYet && (
                        <div>
                          <span className="font-semibold">If/Then/Yet:</span>{" "}
                          <span>{a.ifThenYet}</span>
                        </div>
                      )}
                      {a.rationale && (
                        <div>
                          <span className="font-semibold">Why:</span>{" "}
                          <span>{a.rationale}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {weekLine && <div className="mt-1 text-xs text-slate-400">{weekLine}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-300">No actions yet.</div>
        )}
      </div>

      {/* Framework notes */}
      <div className="mt-3 grid md:grid-cols-2 gap-2">
        <div className="rounded border border-slate-700 bg-slate-900/40 p-2">
          <div className="text-xs font-semibold text-slate-200 mb-1">O‑C‑V‑E‑D‑A‑R</div>
          <pre className="whitespace-pre-wrap text-xs text-slate-300">
{formatKV(goal.ocvedar)}
          </pre>
        </div>
        <div className="rounded border border-slate-700 bg-slate-900/40 p-2">
          <div className="text-xs font-semibold text-slate-200 mb-1">O‑P‑I‑S‑M‑I‑T</div>
          <pre className="whitespace-pre-wrap text-xs text-slate-300">
{formatKV(goal.opismit)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function formatKV(obj: any): string {
  if (!obj) return "No entries yet.";
  const entries = Object.entries(obj).filter(([, v]) => v);
  if (entries.length === 0) return "No entries yet.";
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join("\n");
}
