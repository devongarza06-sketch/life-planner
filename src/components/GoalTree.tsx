"use client";
import { useStore } from "@/state/useStore";
import { GoalNode } from "@/domain/types";
import { useMemo } from "react";

/**
 * Renders a hierarchical goal tree starting from a given direction id (northStar).
 * Clicking a node will expand/collapse its children.
 */
interface GoalTreeProps {
  directionId: string;
}

export default function GoalTree({ directionId }: GoalTreeProps) {
  const { goals } = useStore();

  /** Build a map of parentId -> children */
  const tree = useMemo(() => {
    const nodes = goals.filter((g) => g.id === directionId || g.parentId === directionId || g.parentId);
    const map: Record<string, GoalNode[]> = {};
    nodes.forEach((g) => {
      const parent = g.parentId || "__root__";
      map[parent] = map[parent] || [];
      map[parent].push(g);
    });
    return map;
  }, [goals, directionId]);

  const renderNodes = (parentId: string, level = 0) => {
    const children = tree[parentId] || [];
    return (
      <ul className={`pl-${level === 0 ? "0" : "4"} list-none`}>
        {children.map((child) => (
          <li key={child.id} className="mb-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{child.title}</span>
            </div>
            {tree[child.id] && renderNodes(child.id, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mt-3" data-component="GoalTree">
      <h3 className="font-semibold mb-2">Goal Tree</h3>
      <div className="max-h-60 overflow-y-auto border rounded-xl p-2 bg-surface-light dark:bg-surface-dark">
        {renderNodes(".__root__")}
      </div>
    </div>
  );
}
