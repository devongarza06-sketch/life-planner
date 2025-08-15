"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";
import AidBoard from "../AidBoard";
import ScoreBadge from "../ScoreBadge";

/**
 * Misc tab – lists administrative categories with maintenance lists and mini-project boards.
 */
export default function MiscTab() {
  const miscCategories = [
    { id: "finance", label: "Finance & Money Ops" },
    { id: "environment", label: "Home & Environment" },
    { id: "errands", label: "Errands & Procurement" },
    { id: "digital", label: "Digital Hygiene" },
    { id: "legal", label: "Legal & Identity" },
    { id: "healthcare", label: "Healthcare Admin" },
    { id: "work", label: "Work/School Admin" },
    { id: "transport", label: "Transportation & Travel" },
    { id: "security", label: "Security & Risk" },
    { id: "lifeOps", label: "Life Ops & Organization" },
    { id: "pets", label: "Pets & Dependents" },
    { id: "events", label: "Events & Seasonal Prep" },
    { id: "relationships", label: "Relationships & Civic Admin" }
  ];

  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {miscCategories.map((cat) => (
        <div key={cat.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-3 shadow">
          <button
            onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
            className="w-full flex justify-between items-center text-left"
          >
            <span className="font-semibold">{cat.label}</span>
            <span className="text-xl">{openCategory === cat.id ? "−" : "+"}</span>
          </button>
          {openCategory === cat.id && (
            <div className="mt-2 space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Maintenance</h4>
                <ul className="list-disc pl-5 text-sm">
                  <li>Check upcoming bills</li>
                  <li>Review subscriptions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Mini‑projects</h4>
                <AidBoard tabId={`misc-${cat.id}`} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
