"use client";
import { useStore } from "@/state/useStore";
import { BoardStatus } from "@/domain/types";

export default function AidBoard({
  tabId,
  rubricLabel = "IART+G",
  title = "A/I/D Board",
}: {
  tabId: string;
  rubricLabel?: string;
  title?: string;
}) {
  const { boards } = useStore();
  const items = boards.filter((b) => b.tabId === tabId);

  const cols: { id: BoardStatus; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "incubating", label: "Incubating" },
    { id: "dormant", label: "Dormant" },
  ];

  const list = (status: BoardStatus) => items.filter((i) => i.status === status);

  return (
    <div className="lp-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="lp-chip">Rubric: {rubricLabel}</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {cols.map((col) => (
          <div key={col.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{col.label}</div>
              <span className="lp-chip">{list(col.id).length}</span>
            </div>
            <div className="space-y-2 text-sm">
              {list(col.id).map((card) => (
                <div key={card.id} className="rounded-lg border p-2">
                  <div className="text-sm font-medium">{card.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {card.rubric || rubricLabel}:{" "}
                    {card.score?.toFixed(2) ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-2">
        I=Impact, A=Alignment, R=Readiness, T=Time-sensitivity (+ G tie-breaker)
      </p>
    </div>
  );
}
