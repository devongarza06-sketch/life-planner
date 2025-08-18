"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/state/useStore";
import { GoalNode } from "@/domain/types";
import { MoreHorizontal } from "lucide-react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

type RenderNode = {
  id: string;
  title: string;
  directionId: string;
  parentId?: string | null;
  type?: string;
  smartier?: string;
  lead?: string;
  lag?: string;
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
    smartier: (g as any).smartier ?? undefined,
    lead: (g as any).lead ?? undefined,
    lag: (g as any).lag ?? undefined,
    children: (byParent[(g as any).id] || []).map(toNode),
  });

  return toNode(roots[0]);
}

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

type RowGeom = {
  barLeft: number;
  barWidth: number;
  childXs: number[];
  parentX: number;
};

export default function GoalTree({ directionId }: { directionId: string }) {
  const { goals } = useStore();
  const tree = useMemo(() => buildTree(goals, directionId), [goals, directionId]);
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const toggleDetails = (id: string) => setOpenDetails((o) => ({ ...o, [id]: !o[id] }));

  if (!tree) {
    return (
      <div className="text-sm text-slate-400 text-center">No goals found for this direction yet.</div>
    );
  }

  return (
    <div className="mt-3">
      <h3 className="font-semibold mb-2 text-center">Connected Tree (Family-style)</h3>
      <div className="relative mx-auto max-w-5xl max-h-[420px] overflow-auto p-6 rounded-xl bg-slate-800/40">
        <TreeNode
          node={tree}
          depth={0}
          openDetails={openDetails}
          onToggleDetails={toggleDetails}
        />
      </div>
    </div>
  );
}

function TreeNode({
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
  const isOpen = !!openDetails[node.id];
  const hasChildren = node.children.length > 0 && depth < 6;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const childRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [geom, setGeom] = useState<RowGeom | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    smartier: "",
    lead: "",
    lag: "",
  });

  const { updateGoal, addChildGoal, addSiblingGoal, removeGoalCascade, goals } = useStore();

  useEffect(() => {
    if (!editOpen) return;
    const current = goals.find((g) => g.id === node.id);
    setDraft({
      title: current?.title ?? "",
      smartier: (current as any)?.smartier ?? "",
      lead: (current as any)?.lead ?? "",
      lag: (current as any)?.lag ?? "",
    });
  }, [editOpen, node.id, goals]);

  const schedule = useRafUpdate(() => {
    if (!wrapRef.current || !parentRef.current) return;
    const wrapRect = wrapRef.current.getBoundingClientRect();
    const pRect = parentRef.current.getBoundingClientRect();
    const parentX = pRect.left - wrapRect.left + pRect.width / 2;

    const xs: number[] = [];
    node.children.forEach((c) => {
      const el = childRefs.current[c.id];
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

  useLayoutEffect(schedule, [node.children.length, isOpen]);
  useEffect(() => {
    const onResize = () => schedule();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [schedule]);

  const isRoot = node.parentId == null;

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center">
      {/* Node pill */}
      <div ref={parentRef} className="relative">
        <div className="relative px-3 py-1 rounded-full bg-indigo-500 text-white text-sm shadow-sm select-none">
          {node.title}

          {/* Ellipsis menu button (inside pill) */}
          <button
            onClick={() => setMenuOpen((x) => !x)}
            aria-label="Open menu"
            className="absolute bottom-0 right-1 translate-y-1/2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white focus:outline-none"
          >
            <MoreHorizontal size={10} />
          </button>

          {/* Menu */}
          {menuOpen && (
            <div
              className="absolute z-10 right-0 top-[120%] w-44 rounded-md border border-slate-200 bg-white shadow-lg text-sm text-slate-800"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  setEditOpen(true);
                }}
              >
                Edit…
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  addChildGoal(node.id, "New sub‑goal");
                  setMenuOpen(false);
                }}
              >
                Add sub‑goal
              </button>
              {!isRoot && (
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={() => {
                    addSiblingGoal(node.id, "New peer goal");
                    setMenuOpen(false);
                  }}
                >
                  Add sibling
                </button>
              )}
              <button
                className="w-full text-left px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  onToggleDetails(node.id);
                  setMenuOpen(false);
                }}
              >
                {isOpen ? "Hide details" : "Show details"}
              </button>
            </div>
          )}
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
          </div>
        )}
      </div>

      {/* Children connectors */}
      {hasChildren && (
        <div className="relative w-full mt-8">
          {geom && (
            <>
              <div
                className="pointer-events-none absolute bg-slate-300"
                style={{ left: `${geom.parentX - 0.5}px`, top: "-24px", width: "1px", height: "24px" }}
              />
              <div
                className="pointer-events-none absolute bg-slate-300"
                style={{ left: `${geom.barLeft}px`, top: "0px", width: `${Math.max(1, geom.barWidth)}px`, height: "1px" }}
              />
              {geom.childXs.map((x, i) => (
                <div
                  key={`stub-${i}`}
                  className="pointer-events-none absolute bg-slate-300"
                  style={{ left: `${x - 0.5}px`, top: "0px", width: "1px", height: "24px" }}
                />
              ))}
            </>
          )}

          <div className="mt-6 w-full flex justify-center gap-8">
            {node.children.map((c) => (
              <div
                key={c.id}
                ref={(el) => {
                  childRefs.current[c.id] = el;
                }}
                className="relative flex flex-col items-center"
              >
                <TreeNode
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

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit Goal — ${node.title}`}
        actions={
          <>
            {!isRoot && (
              <button
                onClick={() => setConfirmDel(true)}
                className="mr-auto px-3 py-1.5 rounded border border-red-600 text-red-700 hover:bg-red-50"
              >
                Delete…
              </button>
            )}
            <button
              onClick={() => setEditOpen(false)}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                updateGoal(node.id, {
                  title: draft.title,
                  smartier: draft.smartier,
                  lead: draft.lead,
                  lag: draft.lag,
                });
                setEditOpen(false);
              }}
              className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-3 text-slate-800">
          <div>
            <div className="text-xs text-slate-600 mb-1">Title</div>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="w-full rounded border p-2 text-sm text-slate-900"
              placeholder="Goal title"
            />
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">SMARTIER</div>
            <textarea
              value={draft.smartier}
              onChange={(e) => setDraft((d) => ({ ...d, smartier: e.target.value }))}
              className="w-full min-h-[80px] rounded border p-2 text-sm text-slate-900"
              placeholder="Specific, Measurable, …"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-600 mb-1">Lead metric</div>
              <input
                value={draft.lead}
                onChange={(e) => setDraft((d) => ({ ...d, lead: e.target.value }))}
                className="w-full rounded border p-2 text-sm text-slate-900"
                placeholder="e.g., sessions/week"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Lag metric</div>
              <input
                value={draft.lag}
                onChange={(e) => setDraft((d) => ({ ...d, lag: e.target.value }))}
                className="w-full rounded border p-2 text-sm text-slate-900"
                placeholder="e.g., performance outcome"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmDel}
        title="Delete goal?"
        message={`Are you sure you want to delete “${node.title}” and all of its sub‑goals?`}
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => {
          removeGoalCascade(node.id);
          setConfirmDel(false);
          setEditOpen(false);
        }}
        confirmText="Delete"
      />
    </div>
  );
}
