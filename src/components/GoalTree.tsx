"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/state/useStore";
import { GoalNode } from "@/domain/types";

/**
 * Family-style centered tree. Click a node to expand SMARTIER (full fields).
 */
type Node = GoalNode & { children: Node[] };

function buildTree(goals: GoalNode[], directionId: string): Node | null{
  const byParent: Record<string, GoalNode[]> = {};
  for(const g of goals){
    const pid = g.parentId ?? "ROOT-"+g.directionId;
    (byParent[pid] ||= []).push(g);
  }
  const root = (goals.find(g=>g.directionId===directionId && g.type==='northStar') as GoalNode|undefined) || null;
  if(!root) return null;
  const attach = (node: GoalNode): Node => ({
    ...node,
    children: (byParent[node.id]||[]).map(attach)
  });
  return attach(root);
}

export default function GoalTree({ directionId }:{directionId:string}){
  const goals = useStore((s)=>s.goals);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const tree = useMemo(()=> buildTree(goals, directionId), [goals, directionId]);

  const toggle = (id:string)=> setOpen(o=>({...o, [id]: !o[id]}));

  const renderNode = (n: Node) => {
    const show = !!open[n.id];
    return (
      <li key={n.id} className="relative mb-4">
        <div className="mx-auto max-w-md rounded-xl border bg-white dark:bg-gray-800 p-2 shadow">
          <div className="flex items-start justify-between gap-2">
            <button onClick={()=>toggle(n.id)} className="text-left font-medium text-sm hover:text-accent focus:outline-none" aria-expanded={show}>
              {n.title}
            </button>
            <span className="text-[10px] uppercase tracking-wide text-gray-500">{n.type}</span>
          </div>
          {show && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div><span className="font-semibold">SMARTIER:</span> {n.smartier || '—'}</div>
              {(n.lead || n.lag) && (
                <div><span className="font-semibold">Metrics:</span> Lead: {n.lead || '—'} • Lag: {n.lag || '—'}</div>
              )}
            </div>
          )}
        </div>
        {n.children.length>0 && (
          <div className="mt-4">
            <div className="h-px bg-gray-300 dark:bg-gray-600 mx-8 mb-4"/>
            <ul className="grid md:grid-cols-2 gap-4">
              {n.children.map(ch=> renderNode(ch))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="mt-3">
      <h3 className="font-semibold mb-2 text-center">Connected Tree (Family-style)</h3>
      <div className="mx-auto max-w-4xl max-h-80 overflow-auto border rounded-xl p-3 bg-white dark:bg-gray-800">
        {!tree ? <div className="text-sm text-gray-500 text-center">No goals yet for this direction.</div> : <ul className="list-none pl-0">{renderNode(tree)}</ul>}
      </div>
    </div>
  );
}
