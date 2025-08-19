"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useStore } from "@/state/useStore";
import RubricEditor from "./RubricEditor";

export default function RubricEditModal() {
  const {
    goals,
    updateGoal,
    upsertBoardForGoal,
    openRubricForGoalId,
    setOpenRubricForGoalId,
  } = useStore();

  const goal = goals.find((g) => g.id === openRubricForGoalId);

  const [draft, setDraft] = useState<any>({});
  useEffect(() => {
    if (!goal) return;
    setDraft({
      rubric: goal.rubric,
      rubricInputs: goal.rubricInputs,
    });
  }, [goal]);

  const onClose = () => setOpenRubricForGoalId(null);
  const onSave = () => {
    if (!goal) return;
    updateGoal(goal.id, {
      rubric: draft.rubric,
      rubricInputs: draft.rubricInputs,
    });
    upsertBoardForGoal(goal.id);
    onClose();
  };

  return (
    <Modal
      open={!!goal}
      onClose={onClose}
      title={goal ? `Score: ${goal.title}` : "Score"}
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
      {goal ? (
        <div className="space-y-3">
          <RubricEditor nodeId={goal.id} draft={draft} setDraft={setDraft} />
          <div className="text-xs text-slate-500">
            Tip: Scores rebalance Active/Incubating/Dormant automatically.
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
