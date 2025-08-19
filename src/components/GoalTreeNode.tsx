"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useStore } from "@/state/useStore";
import GoalEditModal from "./GoalEditModal";
import useRafUpdate from "./useRafUpdate";

type RenderNode = {
  id: string;
  title: string;
  directionId: string;
  parentId: string | null;
  children: RenderNode[];
};

type RowGeom = {
  barLeft: number; barWidth: number; childXs: number[]; parentX: number;
};

export default function GoalTreeNode({
  node,
  depth,
  openDetails,
  onToggleDetails,
}: {
  node: RenderNode;
  depth: number;
  openDetails: Record<string, boolean>;
  onToggleDetails: (id: string) => void;
}) {
  const { goals, addChildGoal, addSiblingGoal } = useStore();
  const current = goals.find((g) => g.id === node.id);

  const hasChildren = node.children.length > 0 && depth < 6;
  const isOpen = !!openDetails[node.id];
  const isRoot = (current?.parentId ?? null) == null;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const childRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [geom, setGeom] = useState<RowGeom | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const schedule = useRafUpdate(() => {
    if (!wrapRef.current || !parentRef.current) return;
    const wrapRect = wrapRef.current.getBoundingClientRect();
    const pRect = parentRef.current.getBoundingClientRect();
    const parentX = pRect.left - wrapRect.left + pRect.width / 2;

    const xs: number[] = [];
    node.children.forEach((c) => {
      const el = childRefs.current[c.id];
      if (!el) return;
      const r = el.getBoundingClientRect();
      xs.push(r.left - wrapRect.left + r.width / 2);
    });

    if (xs.length) {
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      setGeom({ barLeft: minX, barWidth: Math.max(0, maxX - minX), childXs: xs, parentX });
    } else {
      setGeom(null);
    }
  });

  useLayoutEffect(schedule, [node.children.length, isOpen]);
  useEffect(() => {
    const onResize = () => schedule();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [schedule]);

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center">
      {/* Node pill */}
      <div ref={parentRef} className="relative">
        <div className="relative px-3 py-1 rounded-full bg-indigo-500 text-white text-sm shadow-sm select-none">
          {current?.title ?? node.title}

          <button
            onClick={() => setMenuOpen((x) => !x)}
            aria-label="Open menu"
            className="absolute bottom-0 right-1 translate-y-1/2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white focus:outline-none"
          >
            <MoreHorizontal size={10} />
          </button>

          {menuOpen && (
            <div
              className="absolute z-10 right-0 top-[120%] w-48 rounded-md border border-slate-200 bg-white shadow-lg text-sm text-slate-800"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => { setMenuOpen(false); setEditOpen(true); }}
              >
                Edit…
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => { addChildGoal(node.id, "New sub‑goal"); setMenuOpen(false); }}
              >
                Add sub‑goal
              </button>
              {!isRoot && (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={() => { addSiblingGoal(node.id, "New peer goal"); setMenuOpen(false); }}
                >
                  Add sibling
                </button>
              )}
              <button
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => { onToggleDetails(node.id); setMenuOpen(false); }}
              >
                {openDetails[node.id] ? "Hide details" : "Show details"}
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="mt-2 text-xs text-slate-200 space-y-1 text-center">
            {current?.smartier && (
              <div><span className="font-semibold">SMARTIER:</span> {current.smartier}</div>
            )}
            {(current?.lead || current?.lag) && (
              <div>Lead: {current?.lead ?? "—"} • Lag: {current?.lag ?? "—"}</div>
            )}
          </div>
        )}
      </div>

      {/* Children connectors */}
      {hasChildren && (
        <div className="relative w-full mt-8">
          {geom && (
            <>
              <div className="pointer-events-none absolute bg-slate-300"
                   style={{ left: `${geom.parentX - 0.5}px`, top: "-24px", width: "1px", height: "24px" }}/>
              <div className="pointer-events-none absolute bg-slate-300"
                   style={{ left: `${geom.barLeft}px`, top: "0px", width: `${Math.max(1, geom.barWidth)}px`, height: "1px" }}/>
              {geom.childXs.map((x, i) => (
                <div key={i} className="pointer-events-none absolute bg-slate-300"
                     style={{ left: `${x - 0.5}px`, top: "0px", width: "1px", height: "24px" }}/>
              ))}
            </>
          )}

          <div className="mt-6 w-full flex justify-center gap-8">
            {node.children.map((c) => (
              <div key={c.id}
                   ref={(el) => { childRefs.current[c.id] = el; }}
                   className="relative flex flex-col items-center">
                <GoalTreeNode
                  node={c}
                  depth={depth + 1}
                  openDetails={openDetails}
                  onToggleDetails={onToggleDetails}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <GoalEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        nodeId={node.id}
        isRoot={isRoot}
      />
    </div>
  );
}
