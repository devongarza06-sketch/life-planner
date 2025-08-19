"use client";
import { useMemo } from "react";
import { useStore } from "@/state/useStore";
import Active13EditModal from "./Active13EditModal";

/**
 * 1–3 Month Active Goals — Card Grid
 *
 * Reads "active" items from the 1–3 AID board (tabKey = passion-13 | play-13 | person-13)
 * and renders a card for each. Each card can show:
 * - Lead / Lag metrics (from GoalNode.lead / .lag)
 * - Weekly milestones (GoalNode.weekly?: string[])
 * - Daily tasks & habits (GoalNode.daily?: string[])
 * - If–Then / Yet map (GoalNode.ifThenYet?: string)
 * - Rationale (GoalNode.rationale?: string)
 * - Framework blocks:
 *      O-C-V-E-D-A-R  (GoalNode.ocvedar?: {O,C,V,E,D,A,R})
 *      O-P-I-S-M-I-T  (GoalNode.opismit?: {O,P,I,S,M,I2,T})
 *
 * NOTE: This component tolerates missing fields and shows soft placeholders.
 */
export default function Active13Panel({
  tabKey,
  title = "Selected Active 1–3 Month Goals",
  subtitle = "Select an active goal to see its weekly/daily breakdown.",
}: {
  tabKey: string;
  title?: string;
  subtitle?: string;
}) {
  const { boards, goals } = useStore();

  // all active board items for this 1–3 board
  const activeItems = useMemo(
    () =>
      boards
        .filter((b) => b.tabId === tabKey && b.status === "active")
        .sort((a, b) => {
          const sa = typeof a.score === "number" ? a.score : -Infinity;
          const sb = typeof b.score === "number" ? b.score : -Infinity;
          return sb - sa || (a.title || "").localeCompare(b.title || "");
        }),
    [boards, tabKey]
  );

  // join with goals by id (BoardCard.id === GoalNode.id)
  const cards = useMemo(() => {
    return activeItems.map((b) => {
      const g = goals.find((x) => x.id === b.id);
      const anyG = g as any;

      return {
        id: b.id,
        title: b.title || anyG?.title || "Untitled",
        score: b.score,
        lead: anyG?.lead || anyG?.leadMetric || "",
        lag: anyG?.lag || anyG?.lagMetric || "",
        weekly: (anyG?.weekly as string[]) || [],
        daily: (anyG?.daily as string[]) || [],
        ifThenYet: anyG?.ifThenYet || "",
        rationale: anyG?.rationale || "",
        ocvedar:
          (anyG?.ocvedar as
            | { O?: string; C?: string; V?: string; E?: string; D?: string; A?: string; R?: string }
            | undefined) || undefined,
        opismit:
          (anyG?.opismit as
            | { O?: string; P?: string; I?: string; S?: string; M?: string; I2?: string; T?: string }
            | undefined) || undefined,
      };
    });
  }, [activeItems, goals]);

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
      <h3 className="font-semibold mb-2">
        {title}
        {cards.length ? ` (${cards.length})` : ""}
      </h3>

      {cards.length === 0 ? (
        <div className="text-sm text-slate-400">{subtitle}</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((g) => (
            <GoalCard key={g.id} {...g} />
          ))}
        </div>
      )}

      {/* Centralized 1–3 editor modal */}
      <Active13EditModal />
    </section>
  );
}

/* ---------- card ---------- */

function GoalCard({
  id,
  title,
  score,
  lead,
  lag,
  weekly,
  daily,
  ifThenYet,
  rationale,
  ocvedar,
  opismit,
}: {
  id: string;
  title: string;
  score?: number;
  lead?: string;
  lag?: string;
  weekly: string[];
  daily: string[];
  ifThenYet?: string;
  rationale?: string;
  ocvedar?: { O?: string; C?: string; V?: string; E?: string; D?: string; A?: string; R?: string };
  opismit?: { O?: string; P?: string; I?: string; S?: string; M?: string; I2?: string; T?: string };
}) {
  const { setOpenActive13ForGoalId } = useStore();

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
      {/* header */}
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold pr-3">{title}</div>
        <div className="shrink-0 ml-2 inline-flex items-center gap-2">
          {lead || lag ? (
            <span className="rounded-full bg-slate-700 text-slate-100 text-xs px-2 py-0.5">
              {lead ? `Lead: ${lead}` : ""}
              {lead && lag ? " • " : ""}
              {lag ? `Lag: ${lag}` : ""}
            </span>
          ) : null}
          <span className="rounded-full bg-slate-700 text-slate-100 text-xs px-2 py-0.5">
            {typeof score === "number" ? score.toFixed(1) : "?"}
          </span>
          <button
            aria-label="Edit 1–3 details"
            onClick={() => setOpenActive13ForGoalId(id)}
            className="rounded px-2 py-0.5 text-slate-300 hover:bg-slate-700/60"
            title="Edit 1–3 details…"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* weekly / daily */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <ListBlock title="Weekly" items={weekly} />
        <ListBlock title="Daily" items={daily} />
      </div>

      {/* If–Then / Yet & Rationale */}
      <TextBlock title="If–Then / Yet Map" text={ifThenYet} />
      <TextBlock title="Rationale" text={rationale} />

      {/* frameworks */}
      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
        <FrameworkBox title="O‑C‑V‑E‑D‑A‑R" entries={ocvedar} order={["O","C","V","E","D","A","R"]} />
        <FrameworkBox title="O‑P‑I‑S‑M‑I‑T" entries={opismit} order={["O","P","I","S","M","I2","T"]} labelMap={{I2:"I"}} />
      </div>
    </div>
  );
}

/* ---------- bits ---------- */

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const has = items && items.length > 0;
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{title}</div>
      {has ? (
        <ul className="list-disc list-inside space-y-1">
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      ) : (
        <div className="text-slate-500 text-xs">No {title.toLowerCase()} yet.</div>
      )}
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="mb-2">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="text-sm">{text}</div>
    </div>
  );
}

function FrameworkBox({
  title,
  entries,
  order,
  labelMap,
}: {
  title: string;
  entries?: Record<string, string | undefined>;
  order: string[];
  labelMap?: Record<string, string>;
}) {
  if (!entries) {
    return (
      <div className="rounded-lg border border-slate-700/60 p-2 text-slate-500">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-xs">No entries yet.</div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-700/60 p-2">
      <div className="font-medium mb-1">{title}</div>
      <div className="space-y-0.5">
        {order.map((k) => {
          const label = (labelMap && labelMap[k]) || k;
          const val = entries[k];
          return (
            <div key={k}>
              <b>{label}:</b>{" "}
              {val ? <span>{val}</span> : <span className="text-slate-500">—</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
