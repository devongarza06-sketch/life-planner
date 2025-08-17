"use client";
import { useStore } from "@/state/useStore";
import { BoardStatus } from "@/domain/types";

export default function AidBoard({ tabId, rubricLabel='IART+G' }:{tabId:string; rubricLabel?:string}){
  const { boards } = useStore();
  const items = boards.filter(b=> b.tabId === tabId);

  const cols: { id: BoardStatus; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'incubating', label: 'Incubating' },
    { id: 'dormant', label: 'Dormant' }
  ];

  const list = (status: BoardStatus)=> items.filter(i=>i.status===status);

  return (
    <div className="mt-4">
      <div className="grid md:grid-cols-3 gap-4">
        {cols.map(col=> (
          <div key={col.id} className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold">{col.label}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">{list(col.id).length}</span>
            </div>
            <div className="space-y-2">
              {list(col.id).map(card=> (
                <div key={card.id} className="rounded-lg border p-2">
                  <div className="text-sm font-medium">{card.title}</div>
                  <div className="text-[11px] text-gray-500">{card.rubric || rubricLabel}: {card.score?.toFixed(2) ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">I=Impact, A=Alignment, R=Readiness, T=Time-sensitivity (+ G tie-breaker)</p>
    </div>
  );
}
