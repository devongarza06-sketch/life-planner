"use client";
import React from "react";

/**
 * ActiveQuarterGoals
 * - Reusable section: renders "1–3 Month Active Goals" cards.
 * - Each card supports Weekly & Daily lists; each item shows its own If-Then/Y-et and Rationale.
 * - Also shows two compact experiment stacks: O-C-V-E-D-A-R and O-P-I-S-M-I-T.
 *
 * Props:
 *  - variant: "passion" | "play" | "person"
 *  - sectionId?: string  (for person sub-sections if you want tailored examples)
 */
type ExperimentItem = {
  label: string;
  value: string;
};

type ExperimentBlock = {
  title: "O-C-V-E-D-A-R" | "O-P-I-S-M-I-T";
  items: ExperimentItem[];
};

type ActionItem = {
  text: string;               // Visible bullet text (e.g., "Watch 3 lectures")
  when?: string;              // Optional time/frequency label (e.g., "45-min", "6pm")
  ifThen?: string;            // If-Then/Y-et mapping specific to this item
  rationale?: string;         // Rationale specific to this item
};

type CardData = {
  title: string;
  metricLeadLag?: string;     // "Lead: X • Lag: Y"
  weekly: ActionItem[];
  daily: ActionItem[];
  experiments: ExperimentBlock[]; // two blocks
};

type Props = {
  variant: "passion" | "play" | "person";
  sectionId?: string;
};

const samplePassion: CardData[] = [
  {
    title: "CRNA Pharm module",
    metricLeadLag: "Lead: Study hrs • Lag: Module exam score",
    weekly: [
      { text: "Watch 3 lectures" },
      { text: "Anki 300 cards" },
      { text: "Quiz me Fri" },
    ],
    daily: [
      { text: "Deep block", when: "45-min", ifThen: "If shift runs late → do 20-min night review.", rationale: "Maintain consistency; protect decay curve." },
      { text: "Review", when: "15-min", ifThen: "If miss morning slot → tack onto lunch.", rationale: "Micro-reps stabilize retention." },
    ],
    experiments: [
      {
        title: "O-C-V-E-D-A-R",
        items: [
          { label: "O:", value: "Raise practice score from 68→80%" },
          { label: "C:", value: "≤6 hrs/week" },
          { label: "V:", value: "AM vs PM sessions" },
          { label: "E:", value: "2-week A/B" },
          { label: "D:", value: "hrs, accuracy" },
          { label: "A:", value: "pick ≥+10% accuracy" },
          { label: "R:", value: "lock winning slot" },
        ],
      },
      {
        title: "O-P-I-S-M-I-T",
        items: [
          { label: "O:", value: "Baseline WPM 220" },
          { label: "P:", value: "Better after nap" },
          { label: "I:", value: "Identity = disciplined learner" },
          { label: "S:", value: "Phone in locker" },
          { label: "M:", value: "Inspiration follows action" },
          { label: "I:", value: "AI quiz vs self-quiz" },
          { label: "T:", value: "1-wk A/B" },
        ],
      },
    ],
  },
  {
    title: "Novel +20k words",
    metricLeadLag: "Lead: Words/day • Lag: Wordcount + editor review",
    weekly: [
      { text: "3×1k sprints" },
      { text: "Outline ch.3" },
      { text: "Fri café session" },
    ],
    daily: [
      { text: "90-min MIT", ifThen: "If miss MIT → 30-min night sprint.", rationale: "Keep streak; salvage momentum." },
      { text: "5-min tomorrow scene", rationale: "Reduce start friction; pre-decide." },
    ],
    experiments: [
      {
        title: "O-C-V-E-D-A-R",
        items: [
          { label: "O:", value: "600 wph w/ mood ≥4" },
          { label: "C:", value: "≤90 min/day" },
          { label: "V:", value: "Rain sounds vs silence" },
          { label: "E:", value: "2-week A/B" },
          { label: "D:", value: "wph, mood" },
          { label: "A:", value: "keep ≥10% gain" },
          { label: "R:", value: "update ritual" },
        ],
      },
      {
        title: "O-P-I-S-M-I-T",
        items: [
          { label: "O:", value: "Flow highest Tue/Thu" },
          { label: "P:", value: "≥7h sleep helps" },
          { label: "I:", value: "Author identity" },
          { label: "S:", value: "Phone pouch" },
          { label: "M:", value: "Keystrokes trigger inspiration" },
          { label: "I:", value: "Voice memo warm-up" },
          { label: "T:", value: "2-wk" },
        ],
      },
    ],
  },
  {
    title: "App onboarding slice",
    metricLeadLag: "Lead: Build minutes • Lag: Testers complete onboarding",
    weekly: [
      { text: "Wireframe screen" },
      { text: "Implement auth" },
      { text: "User test w/ 3 friends" },
    ],
    daily: [
      { text: "Build block", when: "60-min", ifThen: "If blocked ≥24h → ask mentor.", rationale: "Unstick fast; surface unknowns." },
    ],
    experiments: [
      {
        title: "O-C-V-E-D-A-R",
        items: [
          { label: "O:", value: "90% onboarding success" },
          { label: "C:", value: "≤5 hrs/wk" },
          { label: "V:", value: "Email vs OAuth first" },
          { label: "E:", value: "1-cycle A/B" },
          { label: "D:", value: "success %, time" },
          { label: "A:", value: "keep faster path" },
          { label: "R:", value: "document" },
        ],
      },
      {
        title: "O-P-I-S-M-I-T",
        items: [
          { label: "O:", value: "Context switching hurts" },
          { label: "P:", value: "Best at 7am" },
          { label: "I:", value: "Maker first hour" },
          { label: "S:", value: "Do Not Disturb" },
          { label: "M:", value: "Shallow later" },
          { label: "I:", value: "pair session" },
          { label: "T:", value: "try Tues" },
        ],
      },
    ],
  },
];

