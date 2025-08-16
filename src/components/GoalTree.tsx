"use client";
import { useStore } from "@/state/useStore";
import { GoalNode } from "@/domain/types";
import { useMemo, useState } from "react";

/**
 * Renders a hierarchical goal tree starting from a given direction id (northStar).
 * - Centers the tree with scroll containment (family-tree vibe).
 * - Click a node to expand SMARTIER details.
 */

type NodeWithChildren = GoalNode & { children: NodeWithChildren[] };

function buildTree(goals: GoalNode[], rootId: string): NodeWithChildren | null {
  const byParent: Record<string, GoalNode[]> = {};
  for (const g of goals) {
    const pid = g.parentId ?? "__root__";
    (byParent[pid] ||= []).push(g);
  }
  const root = goals.find((g) => g.id === rootId);
  if (!root) return null;

  function attach(node: GoalNode): NodeWithChildren {
    const kids = (byParent[node.id] || []).map(attach);
    return { ...node, children: kids };
  }
  return attach(root);
}

const padClass = (level: number) =>
  level <= 0 ? "pl-0" : level === 1 ? "pl-4" : level === 2 ? "pl-8" : "pl-12";

export default function GoalTree({ directionId }: { directionId: string }) {
  const { goals } = useStore();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const tree = useMemo(() => buildTree(goals, directionId), [goals, directionId]);
  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const renderNode = (n: NodeWithChildren, level = 0) => {
    const show = !!open[n.id];
    return (
      <li key={n.id} className={`${padClass(level)} relative mb-2`}>
        <div className="rounded-lg border bg-white dark:bg-gray-800 p-2">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => toggle(n.id)}
              className="text-left font-medium text-sm hover:text-accent focus:outline-none"
              aria-expanded={show}
            >
              {n.title}
            </button>
            <span className="text-[10px] uppercase tracking-wide text-gray-500">
              {n.type}
            </span>
          </div>
          {show && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div><span className="font-semibold">SMARTIER:</span> {n.smartier || "—"}</div>
              {"lead" in n.weights || "lag" in n.weights ? (
                <div>
                  <span className="font-semibold">Metrics:</span>{" "}
                  Lead: {n.weights["lead"] ?? "—"} • Lag: {n.weights["lag"] ?? "—"}
                </div>
              ) : null}
            </div>
          )}
        </div>
        {n.children.length > 0 && (
          <ul className="mt-1 border-l border-gray-200 dark:border-gray-700 ml-4">
            {n.children.map((child) => renderNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="mt-3">
      <h3 className="font-semibold mb-2 text-center">Goal Tree</h3>
      <div className="mx-auto max-w-3xl max-h-72 overflow-auto border rounded-xl p-2 bg-white dark:bg-gray-800">
        {!tree ? (
          <div className="text-sm text-gray-500 text-center">No goals yet for this direction.</div>
        ) : (
          <ul className="list-none pl-0">{renderNode(tree, 0)}</ul>
        )}
      </div>
    </div>
  );
}
