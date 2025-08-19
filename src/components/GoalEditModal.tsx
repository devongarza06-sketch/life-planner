"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useStore } from "@/state/useStore";
import type { GoalNode } from "@/domain/types";

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
  const [draft, setDraft] = useState<Partial<GoalNode>>({});

  useEffect(() => {
    if (!open || !current) return;
    setDraft({
      title: current.title ?? "",
      smartier: current.smartier ?? "",
      horizon: current.horizon ?? "other",
    });
  }, [open, current]);

  const onSave = () => {
    if (!current) return;
    // Only editing core meta here
    updateGoal(nodeId, {
      title: draft.title,
      smartier: draft.smartier,
      horizon: draft.horizon ?? "other",
    });
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
