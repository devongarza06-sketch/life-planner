"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useStore } from "@/state/useStore";
import type {
  GoalNode,
  ActionTemplate,
  Milestone,
  OPISMIT,
  OCvEDaR,
} from "@/domain/types";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const newAction = (): ActionTemplate => ({
  key: Math.random().toString(36).slice(2, 9),
  label: "New action",
  durationMin: 30,
  mode: "specific",
  day: 1,
  start: null,
  ifThenYet: "",
  rationale: "",
});

const newMilestone = (): Milestone => ({
  key: Math.random().toString(36).slice(2, 9),
  label: "New milestone",
  target: "",
});

export default function Active13EditModal() {
  const {
    goals,
    updateGoal,
    openActive13ForGoalId,
    setOpenActive13ForGoalId,
    generatePlannerActionsForWeek, // if not in store, you can remove the call below
  } = useStore();

  const goal = goals.find((g) => g.id === openActive13ForGoalId);

  const [actions, setActions] = useState<ActionTemplate[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [ocvedar, setOCVEDAR] = useState<OCvEDaR>({});
  const [opismit, setOPISMIT] = useState<OPISMIT>({});

  useEffect(() => {
    if (!goal) return;
    setActions(goal.actionsTemplate || []);
    setMilestones(goal.milestones || []);
    setOCVEDAR(goal.ocvedar || {});
    setOPISMIT(goal.opismit || {});
  }, [goal]);

  const onClose = () => setOpenActive13ForGoalId(null);

  const onSave = () => {
    if (!goal) return;

    const sanitize = (arr: ActionTemplate[]) =>
      arr.map((a) => {
        const x = { ...a };
        x.durationMin = Math.max(1, Math.min(59, Math.round(x.durationMin || 30)));
        if (x.mode === "specific") {
          x.frequencyPerWeek = undefined;
          x.preferredDays = undefined;
          x.preferredStart = undefined;
        } else {
          x.day = undefined;
          if (!Array.isArray(x.preferredDays)) x.preferredDays = [];
        }
        return x;
      });

    updateGoal(goal.id, {
      actionsTemplate: sanitize(actions),
      milestones,
      ocvedar,
      opismit,
    });

    // Optional: regenerate this week's planner instances if your store exposes it.
    try {
      // @ts-ignore optional in some repos
      generatePlannerActionsForWeek?.();
    } catch {}

    onClose();
  };

  if (!goal) return null;

  return (
    <Modal
      open={!!goal}
      onClose={onClose}
      title={`1–3 Details: ${goal.title}`}
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-slate-500 text-slate-100 bg-slate-700 hover:bg-slate-600"
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
      <div className="space-y-6 text-slate-100">
        {/* Actions */}
        <section className="rounded border border-slate-700 bg-slate-900/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Actions</div>
            <button
              onClick={() => setActions((a) => [...a, newAction()])}
              className="text-sm rounded px-2 py-1 border border-slate-600 hover:bg-slate-800"
            >
              + Add action
            </button>
          </div>

          {actions.length === 0 ? (
            <div className="text-sm text-slate-400">No actions yet.</div>
          ) : (
            <div className="space-y-3">
              {actions.map((a, idx) => (
                <ActionRow
                  key={a.key}
                  value={a}
                  idx={idx + 1}
                  onChange={(v) =>
                    setActions((list) => list.map((x) => (x.key === a.key ? v : x)))
                  }
                  onRemove={() =>
                    setActions((list) => list.filter((x) => x.key !== a.key))
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Milestones */}
        <section className="rounded border border-slate-700 bg-slate-900/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Milestones (metrics)</div>
            <button
              onClick={() => setMilestones((m) => [...m, newMilestone()])}
              className="text-sm rounded px-2 py-1 border border-slate-600 hover:bg-slate-800"
            >
              + Add milestone
            </button>
          </div>

          {milestones.length === 0 ? (
            <div className="text-sm text-slate-400">No milestones yet.</div>
          ) : (
            <div className="space-y-2">
              {milestones.map((m) => (
                <div key={m.key} className="grid grid-cols-3 gap-2 items-center">
                  <input
                    className="rounded border border-slate-600 bg-slate-800 p-2 text-sm"
                    placeholder="Label"
                    value={m.label}
                    onChange={(e) =>
                      setMilestones((list) =>
                        list.map((x) =>
                          x.key === m.key ? { ...x, label: e.target.value } : x
                        )
                      )
                    }
                  />
                  <input
                    className="rounded border border-slate-600 bg-slate-800 p-2 text-sm"
                    placeholder="Target (e.g., 20k words or 4 reps)"
                    value={m.target || ""}
                    onChange={(e) =>
                      setMilestones((list) =>
                        list.map((x) =>
                          x.key === m.key ? { ...x, target: e.target.value } : x
                        )
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    <input
                      className="rounded border border-slate-600 bg-slate-800 p-2 text-sm w-full"
                      placeholder="Due week (YYYY-WW or W+3)"
                      value={m.dueWeek || ""}
                      onChange={(e) =>
                        setMilestones((list) =>
                          list.map((x) =>
                            x.key === m.key ? { ...x, dueWeek: e.target.value } : x
                          )
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        setMilestones((list) => list.filter((x) => x.key !== m.key))
                      }
                      className="text-sm rounded px-2 py-1 border border-red-500 text-red-300 hover:bg-red-900/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Framework editors */}
        <section className="rounded border border-slate-700 bg-slate-900/40 p-3">
          <div className="font-semibold mb-2">Problem‑solving & Experimentation</div>
          <div className="grid md:grid-cols-2 gap-3">
            <FrameworkGrid
              title="O‑C‑V‑E‑D‑A‑R"
              fields={[
                ["O", "Objective"],
                ["C", "Constraints"],
                ["V", "Variables"],
                ["E", "Experimental design"],
                ["D", "Data & math plan"],
                ["A", "Analysis"],
                ["R", "Reflect & iterate"],
              ]}
              value={ocvedar}
              onChange={setOCVEDAR}
            />
            <FrameworkGrid
              title="O‑P‑I‑S‑M‑I‑T"
              fields={[
                ["O", "Observe (calibration)"],
                ["P", "Pattern & predict"],
                ["I", "Intent, incentives & constraints"],
                ["S", "System map"],
                ["M", "Meta‑rotation"],
                ["I2", "Ideate"],
                ["T", "Test & tighten"],
              ]}
              value={opismit}
              onChange={setOPISMIT}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}

function ActionRow({
  value,
  onChange,
  onRemove,
  idx,
}: {
  value: ActionTemplate;
  onChange: (v: ActionTemplate) => void;
  onRemove: () => void;
  idx: number;
}) {
  return (
    <div className="rounded border border-slate-600 bg-slate-800 p-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">Action {idx}</div>
        <button
          onClick={onRemove}
          className="text-sm rounded px-2 py-1 border border-red-500 text-red-300 hover:bg-red-900/20"
        >
          Remove
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-2 mt-2">
        <input
          className="rounded border border-slate-600 bg-slate-900 p-2 text-sm"
          placeholder="Label"
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Duration</span>
          <input
            className="rounded border border-slate-600 bg-slate-900 p-2 text-sm w-24"
            type="number"
            min={1}
            max={59}
            value={value.durationMin}
            onChange={(e) => onChange({ ...value, durationMin: +e.target.value })}
          />
          <span className="text-xs text-slate-400">min</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Mode</span>
          <select
            className="rounded border border-slate-600 bg-slate-900 p-2 text-sm"
            value={value.mode}
            onChange={(e) => onChange({ ...value, mode: e.target.value as any })}
          >
            <option value="specific">Specific</option>
            <option value="frequency">Frequency</option>
          </select>
        </div>
      </div>

      {value.mode === "specific" ? (
        <div className="grid md:grid-cols-3 gap-2 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Day</span>
            <select
              className="rounded border border-slate-600 bg-slate-900 p-2 text-sm"
              value={value.day ?? 1}
              onChange={(e) => onChange({ ...value, day: +e.target.value as any })}
            >
              {DAY.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Time</span>
            <input
              className="rounded border border-slate-600 bg-slate-900 p-2 text-sm w-28"
              type="time"
              value={value.start || ""}
              onChange={(e) => onChange({ ...value, start: e.target.value || null })}
            />
            <span className="text-xs text-slate-500">(optional)</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-2 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">/week</span>
            <input
              className="rounded border border-slate-600 bg-slate-900 p-2 text-sm w-20"
              type="number"
              min={1}
              max={7}
              value={value.frequencyPerWeek || 3}
              onChange={(e) => onChange({ ...value, frequencyPerWeek: +e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Days</span>
            <MultiDay
              value={value.preferredDays || []}
              onChange={(arr) => onChange({ ...value, preferredDays: arr })}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Time</span>
            <input
              className="rounded border border-slate-600 bg-slate-900 p-2 text-sm w-28"
              type="time"
              value={value.preferredStart || ""}
              onChange={(e) => onChange({ ...value, preferredStart: e.target.value || null })}
            />
            <span className="text-xs text-slate-500">(optional)</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-2 mt-2">
        <div>
          <div className="text-xs text-slate-300 mb-1">If‑Then / Yet</div>
          <textarea
            className="w-full h-20 rounded border border-slate-600 bg-slate-900 p-2 text-sm"
            value={value.ifThenYet || ""}
            onChange={(e) => onChange({ ...value, ifThenYet: e.target.value })}
            placeholder="If shift runs late -> shorter night review; Yet I keep momentum."
          />
        </div>
        <div>
          <div className="text-xs text-slate-300 mb-1">Rationale</div>
          <textarea
            className="w-full h-20 rounded border border-slate-600 bg-slate-900 p-2 text-sm"
            value={value.rationale || ""}
            onChange={(e) => onChange({ ...value, rationale: e.target.value })}
            placeholder="Why this action matters now."
          />
        </div>
      </div>
    </div>
  );
}

function MultiDay({
  value,
  onChange,
}: {
  value: number[];
  onChange: (v: number[]) => void;
}) {
  const toggle = (i: number) =>
    onChange(value.includes(i) ? value.filter((d) => d !== i) : [...value, i].sort());
  return (
    <div className="flex flex-wrap gap-1">
      {DAY.map((d, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          className={`px-2 py-1 rounded border text-sm ${
            value.includes(i)
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-slate-900 text-slate-200 border-slate-600 hover:bg-slate-800"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

function FrameworkGrid({
  title,
  fields,
  value,
  onChange,
}: {
  title: string;
  fields: Array<[keyof OCvEDaR | keyof OPISMIT, string]>;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div className="rounded border border-slate-600 p-2">
      <div className="text-xs font-semibold text-slate-300 mb-2">{title}</div>
      <div className="grid grid-cols-1 gap-2">
        {fields.map(([k, label]) => (
          <div key={String(k)}>
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <textarea
              className="w-full h-16 rounded border border-slate-600 bg-slate-900 p-2 text-sm"
              value={value?.[k] || ""}
              onChange={(e) => onChange({ ...value, [k]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
