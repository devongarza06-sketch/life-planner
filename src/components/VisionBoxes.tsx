"use client";
import { Vision } from "@/domain/types";

/**
 * Displays legacy and personal vision statements side‑by‑side
 * with their corresponding value chips underneath.
 */
export default function VisionBoxes({ vision }: { vision: Vision }) {
  return (
    <div className="grid md:grid-cols-2 gap-3" data-component="VisionBoxes">
      <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-xl shadow">
        <h3 className="font-medium mb-1">Legacy Vision</h3>
        <p className="text-sm mb-2">{vision.legacyText || "Not set"}</p>
        <div className="flex flex-wrap gap-1">
          {vision.values.map((val) => (
            <span key={val} className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">
              {val}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-xl shadow">
        <h3 className="font-medium mb-1">Personal Vision</h3>
        <p className="text-sm mb-2">{vision.personalText || "Not set"}</p>
        <div className="flex flex-wrap gap-1">
          {vision.values.map((val) => (
            <span key={val + "-p"} className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">
              {val}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
