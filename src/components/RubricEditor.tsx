// src/components/RubricEditor.tsx
"use client";
import { useStore } from "@/state/useStore";

/**
 * RubricEditor
 * - Chooses rubric family by the goal's tab:
 *   Passion → IART+G, Play → JRN, Person → UIE.
 * - Writes to `draft.rubric` and `draft.rubricInputs`.
 * - Parents pass `{ draft, setDraft }`; we do not mutate store directly.
 *
 * Visual adjustments:
 * - Higher-contrast headings/labels on white modal backgrounds.
 * - Inputs use explicit border/text colors for clarity.
 */
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

  // Shared input class tuned for white modal surface
  const inputCls =
    "rounded border border-slate-300 p-2 text-sm text-slate-900 bg-white";

  if (tab === "passion") {
    const inputs = draft.rubricInputs ?? { rubric: "IART+G" };
    return (
      <div className="rounded border border-slate-200 p-3 text-slate-800 bg-white">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Rubric: IART+G
        </div>
        <div className="grid grid-cols-5 gap-2">
          {["I", "A", "R", "T", "G"].map((k) => (
            <input
              key={k}
              type="number"
              min={1}
              max={5}
              placeholder={k}
              value={inputs[k] ?? ""}
              onChange={(e) =>
                setDraft((d: any) => ({
                  ...d,
                  rubric: "IART+G",
                  rubricInputs: {
                    ...(d.rubricInputs ?? { rubric: "IART+G" }),
                    [k]: +e.target.value,
                    rubric: "IART+G",
                  },
                }))
              }
              className={inputCls}
            />
          ))}
        </div>
        <div className="text-xs text-slate-600 mt-2">
          Enter 1–5. Score averages I, A, R, T (G = tiebreaker).
        </div>
      </div>
    );
  }

  if (tab === "play") {
    const inputs = draft.rubricInputs ?? { rubric: "JRN" };
    return (
      <div className="rounded border border-slate-200 p-3 text-slate-800 bg-white">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Rubric: JRN
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["J", "R", "N"].map((k) => (
            <input
              key={k}
              type="number"
              min={1}
              max={5}
              placeholder={k}
              value={inputs[k] ?? ""}
              onChange={(e) =>
                setDraft((d: any) => ({
                  ...d,
                  rubric: "JRN",
                  rubricInputs: {
                    ...(d.rubricInputs ?? { rubric: "JRN" }),
                    [k]: +e.target.value,
                    rubric: "JRN",
                  },
                }))
              }
              className={inputCls}
            />
          ))}
        </div>
        <div className="text-xs text-slate-600 mt-2">
          Enter 1–5. Score averages J, R, N.
        </div>
      </div>
    );
  }

  // person → UIE
  const inputs = draft.rubricInputs ?? { rubric: "UIE" };
  return (
    <div className="rounded border border-slate-200 p-3 text-slate-800 bg-white">
      <div className="text-xs font-semibold text-slate-700 mb-2">
        Rubric: UIE
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["U", "I", "E"].map((k) => (
          <input
            key={k}
            type="number"
            min={1}
            max={5}
            placeholder={k}
            value={inputs[k] ?? ""}
            onChange={(e) =>
              setDraft((d: any) => ({
                ...d,
                rubric: "UIE",
                rubricInputs: {
                  ...(d.rubricInputs ?? { rubric: "UIE" }),
                  [k]: +e.target.value,
                  rubric: "UIE",
                },
              }))
            }
            className={inputCls}
          />
        ))}
      </div>
      <div className="text-xs text-slate-600 mt-2">
        Enter 1–5. Score averages U, I, E.
      </div>
    </div>
  );
}
