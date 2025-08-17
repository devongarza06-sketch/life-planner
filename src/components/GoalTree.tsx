"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/state/useStore";
import { GoalNode } from "@/domain/types";

/**
 * RenderNode is a UI-facing view model.
 * We keep EVERYTHING we read in JSX optional to avoid type errors
 * when upstream domain objects evolve (e.g., 'horizon' missing).
 */
type RenderNode = {
  id: string;
  title: string;
  directionId: string;
  parentId?: string | null;
  type?: string;
  smartier?: string;   // full SMARTIER text
  lead?: string;
  lag?: string;
  horizon?: string;    // e.g., "1–3 mo"
  children: RenderNode[];
};

/** Build a family-style tree from flat GoalNode[] for a given direction */
function buildTree(goals: GoalNode[], directionId: string): RenderNode | null {
  // Group by parent id (fallback to synthetic ROOT per direction)
  const byParent: Record<string, GoalNode[]> = {};
  for (const g of goals) {
    const pid = (g as any).parentId ?? `ROOT-${(g as any).directionId}`;
    (byParent[pid] ||= []).push(g);
  }

  const rootKids = byParent[`ROOT-${directionId}`] || [];
  if (!rootKids.length) return null;

  const toNode = (g: GoalNode): RenderNode => {
    const kids = (byParent[(g as any).id] || []).map(toNode);
    // Map only what the UI needs; use (g as any) for optional props
    return {
      id: (g as any).id,
      title: (g as any).title ?? "Untitled",
      directionId: (g as any).directionId,
      parentId: (g as any).parentId ?? null,
      type: (g as any).type,
      smartier: (g as any).smartier ?? (g as any).smart ?? undefined,
      lead: (g as any).lead ?? undefined,
      lag: (g as any).lag ?? undefined,
      horizon: (g as any).horizon ?? undefined,
      children: kids,
    };
  };

  // Take the first “peak” node as the visual root
  return toNode(rootKids[0]);
}

/** Family-style centered tree. Click a node to expand SMARTIER details. */
export default function GoalTree({ directionId }: { directionId: string }) {
  const { goals } = useStore();
  const tree = useMemo(() => buildTree(goals, directionId), [goals, directionId]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const renderNode = (n: RenderNode) => {
    const show = !!open[n.id];
    return (
      <li key={n.id} className="relative mb-4 list-none">
        <div className="mx-auto max-w-md rounded-xl border p-2 lp-card">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => toggle(n.id)}
              className="text-left font-medium text-sm hover:text-accent focus:outline-none"
              aria-expanded={show}
            >
              {n.title}
            </button>
            {n.type && (
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                {n.type}
              </span>
            )}
          </div>

          {show && (
            <div className="mt-2 text-xs text-slate-300 space-y-1">
              {n.smartier && (
                <div>
                  <span className="font-semibold">SMARTIER:</span> {n.smartier}
                </div>
              )}
              {(n.lead || n.lag) && (
                <div>
                  Lead: {n.lead ?? "—"} • Lag: {n.lag ?? "—"}
                </div>
              )}
              {n.horizon && <div>Horizon: {n.horizon}</div>}
            </div>
          )}
        </div>

        {n.children?.length > 0 && (
          <ul className="pl-6 mt-3">{n.children.map((ch) => renderNode(ch))}</ul>
        )}
      </li>
    );
  };

  return (
    <div className="mt-3">
      <h3 className="font-semibold mb-2 text-center">Connected Tree (Family-style)</h3>
      <div className="mx-auto max-w-4xl max-h-[420px] overflow-auto lp-card p-3 lp-scroll">
        {!tree ? (
          <div className="text-sm text-slate-400 text-center">
            No goals found for this direction yet.
          </div>
        ) : (
          <ul className="pl-0">{renderNode(tree)}</ul>
        )}
      </div>
    </div>
  );
}

