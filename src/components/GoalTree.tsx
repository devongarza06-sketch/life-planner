"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/state/useStore";
import { GoalNode } from "@/domain/types";
import { ChevronRight, ChevronDown } from "lucide-react";

type RenderNode = {
  id: string;
  title: string;
  directionId: string;
  parentId?: string | null;
  type?: string;
  smartier?: string;
  lead?: string;
  lag?: string;
  horizon?: string;
  children: RenderNode[];
};

function buildTree(goals: GoalNode[], directionId: string): RenderNode | null {
  const byParent: Record<string, GoalNode[]> = {};
  for (const g of goals) {
    const pid = (g as any).parentId ?? `ROOT-${(g as any).directionId}`;
    (byParent[pid] ||= []).push(g);
  }
  const rootKids = byParent[`ROOT-${directionId}`] || [];
  if (!rootKids.length) return null;

  const toNode = (g: GoalNode): RenderNode => {
    const kids = (byParent[(g as any).id] || []).map(toNode);
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

  return toNode(rootKids[0]);
}

export default function GoalTree({ directionId }: { directionId: string }) {
  const { goals } = useStore();
  const tree = useMemo(() => buildTree(goals, directionId), [goals, directionId]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  if (!tree) {
    return (
      <div className="text-sm text-slate-400 text-center">
        No goals found for this direction yet.
      </div>
    );
  }

  return (
    <div className="mt-3">
      <h3 className="font-semibold mb-2 text-center">Connected Tree (Family-style)</h3>
      <div className="mx-auto max-w-5xl max-h-[420px] overflow-auto lp-card p-6 lp-scroll">
        <TreeNode node={tree} open={open} toggle={toggle} depth={0} />
      </div>
    </div>
  );
}

function TreeNode({
  node,
  open,
  toggle,
  depth,
}: {
  node: RenderNode;
  open: Record<string, boolean>;
  toggle: (id: string) => void;
  depth: number;
}) {
  const isOpen = !!open[node.id];
  const hasChildren = node.children?.length > 0 && depth < 3; // limit to 3 levels

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div className="relative flex flex-col items-center">
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              onClick={() => toggle(node.id)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div className="px-3 py-1 rounded-full bg-accent text-white text-sm">
            {node.title}
          </div>
        </div>

        {isOpen && (
          <div className="mt-2 text-xs text-slate-300 space-y-1 text-center">
            {node.smartier && (
              <div>
                <span className="font-semibold">SMARTIER:</span> {node.smartier}
              </div>
            )}
            {(node.lead || node.lag) && (
              <div>
                Lead: {node.lead ?? "—"} • Lag: {node.lag ?? "—"}
              </div>
            )}
            {node.horizon && <div>Horizon: {node.horizon}</div>}
          </div>
        )}
      </div>

      {/* Children horizontally below */}
      {hasChildren && (
        <div className="flex justify-center gap-8 mt-6">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} open={open} toggle={toggle} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
