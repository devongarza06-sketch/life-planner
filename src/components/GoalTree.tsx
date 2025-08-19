"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/state/useStore";
import type { GoalNode } from "@/domain/types";
import GoalTreeNode from "./GoalTreeNode";

function buildTree(goals: GoalNode[], directionId: string) {
  const byParent: Record<string, GoalNode[]> = {};
  goals.forEach((g) => {
    const pid = g.parentId ?? `ROOT-${g.directionId}`;
    (byParent[pid] ||= []).push(g);
  });
  const roots = byParent[`ROOT-${directionId}`] || [];
  if (!roots.length) return null;

  const toNode = (g: GoalNode) => ({
    id: g.id,
    title: g.title ?? "Untitled",
    directionId: g.directionId,
    parentId: g.parentId ?? null,
    children: (byParent[g.id] || []).map(toNode),
  });

  return toNode(roots[0]);
}

export default function GoalTree({ directionId }: { directionId: string }) {
  const { goals } = useStore();
  const tree = useMemo(() => buildTree(goals, directionId), [goals, directionId]);

  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const toggleDetails = (id: string) =>
    setOpenDetails((o) => ({ ...o, [id]: !o[id] }));

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
      <div className="relative mx-auto max-w-5xl max-h-[420px] overflow-auto p-6 rounded-xl bg-slate-800/40">
        <GoalTreeNode
          node={tree}
          depth={0}
          openDetails={openDetails}
          onToggleDetails={toggleDetails}
        />
      </div>
    </div>
  );
}
