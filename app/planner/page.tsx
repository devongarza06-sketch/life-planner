"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { safeText } from "@/components/SafeText";

const HIGH_CONTRAST = true;



/**
 * One-file simulation of the life planner:
 * - Budget scales (week/day)
 * - Weekly planner placeholder (grid with “events”)
 * - Tabs: Passion / Person / Play / Misc
 * - Each tab: North Star selector -> Vision (legacy|personal side-by-side), then Goal Tree, then AID (Active/Incubating/Dormant)
 *
 * Notes:
 * - Pure client state (useState) so it runs with zero extra dependencies.
 * - Tailwind CSS classes for layout/spacing/typography.
 * - Tree renders centered, with a simple “family tree” vertical layout.
 */

type BoardCard = { name: string; score: number };
type Column = "Active" | "Incubating" | "Dormant";
type Vision = { legacy: string; legacyValues: string[]; personal: string; personalValues: string[] };
type TreeNode = { label: string; smart?: string; lead?: string; lag?: string; horizon?: string; children?: TreeNode[] };

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayIdx = new Date().getDay();

// --------------------------- Sample Data ---------------------------
const PASSION_NS = [
  {
    key: "writer",
    label: "Become a Writer",
    vision: {
      legacy: "Known for thoughtful, science-savvy fiction; mentors new writers.",
      legacyValues: ["Excellence", "Integrity", "Service", "Creativity"],
      personal: "Daily maker with a bias to publish; work funds autonomy.",
      personalValues: ["Mastery", "Autonomy", "Curiosity", "Playfulness"],
    } as Vision,
    tree: {
      label: "Become a Writer",
      smart: "Ship 2 publishable works/yr; 4‑day streak ≥80%.",
      lead: "Words/day, focus blocks",
      lag: "Accepted manuscripts, ratings",
      children: [
        {
          label: "Novel pipeline",
          smart: "120k‑word sci‑fi by May; passes dev‑edit.",
          lead: "WPH, sessions/wk",
          lag: "Editor pass/fail",
          children: [
            { label: "Outline v2", smart: "10 beat sheets by Feb 15", lead: "Deep hours", lag: "Outline QA", horizon: "1–3 mo" },
            { label: "Draft 1", smart: "80k by Apr 30", lead: "Words/day", lag: "Draft wordcount", horizon: "1–3 mo" },
          ],
        },
        {
          label: "Shorts & essays",
          smart: "4 shorts in 12 months",
          lead: "Submissions",
          lag: "Acceptances",
          children: [{ label: "Monthly flash", smart: "1 flash/mo", lead: "Drafts", lag: "Published", horizon: "1–3 mo" }],
        },
      ],
    } as TreeNode,
  },
  {
    key: "crna",
    label: "Become a CRNA",
    vision: {
      legacy: "Trusted clinician; calm leadership in high‑stakes moments.",
      legacyValues: ["Competence", "Compassion", "Reliability"],
      personal: "Schedule autonomy via advanced practice; daily learning.",
      personalValues: ["Mastery", "Security", "Growth"],
    } as Vision,
    tree: {
      label: "Become a CRNA",
      smart: "Admit to top program in 18–24 mo.",
      lead: "Study hrs, clinical experiences",
      lag: "GPA, certs, offers",
      children: [
        { label: "Prereqs complete", smart: "Chem, Pharm A/A‑", lead: "Study blocks/wk", lag: "Grades", horizon: "1–3 mo" },
        { label: "Admission package", smart: "GRE ≥75th, LORs, SOP v3", lead: "Prep hours", lag: "Scores, submissions", horizon: "1–3 mo" },
      ],
    } as TreeNode,
  },
];

const PERSON_SECTIONS = [
  { id: "physical", label: "Physical" },
  { id: "cognitive", label: "Cognitive" },
  { id: "emotional", label: "Emotional" },
  { id: "social", label: "Social" },
  { id: "meaning", label: "Meaning" },
] as const;