const samplePlay: CardData[] = samplePassion; // reuse for prototype
const samplePerson: CardData[] = [
  {
    title: "Physical – Strength Base",
    metricLeadLag: "Lead: Sessions/wk • Lag: 5-rep max",
    weekly: [
      { text: "3× compound lifts" },
      { text: "1× mobility class" },
    ],
    daily: [
      { text: "Walk", when: "20-min", ifThen: "If rain → indoor rower 15-min.", rationale: "Keep NEAT consistent." },
      { text: "Protein target", when: "≥120g", rationale: "Support recovery + satiety." },
    ],
    experiments: [
      {
        title: "O-C-V-E-D-A-R",
        items: [
          { label: "O:", value: "+10% 5RM squat" },
          { label: "C:", value: "≤4 hrs/wk" },
          { label: "V:", value: "Evening vs morning" },
          { label: "E:", value: "2-week A/B" },
          { label: "D:", value: "volume, RPE" },
          { label: "A:", value: "keep better slot" },
          { label: "R:", value: "log in app" },
        ],
      },
      {
        title: "O-P-I-S-M-I-T",
        items: [
          { label: "O:", value: "Move daily, small wins" },
          { label: "P:", value: "Energy dips at 3pm" },
          { label: "I:", value: "Athlete-clinician identity" },
          { label: "S:", value: "Gym bag in trunk" },
          { label: "M:", value: "Action → motivation" },
          { label: "I:", value: "Superset vs straight sets" },
          { label: "T:", value: "1-wk A/B" },
        ],
      },
    ],
  },
];

function Experiments({ block }: { block: ExperimentBlock }) {
  return (
    <div className="rounded-xl border p-2 bg-slate-50 dark:bg-slate-900/40">
      <div className="font-semibold text-sm">{block.title}</div>
      <ul className="text-xs mt-1 space-y-0.5">
        {block.items.map((it, i) => (
          <li key={i}>
            <b>{it.label}</b> {it.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({ data }: { data: CardData }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{data.title}</h4>
        {data.metricLeadLag && (
          <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700">
            {data.metricLeadLag}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <h5 className="font-semibold">Weekly</h5>
          <ul className="list-disc ml-5 text-sm space-y-2">
            {data.weekly.map((w, i) => (
              <li key={i}>
                <div className="font-medium">
                  {w.text}
                  {w.when ? <span className="text-xs ml-1 opacity-70">({w.when})</span> : null}
                </div>
                {w.ifThen && <div className="text-xs text-slate-500">If-Then: {w.ifThen}</div>}
                {w.rationale && <div className="text-xs text-slate-500">Rationale: {w.rationale}</div>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-semibold">Daily</h5>
          <ul className="list-disc ml-5 text-sm space-y-2">
            {data.daily.map((d, i) => (
              <li key={i}>
                <div className="font-medium">
                  {d.text}
                  {d.when ? <span className="text-xs ml-1 opacity-70">({d.when})</span> : null}
                </div>
                {d.ifThen && <div className="text-xs text-slate-500">If-Then: {d.ifThen}</div>}
                {d.rationale && <div className="text-xs text-slate-500">Rationale: {d.rationale}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Experiments block={data.experiments[0]} />
        <Experiments block={data.experiments[1]} />
      </div>
    </div>
  );
}

export default function ActiveQuarterGoals({ variant, sectionId }: Props) {
  const cards =
    variant === "passion" ? samplePassion :
    variant === "play" ? samplePlay :
    samplePerson; // person -> single-card example

  const heading = "1–3 Month Active Goals";

  // For Person: show 1 card; for Passion/Play: show 3 cards.
  const gridClass =
    variant === "person" ? "grid md:grid-cols-1" : "grid md:grid-cols-3";

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{heading}</h3>
        <span className="text-xs text-slate-500">Prototype UI</span>
      </div>
      <div className={`${gridClass} gap-4`}>
        {cards.map((c, i) => (
          <Card key={i} data={c} />
        ))}
      </div>
    </section>
  );
}
