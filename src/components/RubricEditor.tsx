"use client";
import { useStore } from "@/state/useStore";

export default function RubricEditor({
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
              type="number" min={1} max={5}
              placeholder={k} value={inputs[k] ?? ""}
              onChange={(e) => setDraft((d: any) => ({
                ...d, rubric: "IART+G",
                rubricInputs: { ...(d.rubricInputs ?? { rubric: "IART+G" }), [k]: +e.target.value, rubric: "IART+G" }
              }))}
              className="rounded border p-2 text-sm"
            />
          ))}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Enter 1–5. Score averages I, A, R, T (G = tiebreaker).
        </div>
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
              type="number" min={1} max={5}
              placeholder={k} value={inputs[k] ?? ""}
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

  const inputs = draft.rubricInputs ?? { rubric: "UIE" };
  return (
    <div className="rounded border p-2">
      <div className="text-xs font-medium mb-2">Rubric: UIE</div>
      <div className="grid grid-cols-3 gap-2">
        {["U","I","E"].map((k) => (
          <input
            key={k}
            type="number" min={1} max={5}
            placeholder={k} value={inputs[k] ?? ""}
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