const PERSON_NS: Record<(typeof PERSON_SECTIONS)[number]["id"], { key: string; label: string; vision: Vision; tree: TreeNode }[]> = {
  physical: [
    {
      key: "athlete",
      label: "Athletic Clinician",
      vision: {
        legacy: "Peers see me as energetic, dependable, and a model of healthy habits.",
        legacyValues: ["Vitality", "Consistency", "Self‑respect"],
        personal: "Feel light, strong, and clear‑headed most days.",
        personalValues: ["Discipline", "Recovery", "Joy"],
      },
      tree: {
        label: "Athletic Clinician",
        smart: "Sustain MVC ≥5d/wk; resting HR ↓ by 5 bpm in 3 mo.",
        lead: "Sessions/wk, sleep hrs",
        lag: "HR, strength tests",
        children: [
          { label: "Strength Base", smart: "12‑wk plan", lead: "Lifts/wk", lag: "5RM progress", horizon: "1–3 mo" },
          { label: "Sleep Routine", smart: "10:30 wind‑down", lead: "Evenings logged", lag: "Subjective energy", horizon: "1–3 mo" },
        ],
      },
    },
  ],
  cognitive: [],
  emotional: [],
  social: [],
  meaning: [],
};

const PLAY_NS = [
  {
    key: "musician",
    label: "Grow as Musician",
    vision: {
      legacy: "Friends know me as the person who brings music to gatherings.",
      legacyValues: ["Connection", "Joy", "Courage"],
      personal: "I can perform 3 songs comfortably and jam with others.",
      personalValues: ["Play", "Mastery", "Presence"],
    },
    tree: {
      label: "Grow as Musician",
      smart: "3‑song set @ 90 BPM by summer.",
      lead: "Focused minutes",
      lag: "Clean recordings",
      children: [
        { label: "Technique bootcamp", smart: "5×20‑min/wk", lead: "Minutes", lag: "Error rate", horizon: "1–3 mo" },
        { label: "Repertoire", smart: "3 songs fully learned", lead: "Sections mastered", lag: "Performance clip", horizon: "1–3 mo" },
      ],
    },
  },
];

// --------------------------- UI Helpers ---------------------------
function Pill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full whitespace-nowrap border transition-colors ${
        active
          ? "bg-indigo-600 border-indigo-600 text-white shadow"
          : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        HIGH_CONTRAST
          ? `rounded-2xl border border-slate-300 bg-white shadow ${className}`
          : `rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`
      }
    >
      {children}
    </div>
  );
}

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="font-semibold">{title}</div>
      {right}
    </div>
  );
}

function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}

// --------------------------- Budget Scales ---------------------------
function BudgetScales() {
  const [mode, setMode] = useState<"week" | "day">("week");
  const [b, setB] = useState({ passion: 45, person: 25, play: 15, misc: 15 });
  const total = b.passion + b.person + b.play + b.misc;

  const Slider = ({ k, label, icon }: { k: keyof typeof b; label: string; icon: string }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-white flex items-center gap-2">
          <span className="opacity-90">{icon}</span>
          {label}
        </div>
        <button className="lp-pill text-xs bg-white/10 border-white/20 text-white/90">Amplify</button>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={b[k]}
        onChange={(e) => setB((x) => ({ ...x, [k]: parseInt(e.target.value, 10) }))}
        className="w-full"
      />
      <div className="text-xs text-white/70 mt-2">{b[k]}% • {mode === "week" ? "of weekly controllable hours" : "of today’s focus"}</div>
    </div>
  );

  return (
    <div className="rounded-3xl p-6 bg-[var(--lp-surface)] text-white shadow-inner">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl lp-h flex items-center gap-2"><span>🗓️</span> Weekly & Daily Scales</h2>
        <div className="flex gap-2">
          <button className={`lp-pill ${mode === "week" ? "lp-pill--active" : "text-white/90 bg-white/10 border-white/20"}`} onClick={() => setMode("week")}>Week</button>
          <button className={`lp-pill ${mode === "day" ? "lp-pill--active" : "text-white/90 bg-white/10 border-white/20"}`} onClick={() => setMode("day")}>Day</button>
        </div>
      </div>
      <p className="text-white/70 text-sm mt-2">Drag to allocate focus. Aim for 100%. Use Amplify to boost 1–2 buckets this week.</p>

      <div className="grid md:grid-cols-4 gap-4 mt-4">
        <Slider k="passion" label="Passion" icon="🎯" />
        <Slider k="person"  label="Person"  icon="💧" />
        <Slider k="play"    label="Play"    icon="▶️" />
        <Slider k="misc"    label="Misc"    icon="≡" />
      </div>

      <div className="mt-4 text-xs text-white/70">Total: {total}% (aim for 100%)</div>
      <div className="mt-3 h-px bg-white/10 rounded-full" />
    </div>
  );
}


