"use client";
import React from "react";
import PassionTab from "./tabs/PassionTab";
import PersonTab from "./tabs/PersonTab";
import PlayTab from "./tabs/PlayTab";
import MiscTab from "./tabs/MiscTab";
/**
 * TabbedWorkspace
 * - Four top-level tabs with readable pills on a light background
 * - Renders your existing PassionTab, PersonTab, PlayTab, MiscTab
 * - Scoped styles so it won't be affected by global overrides
 */

const tabList = [
  { id: "passion", label: "Passion" },
  { id: "person", label: "Person" },
  { id: "play", label: "Play" },
  { id: "misc", label: "Misc" },
] as const;
type TabId = (typeof tabList)[number]["id"];

export default function TabbedWorkspace() {
  const [selectedTab, setSelectedTab] = React.useState<TabId>("passion");

  return (
    <div className="tw">
      {/* Tab pills */}
      <div className="tw-tabs" role="tablist" aria-label="Workspace Tabs">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selectedTab === tab.id}
            className={`pill ${selectedTab === tab.id ? "pill--active" : ""}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab body */}
      <div className="tw-body" role="tabpanel">
        {selectedTab === "passion" && <PassionTab />}
        {selectedTab === "person" && <PersonTab />}
        {selectedTab === "play" && <PlayTab />}
        {selectedTab === "misc" && <MiscTab />}
      </div>

      <style jsx>{`
        .tw {
          /* wrapper on light surface */
        }
        .tw-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .pill {
          border: 1px solid #e5e7eb;
          background: #f8fafc; /* slate-50 */
          color: #0f172a; /* slate-900 */
          border-radius: 9999px;
          padding: 0.35rem 0.8rem;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background 120ms ease, color 120ms ease, border-color 120ms ease,
            box-shadow 120ms ease;
        }
        .pill:hover {
          background: #eef2ff; /* indigo-50 */
          border-color: #c7d2fe;
        }
        .pill--active {
          background: #6c63ff; /* accent */
          border-color: #6c63ff;
          color: #fff;
          box-shadow: 0 8px 16px rgba(108, 99, 255, 0.25);
        }
        .tw-body {
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
}
