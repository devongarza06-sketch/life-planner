"use client";

/** Generic badge rendering a scoring object (e.g. IART+G, UIE, JRN, ROB). */
export default function ScoreBadge({ scoring }: { scoring: Record<string, number> }) {
  const entries = Object.entries(scoring);
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([key, val]) => (
        <span key={key} className="text-xs px-1.5 py-0.5 rounded-md bg-accent/10 text-accent">
          {key.toUpperCase()}: {val}
        </span>
      ))}
    </div>
  );
}
