"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useStore } from "@/state/useStore";
import type { GoalNode } from "@/domain/types";

const splitLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export default function Active13EditModal() {
  const {
    goals,
    updateGoal,
    openActive13ForGoalId,
    setOpenActive13ForGoalId,
  } = useStore();

  const goal = goals.find((g) => g.id === openActive13ForGoalId);

  const [draft, setDraft] = useState<Partial<GoalNode> & {
    weeklyText?: string;
    dailyText?: string;
    oc?: { O?: string; C?: string; V?: string; E?: string; D?: string; A?: string; R?: string };
    op?: { O?: string; P?: string; I?: string; S?: string; M?: string; I2?: string; T?: string };
  }>({});

  useEffect(() => {
    if (!goal) return;
    setDraft({
      lead: goal.lead ?? "",
      lag: goal.lag ?? "",
      weeklyText: (goal.weekly || []).join("\n"),
      dailyText: (goal.daily || []).join("\n"),
      ifThenYet: goal.ifThenYet ?? "",
      rationale: goal.rationale ?? "",
      oc: {
        O: goal.ocvedar?.O || "", C: goal.ocvedar?.C || "",
        V: goal.ocvedar?.V || "", E: goal.ocvedar?.E || "",
        D: goal.ocvedar?.D || "", A: goal.ocvedar?.A || "",
        R: goal.ocvedar?.R || "",
      },
      op: {
        O: goal.opismit?.O || "", P: goal.opismit?.P || "",
        I: goal.opismit?.I || "", S: goal.opismit?.S || "",
        M: goal.opismit?.M || "", I2: goal.opismit?.I2 || "",
        T: goal.opismit?.T || "",
      },
    });
  }, [goal]);

  const onClose = () => setOpenActive13ForGoalId(null);
  const onSave = () => {
    if (!goal) return;
    const patch: Partial<GoalNode> = {
      lead: (draft.lead || "").trim() || undefined,
      lag: (draft.lag || "").trim() || undefined,
      weekly: splitLines(draft.weeklyText || ""),
      daily: splitLines(draft.dailyText || ""),
      ifThenYet: (draft.ifThenYet || "").trim() || undefined,
      rationale: (draft.rationale || "").trim() || undefined,
      ocvedar: { ...(draft.oc || {}) },
      opismit: { ...(draft.op || {}) },
    };
    updateGoal(goal.id, patch);
    onClose();
  };

  return (
    <Modal
      open={!!goal}
      onClose={onClose}
      title={goal ? `1–3 Details: ${goal.title}` : "1–3 Details"}
      actions={
        <>
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
      {!goal ? null : (
        <div className="space-y-3 text-slate-800">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-600 mb-1">Lead metric</div>
              <input
                value={draft.lead ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, lead: e.target.value }))}
                className="w-full rounded border p-2 text-sm"
                placeholder="e.g., sessions/week"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Lag metric</div>
              <input
                value={draft.lag ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, lag: e.target.value }))}
                className="w-full rounded border p-2 text-sm"
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
                className="w-full h-24 rounded border p-2 text-sm"
                placeholder={"Watch 3 lectures\nOutline ch.3"}
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Daily tasks & habits (one per line)</div>
              <textarea
                value={draft.dailyText ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, dailyText: e.target.value }))}
                className="w-full h-24 rounded border p-2 text-sm"
                placeholder={"45-min deep block\n15-min review"}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-600 mb-1">If–Then / Yet Map</div>
              <textarea
                value={(draft as any).ifThenYet ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, ifThenYet: e.target.value }))}
                className="w-full h-20 rounded border p-2 text-sm"
                placeholder="If shift runs late → do 20-min night review."
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Rationale</div>
              <textarea
                value={draft.rationale ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, rationale: e.target.value }))}
                className="w-full h-20 rounded border p-2 text-sm"
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
    </Modal>
  );
}
