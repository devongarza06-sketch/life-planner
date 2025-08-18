"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/state/useStore";
import { GoalNode } from "@/domain/types";
import { MoreHorizontal } from "lucide-react";

/**
 * Render-only node shape
 */
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
  const roots = byParent[`ROOT-${directionId}`] || [];
  if (!roots.length) return null;

  const toNode = (g: GoalNode): RenderNode => ({
    id: (g as any).id,
    title: (g as any).title ?? "Untitled",
    directionId: (g as any).directionId,
    parentId: (g as any).parentId ?? null,
    type: (g as any).type,
    smartier: (g as any).smartier ?? (g as any).smart ?? undefined,
    lead: (g as any).lead ?? undefined,
    lag: (g as any).lag ?? undefined,
    horizon: (g as any).horizon ?? undefined,
    children: (byParent[(g as any).id] || []).map(toNode),
  });

  return toNode(roots[0]);
}

/** Utility: throttle rAF measure/update */
function useRafUpdate(cb: () => void) {
  const raf = useRef<number | null>(null);
  const schedule = () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      cb();
    });
  };
  useEffect(() => () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
  }, []);
  return schedule;
}

/** Connector geometry for a row of children */
type RowGeom = {
  barLeft: number;
  barWidth: number;
  childXs: number[];
  parentX: number;
};

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
      <div className="relative mx-auto max-w-5xl max-h-[420px] overflow-auto p-6 rounded-xl bg-slate-800/40">
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
  const hasChildren = Array.isArray(node.children) && node.children.length > 0 && depth < 3;

  // Refs for geometry
  const wrapRef = useRef<HTMLDivElement | null>(null); // container of parent + children
  const parentRef = useRef<HTMLDivElement | null>(null);
  const childRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [geom, setGeom] = useState<RowGeom | null>(null);

  // Recompute connector geometry when layout changes
  const schedule = useRafUpdate(() => {
    if (!wrapRef.current || !parentRef.current) return;
    const wrapRect = wrapRef.current.getBoundingClientRect();
    const pRect = parentRef.current.getBoundingClientRect();
    const parentX = pRect.left - wrapRect.left + pRect.width / 2;

    const childKeys = node.children?.map((c) => c.id) || [];
    const xs: number[] = [];
    childKeys.forEach((id) => {
      const el = childRefs.current[id];
      if (el) {
        const r = el.getBoundingClientRect();
        xs.push(r.left - wrapRect.left + r.width / 2);
      }
    });

    if (xs.length) {
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      setGeom({
        barLeft: minX,
        barWidth: Math.max(0, maxX - minX),
        childXs: xs,
        parentX,
      });
    } else {
      setGeom(null);
    }
  });

  useLayoutEffect(schedule, [node.children?.length, isOpen]); // run after render
  useEffect(() => {
    const onResize = () => schedule();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [schedule]);

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center">
      {/* PARENT NODE */}
      <div ref={parentRef} className="relative">
        <div className="relative px-3 py-1 rounded-full bg-indigo-500 text-white text-sm shadow-sm select-none">
          {node.title}
          {/* Ellipsis INSIDE the pill, bottom-right, small */}
          <button
            onClick={() => toggle(node.id)}
            aria-label="Toggle details"
            className="absolute bottom-0 right-1 translate-y-1/2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white focus:outline-none"
          >
            <MoreHorizontal size={10} />
          </button>
        </div>

        {/* SMARTIER detail */}
        {isOpen && (
          <div className="mt-2 text-xs text-slate-200 space-y-1 text-center">
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

      {/* CHILDREN ROW + CONNECTORS */}
      {hasChildren && (
        <div className="relative w-full mt-8">
          {/* connectors layer */}
          {geom && (
            <>
              {/* vertical from parent to bar */}
              <div
                className="pointer-events-none absolute bg-slate-300"
                style={{
                  left: `${geom.parentX - 0.5}px`,
                  top: "-24px",
                  width: "1px",
                  height: "24px",
                }}
              />
              {/* horizontal bar spanning first..last child centers */}
              <div
                className="pointer-events-none absolute bg-slate-300"
                style={{
                  left: `${geom.barLeft}px`,
                  top: "0px",
                  width: `${Math.max(1, geom.barWidth)}px`,
                  height: "1px",
                }}
              />
              {/* stubs down to each child center */}
              {geom.childXs.map((x, i) => (
                <div
                  key={`stub-${i}`}
                  className="pointer-events-none absolute bg-slate-300"
                  style={{
                    left: `${x - 0.5}px`,
                    top: "0px",
                    width: "1px",
                    height: "24px",
                  }}
                />
              ))}
            </>
          )}

          {/* children nodes */}
          <div className="mt-6 w-full flex justify-center gap-8">
            {node.children.map((c) => (
              <div
                key={c.id}
                ref={(el) => {
                  childRefs.current[c.id] = el;
                }}
                className="relative flex flex-col items-center"
              >
                <TreeNode node={c} open={open} toggle={toggle} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
