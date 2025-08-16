"use client";
import { Vision } from "@/domain/types";

/**
 * Displays legacy and personal vision statements side-by-side
 * with their corresponding value chips underneath.
 * Accepts an optional vision and renders a placeholder if not defined yet.
 */
export default function VisionBoxes({ vision }: { vision?: Vision }) {
  if (!vision) {
    return (
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
          <h3 className="font-medium mb-1">Legacy Vision</h3>
          <p className="text-sm text-gray-500">No vision defined yet.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
          <h3 className="font-medium mb-1">Personal Vision</h3>
          <p className="text-sm text-gray-500">No vision defined yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
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
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
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
