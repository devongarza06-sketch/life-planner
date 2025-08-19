"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useStore } from "@/state/useStore";
import type { GoalNode } from "@/domain/types";
import RubricEditor from "./RubricEditor";

const splitLines = (s: string) =>
  s.split("\n").map((x) => x.trim()).filter(Boolean);

export default function GoalEditModal({
  open,
  onClose,
  nodeId,
  isRoot,
}: {
  open: boolean;
  onClose: () => void;
  nodeId: string;
  isRoot: boolean;
}) {
  const { goals, updateGoal, upsertBoardForGoal, removeGoalCascade } = useStore();
  const current = goals.find((g) => g.id === nodeId);

  const [confirmDel, setConfirmDel] = useState(false);

  const [draft, setDraft] = useState<Partial<GoalNode> & {
    weeklyText?: string;
    dailyText?: string;
    oc?: { O?: string; C?: string; V?: string; E?: string; D?: string; A?: string; R?: string };
    op?: { O?: string; P?: string; I?: string; S?: string; M?: string; I2?: string; T?: string };
  }>({});

  useEffect(() => {
    if (!open || !current) return;
    setDraft({
      title: current.title ?? "",
      smartier: current.smartier ?? "",
      horizon: current.horizon ?? "other",
      rubric: current.rubric,
      rubricInputs: current.rubricInputs,
      lead: current.lead ?? "",
      lag: current.lag ?? "",
      weeklyText: (current.weekly || []).join("\n"),
      dailyText: (current.daily || []).join("\n"),
      ifThenYet: current.ifThenYet ?? "",
      rationale: current.rationale ?? "",
      oc: {
        O: current.ocvedar?.O || "", C: current.ocvedar?.C || "",
        V: current.ocvedar?.V || "", E: current.ocvedar?.E || "",
        D: current.ocvedar?.D || "", A: current.ocvedar?.A || "",
        R: current.ocvedar?.R || "",
      },
      op: {
        O: current.opismit?.O || "", P: current.opismit?.P || "",
        I: current.opismit?.I || "", S: current.opismit?.S || "",
        M: current.opismit?.M || "", I2: current.opismit?.I2 || "",
        T: current.opismit?.T || "",
      },
    });
  }, [open, current]);

  const onSave = () => {
    if (!current) return;
    const patch: Partial<GoalNode> = {
      title: draft.title,
      smartier: draft.smartier,
      horizon: draft.horizon ?? "other",
      rubric: draft.rubric,
      rubricInputs: draft.rubricInputs,
    };

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
      patch.lead = undefined;
      patch.lag = undefined;
      patch.weekly = undefined;
      patch.daily = undefined;
      patch.ifThenYet = undefined;
      patch.rationale = undefined;
      patch.ocvedar = undefined;
      patch.opismit = undefined;
    }

    updateGoal(nodeId, patch);
    upsertBoardForGoal(nodeId);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Edit Goal — ${current?.title ?? ""}`}
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
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </>
        }
      >
        {!current ? null : (
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

            <div>
              <div className="text-xs text-slate-600 mb-1">SMARTIER</div>
              <textarea
                value={draft.smartier ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, smartier: e.target.value }))}
                className="w-full min-h-[80px] rounded border p-2 text-sm text-slate-900"
                placeholder="Specific, Measurable, …"
              />
            </div>

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
                      placeholder="e.g., desired outcome"
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
                      placeholder="Why this matters now."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded border p-2">
                    <div className="text-xs font-medium mb-2">O‑C‑V‑E‑D‑A‑R</div>
                    {(["O","C","V","E","D","A","R"] as const).map((k) => (
                      <div key={k} className="mb-2">
                        <label className="text-xs mr-2 w-4 inline-block font-semibold">{k}:</label>
                        <input
                          className="w-[85%] rounded border p-1 text-sm"
                          value={(draft as any).oc?.[k] ?? ""}
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
                          value={(draft as any).op?.[k] ?? ""}
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

            <RubricEditor
              nodeId={nodeId}
              draft={draft}
              setDraft={setDraft as any}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDel}
        title="Delete goal?"
        message={`Are you sure you want to delete “${current?.title ?? ""}” and all of its sub‑goals?`}
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => {
          removeGoalCascade(nodeId);
          setConfirmDel(false);
          onClose();
        }}
        confirmText="Delete"
      />
    </>
  );
}
