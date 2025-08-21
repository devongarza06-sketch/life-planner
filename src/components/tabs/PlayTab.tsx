"use client";
import NorthStarBar from "@/components/NorthStarBar";
import VisionBoxes from "@/components/VisionBoxes";
import GoalTree from "@/components/GoalTree";
import AIDBoard from "@/components/AIDBoard";
import Active13Panel from "@/components/Active13Panel";
import { useStore } from "@/state/useStore";
import { useMemo, useState } from "react";

export default function PlayTab() {
  const { selected } = useStore();
  const directionId = selected.play ?? null;

  return (
    <div className="space-y-6">
      <PurePlaySection />

      {/* SKILL PLAY */}
      <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4 space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Skill Play (Learn &amp; Showcase)</h2>
          <span className="text-xs text-slate-400">A/I/D (+JRN)</span>
        </header>

        <div className="space-y-4">
          <NorthStarBar tab="play" />
          <VisionBoxes tab="play" />
          <GoalTree directionId={directionId ?? ""} />
        </div>

        <AIDBoard
          label="Annual Themes (12+ months)"
          rubricLabel="JRN"
          tabKey="play-annual"
          columns={["Active (3)", "Incubating (≤3)", "Dormant (∞)"]}
        />

        <AIDBoard
          label="1–3 Month Goals"
          rubricLabel="JRN"
          tabKey="play-13"
          columns={["Active (1)", "Incubating (≤3)", "Dormant (∞)"]}
        />

        <Active13Panel tab="play" />
      </section>
    </div>
  );
}