// --------------------------- Weekly Planner (placeholder) ---------------------------
function WeeklyPlanner() {
  const [events] = useState([
    { id: 1, day: 1, start: "07:00", end: "08:30", bucket: "Passion", title: "MIT – Novel draft", fixed: false },
    { id: 2, day: 1, start: "18:00", end: "18:45", bucket: "Person", title: "Workout – strength", fixed: true },
    { id: 3, day: 2, start: "07:00", end: "09:00", bucket: "Passion", title: "CRNA Pharm module", fixed: false },
    { id: 4, day: 2, start: "20:00", end: "20:30", bucket: "Play", title: "FoW – Guitar practice", fixed: false },
    { id: 5, day: 5, start: "17:00", end: "17:45", bucket: "Misc", title: "Weekly maintenance block", fixed: true },
  ]);
  return (
  <div className="lp-card">
    <CardHeader title="Weekly Planner" />
    <CardBody>
      <p className="text-sm text-slate-600 mb-3">
        Drag (conceptually) to reorder within a day. Fixed items are pinned. Click a chip for details.
      </p>
      <div className="grid grid-cols-7 gap-4">
        {dayNames.map((d, idx) => (
          <div key={d} className={`rounded-2xl border min-h-[260px] p-2 ${idx === todayIdx ? "border-indigo-400 bg-indigo-50/60 shadow-[inset_0_0_0_2px_rgba(99,102,241,.15)]" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <div className="font-semibold text-slate-900">{d}</div>
              {idx === todayIdx && <span className="lp-pill bg-white text-slate-800 text-xs">⭐ Today</span>}
            </div>
            <div className="space-y-2">
              {events.filter((e) => e.day === idx).map((e) => (
                <div key={e.id} className={`rounded-xl border px-3 py-2 ${e.fixed ? "bg-slate-50" : "bg-white"}border-slate-300`}>
                  <div className="text-[11px] text-slate-700 leading-4 flex items-center justify-between">
                    <span>{e.start}–{e.end}</span>
                    <span className="lp-chip">{e.bucket}</span>
                  </div>
                  <div className="text-[13px] font-semibold mt-1 text-slate-900">{e.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </div>
);

}

// --------------------------- Strategy Tree ---------------------------
function StrategyTree({ root }: { root?: TreeNode }) {
  const NodeBox = ({ node }: { node: TreeNode }) => (
    <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 w-[280px] text-center shadow-sm">
      <div className="text-base font-semibold text-slate-900">{node.label}</div>
      {node.smart && (
        <details className="mt-2" open>
          <summary className="text-xs text-slate-700 cursor-pointer">SMARTIER + Metrics</summary>
          <div className="text-xs text-slate-800 mt-1 space-y-0.5">
            <div><b>SMARTIER:</b> {safeText(node.smart)}</div>
            <div>
              <b>Lead:</b> {safeText(node.lead || "—")} • <b>Lag:</b> {safeText(node.lag || "—")}
              {node.horizon ? <> • <b>{node.horizon}</b></> : null}
            </div>
          </div>
        </details>
      )}
    </div>
  );

  const render = (node: TreeNode): React.ReactNode => {
    const kids = node.children || [];
    return (
      <div className="flex flex-col items-center">
        <NodeBox node={node} />
        {kids.length > 0 && (
          <>
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex gap-10">
              {kids.map((k, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-6 w-px bg-slate-300" />
                  <div className="w-10 h-px bg-slate-300" />
                  {render(k)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader title="Connected Tree (Family‑style)" />
      <CardBody>
        <div className="flex justify-center overflow-x-auto">
          <div className="max-h-[520px] overflow-auto p-4">
            {root ? render(root) : <div className="text-sm text-slate-700">No tree defined.</div>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}


// --------------------------- AID Board ---------------------------
function AIDBoard({ rubric = "IART+G", sample }: { rubric?: string; sample: { active: BoardCard[]; incubating: BoardCard[]; dormant: BoardCard[] } }) {
  const cols: { name: Column; items: BoardCard[] }[] = [
    { name: "Active", items: sample.active },
    { name: "Incubating", items: sample.incubating },
    { name: "Dormant", items: sample.dormant },
  ];
  return (
    <Card>
      <CardHeader title={`A/I/D — Rubric: ${rubric}`} />
      <CardBody>
        <div className="grid md:grid-cols-3 gap-6">
          {cols.map((col) => (
            <div key={col.name} className="rounded-2xl border border-slate-300 bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-slate-900">{col.name}</div>
                <span className="lp-pill text-xs">{col.items.length}</span>
              </div>
              <div className="space-y-3">
                {col.items.map((it, i) => (
                  <div key={i} className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
                    <div className="text-sm font-semibold text-slate-900">{it.name}</div>
                    <div className="text-xs text-slate-700 mt-1">Score: {it.score.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-600 mt-3">I=Impact, A=Alignment, R=Readiness, T=Time‑sensitivity (+ G tie‑breaker)</div>
      </CardBody>
    </Card>
  );
}

// --------------------------- Vision Boxes ---------------------------
function VisionBoxes({ v }: { v: Vision }) {
  return (
    <Card>
      <CardHeader title="Vision" />
      <CardBody>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-300 bg-white p-4">
            <div className="font-semibold mb-2 text-slate-900">Legacy Vision (Seen By Others)</div>
            <div className="text-sm mb-3 text-slate-800">{safeText(v.legacy)}</div>
            <div className="flex flex-wrap gap-2">
              {v.legacyValues.map((val) => (
                <span key={val} className="lp-chip">{val}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-300 bg-white p-4">
            <div className="font-semibold mb-2 text-slate-900">Personal Vision (For Me)</div>
            <div className="text-sm mb-3 text-slate-800">{safeText(v.personal)}</div>
            <div className="flex flex-wrap gap-2">
              {v.personalValues.map((val) => (
                <span key={val} className="lp-chip">{val}</span>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}


// --------------------------- Tabs ---------------------------
function PassionTab() {
  const [sel, setSel] = useState(PASSION_NS[0].key);
  const current = PASSION_NS.find((x) => x.key === sel)!;

  const aidSample = {
    active: [
      { name: "CRNA Pharm module", score: 4.4 },
      { name: "Novel +20k words", score: 4.2 },
      { name: "App onboarding slice", score: 3.9 },
    ],
    incubating: [
      { name: "Research mini‑course", score: 3.4 },
      { name: "Character rework", score: 3.2 },
      { name: "App payments spike", score: 3.1 },
    ],
    dormant: [
      { name: "Public speaking", score: 2.7 },
      { name: "Photography series", score: 2.3 },
      { name: "Extra certification", score: 2.1 },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PASSION_NS.map((item) => (
          <Pill key={item.key} active={item.key === sel} onClick={() => setSel(item.key)}>
            {item.label}
          </Pill>
        ))}
      </div>
      <VisionBoxes v={current.vision} />
      <StrategyTree root={current.tree} />
      <AIDBoard rubric="IART+G" sample={aidSample} />
    </div>
  );
}

function PersonSection({ id, label }: { id: (typeof PERSON_SECTIONS)[number]["id"]; label: string }) {
  const list = PERSON_NS[id] || [];
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(list[0]?.key);

  const current = useMemo(() => list.find((x) => x.key === sel), [list, sel]);

  return (
    <Card>
      <CardHeader
        title={label}
        right={
          <button onClick={() => setOpen((o) => !o)} className="px-3 py-1 rounded-full border bg-white hover:bg-slate-50">
            {open ? "Collapse" : "Expand"}
          </button>
        }
      />
      {open && (
        <CardBody className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {list.map((item) => (
              <Pill key={item.key} active={item.key === sel} onClick={() => setSel(item.key)}>
                {item.label}
              </Pill>
            ))}
            {list.length === 0 && <div className="text-sm text-slate-700">No directions defined yet.</div>}
          </div>
          {current && (
            <>
              <VisionBoxes v={current.vision} />
              <StrategyTree root={current.tree} />
            </>
          )}
          <AIDBoard rubric="UIE" sample={{ active: [], incubating: [], dormant: [] }} />
        </CardBody>
      )}
    </Card>
  );
}

function PersonTab() {
  return (
    <div className="space-y-3">
      {PERSON_SECTIONS.map((sec) => (
        <PersonSection key={sec.id} id={sec.id} label={sec.label} />
      ))}
    </div>
  );
}

function PlayTab() {
  const [sel, setSel] = useState(PLAY_NS[0].key);
  const current = PLAY_NS.find((x) => x.key === sel)!;

  const aidSample = {
    active: [{ name: "Repertoire showcase", score: 4.7 }],
    incubating: [
      { name: "Technique bootcamp", score: 4.2 },
      { name: "Blues improv", score: 3.9 },
      { name: "Ear-training", score: 3.7 },
    ],
    dormant: [{ name: "Choir season", score: 2.5 }],
  };

  return (
    <div className="space-y-4">
      {/* Pure Play */}
      <Card>
        <CardHeader title="Pure Play (Recharge)" />
        <CardBody>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-700">Feature of the Week</div>
              <div className="font-medium mb-2">Board‑game night</div>
              <div className="text-xs">Duration: Sat 7–10pm</div>
              <div className="mt-2 text-xs">JRN: Joy 5 • Restoration 4 • Novelty 3</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-700">Play Queue (Incubating)</div>
              <ul className="list-disc ml-4 text-sm space-y-1">
                <li>Hiking new trail</li>
                <li>Museum afternoon</li>
                <li>Pottery intro</li>
              </ul>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-700">Dormant</div>
              <ul className="list-disc ml-4 text-sm space-y-1">
                <li>Piano improv</li>
                <li>Retro sci‑fi films</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Skill Play */}
      <Card>
        <CardHeader title="Skill Play (Learn & Showcase)" />
        <CardBody className="space-y-4">
          <div className="flex gap-2 overflow-x-auto">
            {PLAY_NS.map((item) => (
              <Pill key={item.key} active={item.key === sel} onClick={() => setSel(item.key)}>
                {item.label}
              </Pill>
            ))}
          </div>
          <VisionBoxes v={current.vision} />
          <StrategyTree root={current.tree} />
          <AIDBoard rubric="JRN" sample={aidSample} />
        </CardBody>
      </Card>
    </div>
  );
}

function MiscTab() {
  const cats = [
    "Finance & Money Ops",
    "Home & Environment",
    "Errands & Procurement",
    "Digital Hygiene",
    "Legal & Identity",
    "Healthcare Admin",
    "Work/School Admin",
    "Transportation & Travel",
    "Security & Risk",
    "Life Ops & Organization",
    "Pets & Dependents",
    "Events & Seasonal Prep",
    "Relationships & Civic Admin",
  ];
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {cats.map((c) => (
        <Card key={c}>
          <CardHeader
            title={c}
            right={
              <button onClick={() => setOpen(open === c ? null : c)} className="px-3 py-1 rounded-full border bg-white hover:bg-slate-50">
                {open === c ? "Collapse" : "Expand"}
              </button>
            }
          />
          {open === c && (
            <CardBody className="space-y-3">
              <div>
                <div className="font-medium text-sm mb-1">Maintenance</div>
                <ul className="list-disc ml-5 text-sm">
                  <li>2×45‑min weekly maintenance blocks</li>
                  <li>Monthly Admin Day (finance, digital, subscriptions)</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-sm mb-1">Mini‑projects</div>
                <div className="text-sm text-slate-700">Use AID board here (future).</div>
              </div>
            </CardBody>
          )}
        </Card>
      ))}
    </div>
  );
}

// --------------------------- Page Shell ---------------------------
export default function PlannerPage() {
  const [tab, setTab] = useState<"Passion" | "Person" | "Play" | "Misc">("Passion");

  return (
    <div className="skeleton-off p-4 md:p-6 max-w-[1200px] mx-auto space-y-4">
      {/* Hero */}
<div className="rounded-3xl p-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-xl">
  <div className="flex items-center justify-between flex-wrap gap-4">
    <div>
      <div className="text-3xl md:text-4xl lp-h">Design your week like a pro.</div>
      <div className="mt-2 text-white/90">Turn motives into motion: focus budgets, visible wins, tiny experiments.</div>
    </div>
    <div className="flex items-center gap-2">
      <span className="lp-pill bg-white/20 backdrop-blur text-white/95 border-white/30">Streak: 7</span>
      <span className="lp-pill bg-white/20 backdrop-blur text-white/95 border-white/30">Wins today: 3</span>
    </div>
  </div>
</div>


      {/* Scales */}
      <BudgetScales />

      {/* Weekly planner */}
      <WeeklyPlanner />

      {/* Tabs */}
      <div className="rounded-3xl border bg-white">
        <div className="flex items-center gap-2 p-3 sticky top-0 bg-white/95 backdrop-blur z-10 border-b">
          {(["Passion", "Person", "Play", "Misc"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`lp-pill ${tab === t ? "lp-pill--active" : ""}text-slate-900`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto text-sm text-slate-600">
            <Link className="underline hover:opacity-80" href="/">Home</Link>
          </div>
        </div>
        <div className="p-4 md:p-6">
          {tab === "Passion" && <PassionTab />}
          {tab === "Person" && <PersonTab />}
          {tab === "Play" && <PlayTab />}
          {tab === "Misc" && <MiscTab />}
        </div>
      </div>
    </div>
  );
}
