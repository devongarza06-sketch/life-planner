"use client";
import { useStore } from "@/state/useStore";
import { BoardStatus } from "@/domain/types";

export default function AIDBoard({
  label,
  rubricLabel,
  tabKey, // e.g., "passion-annual", "passion-13", "play-annual", "play-13", "person-13"
  columns, // ["Active (3)", "Incubating (≤3)", "Dormant (∞)"]
}: {
  label: string;
  rubricLabel: string;
  tabKey: string;
  columns: [string, string, string];
}) {
  const { boards } = useStore();
  const items = boards.filter((b) => b.tabId === tabKey);

  const by: Record<BoardStatus, typeof items> = {
    active: items.filter((i) => i.status === "active"),
    incubating: items.filter((i) => i.status === "incubating"),
    dormant: items.filter((i) => i.status === "dormant"),
  };

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
      <header className="flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <span className="text-xs text-slate-400">Rubric: {rubricLabel}</span>
      </header>

      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <Column title={columns[0]} items={by.active} />
        <Column title={columns[1]} items={by.incubating} />
        <Column title={columns[2]} items={by.dormant} />
      </div>
    </section>
  );
}

function Column({ title, items }: { title: string; items: { id: string; title: string; score?: number }[] }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
      <div className="font-medium mb-2">{title}</div>
      {items.length === 0 ? (
        <div className="text-sm text-slate-400">No items yet.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between text-sm">
              <span className="truncate">{it.title}</span>
              <span className="ml-3 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs bg-slate-700 text-slate-100">
                {typeof it.score === "number" ? it.score.toFixed(1) : "?"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