function PurePlaySection() {
  const {
    purePlay,
    getPurePlayTokenState,
    addPurePlayQueueItem,
    removePurePlayQueueItem,
    movePurePlayToDormant,
    movePurePlayDormantToQueue,
    updatePurePlayItem,
    promoteNextPurePlayCandidate,
    consumeTokenAndScheduleFeature,
  } = useStore();

  const tokens = getPurePlayTokenState();
  const [newName, setNewName] = useState("");

  const queueSorted = useMemo(
    () =>
      [...purePlay.queue].sort((a, b) => {
        const sa = (a.J ?? 0) + (a.R ?? 0) + (a.N ?? 0);
        const sb = (b.J ?? 0) + (b.R ?? 0) + (b.N ?? 0);
        if (sb !== sa) return sb - sa;
        return a.name.localeCompare(b.name);
      }),
    [purePlay.queue]
  );

  const candidate = purePlay.feature ?? queueSorted[0] ?? null;

  const addToQueue = () => {
    if (!newName.trim()) return;
    addPurePlayQueueItem({ name: newName.trim() });
    setNewName("");
  };

  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-800 p-4">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Pure Play (Recharge)</h2>
        <div className="text-xs text-slate-300 flex items-center gap-3">
          <span>
            Tokens: <span className="font-semibold">{tokens.remaining}</span> / 2
          </span>
          <span className="text-slate-400">
            resets in <span className="font-semibold">{tokens.resetsInDays}</span>{" "}
            day{tokens.resetsInDays === 1 ? "" : "s"}
          </span>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-3 mt-3">
        {/* Feature of the Week */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300 mb-1">Feature of the Week</div>
            <button
              onClick={promoteNextPurePlayCandidate}
              className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              title="Pick next candidate from queue (highest JRN)"
            >
              Pick next
            </button>
          </div>

          {candidate ? (
            <FeatureCard
              name={candidate.name}
              lastUsedISO={purePlay.lastFeatureAtISO}
              canUse={tokens.remaining > 0}
              onUse={(plan) => {
                const res = consumeTokenAndScheduleFeature(plan);
                if (!res.ok) alert(res.reason ?? "Could not use token.");
              }}
            />
          ) : (
            <div className="text-sm text-slate-400">No candidate. Add to queue below.</div>
          )}
        </div>

        {/* Queue */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
          <div className="text-sm text-slate-300 mb-2 flex items-center justify-between">
            <span>Play Queue (Incubating)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              className="col-span-2 rounded border border-slate-600 bg-slate-800 p-2 text-sm"
              placeholder="Add activity (e.g., Beach day, Movie night)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              onClick={addToQueue}
              className="col-span-2 justify-self-end px-3 py-1.5 rounded border border-slate-600 hover:bg-slate-800 text-sm"
            >
              + Add
            </button>
          </div>

          {queueSorted.length === 0 ? (
            <div className="text-sm text-slate-400">No items yet.</div>
          ) : (
            <ul className="space-y-2">
              {queueSorted.map((q) => (
                <QueueRow
                  key={q.id}
                  item={q}
                  onRemove={() => removePurePlayQueueItem(q.id)}
                  onDormant={() => movePurePlayToDormant(q.id)}
                  onSave={(patch) => updatePurePlayItem(q.id, patch)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Dormant */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-3">
          <div className="text-sm text-slate-300 mb-1">Dormant</div>
          {purePlay.dormant.length === 0 ? (
            <div className="text-sm text-slate-400">No items yet.</div>
          ) : (
            <ul className="space-y-2">
              {purePlay.dormant.map((d) => (
                <DormantRow
                  key={d.id}
                  item={d}
                  onRestore={() => movePurePlayDormantToQueue(d.id)}
                  onRemove={() => {
                    // quick remove via restore+remove to reuse existing remover
                    movePurePlayDormantToQueue(d.id);
                    removePurePlayQueueItem(d.id);
                  }}
                  onSave={(patch) => updatePurePlayItem(d.id, patch)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  name,
  lastUsedISO,
  canUse,
  onUse,
}: {
  name: string;
  lastUsedISO: string | null;
  canUse: boolean;
  onUse: (plan: {
    durationMin: number;
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    mode: "specific" | "floating";
    timeHHMM?: string | null;
  }) => void;
}) {
  const { isSlotFree, settings } = useStore();
  const [editing, setEditing] = useState(false);
  const [durationMin, setDurationMin] = useState(60);
  const [day, setDay] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0); // Sun
  const [mode, setMode] = useState<"specific" | "floating">("specific");
  const [time, setTime] = useState<string>("06:00");

  const snap = settings.snapMinutes || 15;

  const use = () => {
    onUse({
      durationMin,
      day,
      mode,
      timeHHMM: mode === "specific" ? time : null,
    });
  };

  return (
    <>
      <div className="font-semibold">{name}</div>
      <div className="text-xs text-slate-500 mt-1">
        {lastUsedISO ? `Last used: ${lastUsedISO}` : "Not used yet this cycle."}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={use}
          className="px-3 py-1.5 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          disabled={!canUse}
        >
          Use 1 Token
        </button>
        <button
          onClick={() => setEditing((v) => !v)}
          className="px-3 py-1.5 rounded border border-slate-600 hover:bg-slate-800"
        >
          {editing ? "Close" : "Edit time"}
        </button>
      </div>

      {editing && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-400 col-span-2">Duration</label>
          <input
            type="number"
            min={15}
            max={1440}
            step={snap}
            className="rounded border border-slate-600 bg-slate-800 p-2 text-sm w-32"
            value={durationMin}
            onChange={(e) =>
              setDurationMin(Math.max(1, Math.min(1440, +e.target.value || 60)))
            }
          />

          <div className="col-span-2 flex flex-wrap items-center gap-2 mt-2">
            <label className="text-xs text-slate-400">Day</label>
            <select
              className="rounded border border-slate-600 bg-slate-800 p-2 text-sm"
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value, 10) as 0 | 1 | 2 | 3 | 4 | 5 | 6)}
            >
              <option value={0}>Sun</option>
              <option value={1}>Mon</option>
              <option value={2}>Tue</option>
              <option value={3}>Wed</option>
              <option value={4}>Thu</option>
              <option value={5}>Fri</option>
              <option value={6}>Sat</option>
            </select>

            <select
              className="rounded border border-slate-600 bg-slate-800 p-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as "specific" | "floating")}
            >
              <option value="specific">Specific</option>
              <option value="floating">Floating</option>
            </select>

            {mode === "specific" && (
              <>
                <label className="text-xs text-slate-400">Time</label>
                <AvailabilityAwareTimeSelect
                  value={time}
                  onChange={setTime}
                  day={day}
                  durationMin={durationMin}
                  isSlotFree={isSlotFree}
                  snap={snap}
                />
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-500 col-span-2">
            If the selected slot is occupied, the app will place it at the next
            available time that doesn’t overlap.
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Time dropdown that visually grays-out unavailable times and disables them.
 * We respect the planner snap (default 15m) and working window 05:00–23:45.
 */
function AvailabilityAwareTimeSelect({
  value,
  onChange,
  day,
  durationMin,
  isSlotFree,
  snap = 15,
}: {
  value: string;
  onChange: (v: string) => void;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  durationMin: number;
  isSlotFree: (day: 0 | 1 | 2 | 3 | 4 | 5 | 6, startHHMM: string, durationMin: number) => boolean;
  snap?: number;
}) {
  const opts: { t: string; free: boolean }[] = [];
  for (let h = 5; h <= 23; h++) {
    for (let m = 0; m < 60; m += snap) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const t = `${hh}:${mm}`;
      const free = isSlotFree(day, t, Math.max(1, durationMin));
      opts.push({ t, free });
    }
  }

  return (
    <select
      className="rounded border border-slate-600 bg-slate-800 p-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {opts.map(({ t, free }) => (
        <option
          key={t}
          value={t}
          disabled={!free}
          className={free ? "" : "text-slate-500"}
        >
          {t}
          {!free ? " – unavailable" : ""}
        </option>
      ))}
    </select>
  );
}

/* Queue item row: ONLY name + J/R/N (duration removed per request) */
function QueueRow({
  item,
  onRemove,
  onDormant,
  onSave,
}: {
  item: { id: string; name: string; J?: number; R?: number; N?: number };
  onRemove: () => void;
  onDormant: () => void;
  onSave: (patch: { name?: string; J?: number; R?: number; N?: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [J, setJ] = useState(item.J ?? 3);
  const [R, setR] = useState(item.R ?? 3);
  const [N, setN] = useState(item.N ?? 3);

  const save = () => {
    onSave({ name: name.trim() || item.name, J, R, N });
    setOpen(false);
  };

  return (
    <li className="rounded border border-slate-700/50 bg-slate-900/20">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="font-medium">{item.name}</div>
        <button
          className="px-2 py-1 text-slate-300 hover:bg-slate-800 rounded"
          onClick={() => setOpen((v) => !v)}
          aria-label="Edit"
          title="Edit / Move"
        >
          ⋯
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-700/50 px-2 py-2 grid grid-cols-2 gap-2">
          <input
            className="col-span-2 rounded border border-slate-600 bg-slate-800 p-1.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <NumberField label="J" value={J} setValue={setJ} />
          <NumberField label="R" value={R} setValue={setR} />
          <NumberField label="N" value={N} setValue={setN} />
          <div className="col-span-2 flex items-center gap-2 justify-end">
            <button
              className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              onClick={save}
            >
              Save
            </button>
            <button
              className="text-xs px-2 py-1 rounded border border-rose-700 text-rose-200 hover:bg-rose-900/30"
              onClick={onRemove}
            >
              Remove
            </button>
            <button
              className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              onClick={onDormant}
            >
              Dormant
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function DormantRow({
  item,
  onRestore,
  onRemove,
  onSave,
}: {
  item: { id: string; name: string; J?: number; R?: number; N?: number; durationMin?: number };
  onRestore: () => void;
  onRemove: () => void;
  onSave: (patch: { name?: string; J?: number; R?: number; N?: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [J, setJ] = useState(item.J ?? 3);
  const [R, setR] = useState(item.R ?? 3);
  const [N, setN] = useState(item.N ?? 3);

  const save = () => {
    onSave({ name: name.trim() || item.name, J, R, N });
    setOpen(false);
  };

  return (
    <li className="rounded border border-slate-700/50 bg-slate-900/10">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="font-medium">{item.name}</div>
        <button
          className="px-2 py-1 text-slate-300 hover:bg-slate-800 rounded"
          onClick={() => setOpen((v) => !v)}
          aria-label="Edit"
          title="Edit / Restore"
        >
          ⋯
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-700/50 px-2 py-2 grid grid-cols-2 gap-2">
          <input
            className="col-span-2 rounded border border-slate-600 bg-slate-800 p-1.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <NumberField label="J" value={J} setValue={setJ} />
          <NumberField label="R" value={R} setValue={setR} />
          <NumberField label="N" value={N} setValue={setN} />
          <div className="col-span-2 flex items-center gap-2 justify-end">
            <button
              className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              onClick={save}
            >
              Save
            </button>
            <button
              className="text-xs px-2 py-1 rounded border border-slate-600 hover:bg-slate-800"
              onClick={onRestore}
            >
              Return to Queue
            </button>
            <button
              className="text-xs px-2 py-1 rounded border border-rose-700 text-rose-200 hover:bg-rose-900/30"
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function NumberField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        type="number"
        min={1}
        max={5}
        step={1}
        className="rounded border border-slate-600 bg-slate-800 p-2 text-sm w-20"
        value={value}
        onChange={(e) => setValue(Math.max(1, Math.min(5, +e.target.value || 1)))}
      />
    </div>
  );
}
