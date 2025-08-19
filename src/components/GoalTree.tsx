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

const splitLines = (s: string) =>
  s.split("\n").map((x) => x.trim()).filter(Boolean);

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
  const childRefs = useRef<Record<string, HTMLDivElement | null>>({ });
  const [geom, setGeom] = useState<RowGeom | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const { updateGoal, addChildGoal, addSiblingGoal, removeGoalCascade, goals, upsertBoardForGoal } = useStore();

  // local draft
  const current = goals.find((g) => g.id === node.id);
  const [draft, setDraft] = useState<Partial<GoalNode> & {
    title?: string;
    smartier?: string;
    // core
    horizon?: "12+" | "1-3" | "other";
    rubric?: "IART+G" | "JRN" | "UIE";
    rubricInputs?: any;

    // 1–3 only UI state
    lead?: string;
    lag?: string;
    weeklyText?: string;
    dailyText?: string;
    ifThenYet?: string;
    rationale?: string;
    oc?: { O?: string; C?: string; V?: string; E?: string; D?: string; A?: string; R?: string };
    op?: { O?: string; P?: string; I?: string; S?: string; M?: string; I2?: string; T?: string };
  }>({});

  useEffect(() => {
    if (!editOpen) return;
    const g = goals.find((x) => x.id === node.id);

    setDraft({
      title: g?.title ?? "",
      smartier: g?.smartier ?? "",
      horizon: g?.horizon ?? "other",
      rubric: g?.rubric,
      rubricInputs: g?.rubricInputs,

      // 1–3 fields
      lead: g?.lead ?? "",
      lag: g?.lag ?? "",
      weeklyText: (g?.weekly || []).join("\n"),
      dailyText: (g?.daily || []).join("\n"),
      ifThenYet: g?.ifThenYet ?? "",
      rationale: g?.rationale ?? "",
      oc: {
        O: g?.ocvedar?.O || "",
        C: g?.ocvedar?.C || "",
        V: g?.ocvedar?.V || "",
        E: g?.ocvedar?.E || "",
        D: g?.ocvedar?.D || "",
        A: g?.ocvedar?.A || "",
        R: g?.ocvedar?.R || "",
      },
      op: {
        O: g?.opismit?.O || "",
        P: g?.opismit?.P || "",
        I: g?.opismit?.I || "",
        S: g?.opismit?.S || "",
        M: g?.opismit?.M || "",
        I2: g?.opismit?.I2 || "",
        T: g?.opismit?.T || "",
      },
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

  const isRoot = (current?.parentId ?? null) == null;

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center">
      {/* Node pill */}
      <div ref={parentRef} className="relative">
        <div className="relative px-3 py-1 rounded-full bg-indigo-500 text-white text-sm shadow-sm select-none">
          {current?.title ?? node.title}

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
              className="absolute z-10 right-0 top-[120%] w-48 rounded-md border border-slate-200 bg-white shadow-lg text-sm text-slate-800"
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
                {openDetails[node.id] ? "Hide details" : "Show details"}
              </button>
            </div>
          )}
        </div>

        {/* SMARTIER detail */}
        {openDetails[node.id] && (
          <div className="mt-2 text-xs text-slate-200 space-y-1 text-center">
            {current?.smartier && (
              <div>
                <span className="font-semibold">SMARTIER:</span> {current.smartier}
              </div>
            )}
            {(current?.lead || current?.lag) && (
              <div>
                Lead: {current?.lead ?? "—"} • Lag: {current?.lag ?? "—"}
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
        title={`Edit Goal — ${current?.title ?? node.title}`}
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
                // build patch
                const patch: Partial<GoalNode> = {
                  title: draft.title,
                  smartier: draft.smartier,
                  horizon: draft.horizon ?? "other",
                  rubric: draft.rubric,
                  rubricInputs: draft.rubricInputs
                };

                // Only persist extra fields when 1–3 months is selected
                if (draft.horizon === "1-3") {
                  patch.lead = (draft.lead || "").trim() || undefined;
                  patch.lag = (draft.lag || "").trim() || undefined;
                  patch.weekly = splitLines(draft.weeklyText || "");
                  patch.daily = splitLines(draft.dailyText || "");
                  patch.ifThenYet = (draft.ifThenYet || "").trim() || undefined;
                  patch.rationale = (draft.rationale || "").trim() || undefined;
                  patch.ocvedar = { ...(draft.oc || {}) };
                  patch.opismit = { ...(draft.op || {}) };
                } else {
                  // Clear 1–3‑only fields when switching away
                  patch.lead = undefined;
                  patch.lag = undefined;
                  patch.weekly = undefined;
                  patch.daily = undefined;
                  patch.ifThenYet = undefined;
                  patch.rationale = undefined;
                  patch.ocvedar = undefined;
                  patch.opismit = undefined;
                }

                updateGoal(node.id, patch);
                // ensure AID board existence/placement (also rebalances)
                upsertBoardForGoal(node.id);
                setEditOpen(false);
              }}
              className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4 text-slate-800">
          <div>
            <div className="text-xs text-slate-600 mb-1">Title</div>
            <input
              value={draft.title ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="w-full rounded border p-2 text-sm text-slate-900"
              placeholder="Goal title"
            />
          </div>

          {/* Timeline */}
          <div>
            <div className="text-xs text-slate-600 mb-1">Timeline</div>
            <select
              value={draft.horizon ?? "other"}
              onChange={(e) => setDraft((d) => ({ ...d, horizon: e.target.value as any }))}
              className="w-full rounded border p-2 text-sm text-slate-900"
            >
              <option value="other">Neither / in-between</option>
              <option value="1-3">1–3 months</option>
              <option value="12+">12+ months</option>
            </select>
            <div className="text-xs text-slate-500 mt-1">
              Choosing 12+ or 1–3 will place this goal in the corresponding AID board.
            </div>
          </div>

          {/* SMARTIER */}
          <div>
            <div className="text-xs text-slate-600 mb-1">SMARTIER</div>
            <textarea
              value={draft.smartier ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, smartier: e.target.value }))}
              className="w-full min-h-[80px] rounded border p-2 text-sm text-slate-900"
              placeholder="Specific, Measurable, …"
            />
          </div>

          {/* 1–3 month ONLY fields */}
          {draft.horizon === "1-3" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Lead metric</div>
                  <input
                    value={draft.lead ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, lead: e.target.value }))}
                    className="w-full rounded border p-2 text-sm text-slate-900"
                    placeholder="e.g., sessions/week"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Lag metric</div>
                  <input
                    value={draft.lag ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, lag: e.target.value }))}
                    className="w-full rounded border p-2 text-sm text-slate-900"
                    placeholder="e.g., reviewer pass / outcome"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Weekly milestones (one per line)</div>
                  <textarea
                    value={draft.weeklyText ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, weeklyText: e.target.value }))}
                    className="w-full h-24 rounded border p-2 text-sm text-slate-900"
                    placeholder={"Watch 3 lectures\nOutline ch.3"}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Daily tasks & habits (one per line)</div>
                  <textarea
                    value={draft.dailyText ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, dailyText: e.target.value }))}
                    className="w-full h-24 rounded border p-2 text-sm text-slate-900"
                    placeholder={"45‑min deep block\n15‑min review"}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600 mb-1">If–Then / Yet Map</div>
                  <textarea
                    value={draft.ifThenYet ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, ifThenYet: e.target.value }))}
                    className="w-full h-20 rounded border p-2 text-sm text-slate-900"
                    placeholder="If shift runs late → do 20‑min night review."
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Rationale</div>
                  <textarea
                    value={draft.rationale ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, rationale: e.target.value }))}
                    className="w-full h-20 rounded border p-2 text-sm text-slate-900"
                    placeholder="Build exam readiness and foundational mastery."
                  />
                </div>
              </div>

              {/* Frameworks */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded border p-2">
                  <div className="text-xs font-medium mb-2">O‑C‑V‑E‑D‑A‑R</div>
                  {(["O","C","V","E","D","A","R"] as const).map((k) => (
                    <div key={k} className="mb-2">
                      <label className="text-xs mr-2 w-4 inline-block font-semibold">{k}:</label>
                      <input
                        className="w-[85%] rounded border p-1 text-sm"
                        value={(draft.oc?.[k] ?? "") as string}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, oc: { ...(d.oc || {}), [k]: e.target.value } }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded border p-2">
                  <div className="text-xs font-medium mb-2">O‑P‑I‑S‑M‑I‑T</div>
                  {(["O","P","I","S","M","I2","T"] as const).map((k) => (
                    <div key={k} className="mb-2">
                      <label className="text-xs mr-2 w-6 inline-block font-semibold">{k}:</label>
                      <input
                        className="w-[83%] rounded border p-1 text-sm"
                        value={(draft.op?.[k] ?? "") as string}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, op: { ...(d.op || {}), [k]: e.target.value } }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rubric inputs editor (unchanged from your version) */}
          <RubricEditor
            nodeId={node.id}
            draft={draft}
            setDraft={setDraft}
          />
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmDel}
        title="Delete goal?"
        message={`Are you sure you want to delete “${current?.title ?? node.title}” and all of its sub‑goals?`}
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

function RubricEditor({
  nodeId,
  draft,
  setDraft,
}: {
  nodeId: string;
  draft: any;
  setDraft: (u: any) => void;
}) {
  const { goals } = useStore();
  const g = goals.find((x) => x.id === nodeId);
  const tab = g?.tabId ?? "passion";

  if (tab === "passion") {
    const inputs = draft.rubricInputs ?? { rubric: "IART+G" };
    return (
      <div className="rounded border p-2">
        <div className="text-xs font-medium mb-2">Rubric: IART+G</div>
        <div className="grid grid-cols-4 gap-2">
          {["I","A","R","T","G"].map((k) => (
            <input
              key={k}
              type="number"
              min={1}
              max={5}
              placeholder={k}
              value={inputs[k] ?? ""}
              onChange={(e) => setDraft((d: any) => ({
                ...d, rubric: "IART+G",
                rubricInputs: { ...(d.rubricInputs ?? { rubric: "IART+G" }), [k]: +e.target.value, rubric: "IART+G" }
              }))}
              className="rounded border p-2 text-sm"
            />
          ))}
        </div>
        <div className="text-xs text-slate-500 mt-1">Enter 1–5. Score averages I, A, R, T (G is a tiebreaker).</div>
      </div>
    );
  }

  if (tab === "play") {
    const inputs = draft.rubricInputs ?? { rubric: "JRN" };
    return (
      <div className="rounded border p-2">
        <div className="text-xs font-medium mb-2">Rubric: JRN</div>
        <div className="grid grid-cols-3 gap-2">
          {["J","R","N"].map((k) => (
            <input
              key={k}
              type="number"
              min={1}
              max={5}
              placeholder={k}
              value={inputs[k] ?? ""}
              onChange={(e) => setDraft((d: any) => ({
                ...d, rubric: "JRN",
                rubricInputs: { ...(d.rubricInputs ?? { rubric: "JRN" }), [k]: +e.target.value, rubric: "JRN" }
              }))}
              className="rounded border p-2 text-sm"
            />
          ))}
        </div>
        <div className="text-xs text-slate-500 mt-1">Enter 1–5. Score averages J, R, N.</div>
      </div>
    );
  }

  // person
  const inputs = draft.rubricInputs ?? { rubric: "UIE" };
  return (
    <div className="rounded border p-2">
      <div className="text-xs font-medium mb-2">Rubric: UIE</div>
      <div className="grid grid-cols-3 gap-2">
        {["U","I","E"].map((k) => (
          <input
            key={k}
            type="number"
            min={1}
            max={5}
            placeholder={k}
            value={inputs[k] ?? ""}
            onChange={(e) => setDraft((d: any) => ({
              ...d, rubric: "UIE",
              rubricInputs: { ...(d.rubricInputs ?? { rubric: "UIE" }), [k]: +e.target.value, rubric: "UIE" }
            }))}
            className="rounded border p-2 text-sm"
          />
        ))}
      </div>
      <div className="text-xs text-slate-500 mt-1">Enter 1–5. Score averages U, I, E.</div>
    </div>
  );
}
