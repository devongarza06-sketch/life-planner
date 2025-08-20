"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useStore } from "@/state/useStore";
import type { PlannerAction } from "@/domain/types";

/**
 * Overlap-safe planner:
 * - Any floating action (start == null) is auto-assigned the first free slot on its day.
 * - Fixed-time items remain locked.
 * - Dragging a floating item jumps to the nearest non-overlapping slot.
 * - Column/weekday mapping & scrolling retained.
 */

// ---------- tuning ----------
const DAY_START_HOUR = 5;
const DAY_END_HOUR   = 23;
const PX_PER_HOUR    = 60;
const VIEWPORT_H     = 720;
const LOCK_PAST_DAYS = false;
// ----------------------------

const pad2 = (n: number) => String(n).padStart(2, "0");
const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  return (isFinite(h) ? h : 0) * 60 + (isFinite(m) ? m : 0);
};
const minToTime = (mTotal: number) => {
  const m = ((mTotal % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)}`;
};

function getWeekDays(startOfWeek: number): Date[] {
  const now = new Date();
  const todayDow = now.getDay();
  const diff = ((todayDow - startOfWeek) + 7) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return new Array(7).fill(0).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function PlannerWeek() {
  const {
    plannerActions,
    updatePlannerAction,
    prefs,
    settings,
    findNextFreeSlot, // store helper
  } = useStore();

  const snap = settings.snapMinutes || 15; // 15/30 etc.
  const startOfWeek = prefs.startOfWeek ?? 0;

  const days = useMemo(() => getWeekDays(startOfWeek), [startOfWeek]);

  // bucket by weekday (0..6)
  const actionsByDow = useMemo(() => {
    const map: Record<number, PlannerAction[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const a of plannerActions) (map[a.day] ||= []).push(a);
    (Object.keys(map) as unknown as number[]).forEach((d) => {
      map[d].sort((A, B) => {
        const aFixed = !!A.fixed;
        const bFixed = !!B.fixed;
        if (aFixed && bFixed) {
          const as = A.start ? timeToMin(A.start) : 0;
          const bs = B.start ? timeToMin(B.start) : 0;
          return as - bs;
        }
        if (aFixed !== bFixed) return aFixed ? -1 : 1;
        return A.label.localeCompare(B.label);
      });
    });
    return map;
  }, [plannerActions]);

  // ---------- NEW: normalization for floating items with no start ----------
  useEffect(() => {
    // For each weekday, assign first-free slot to any items with start === null
    // This runs whenever plannerActions changes. It only sets start for items that lack it,
    // so moved items (with a start) remain unchanged.
    const normalize = async () => {
      for (let dow = 0; dow < 7; dow++) {
        const items = (actionsByDow[dow] || [])
          .filter(a => !a.fixed)                       // floating only
          .sort((a, b) => a.id.localeCompare(b.id));   // stable order

        for (const a of items) {
          if (a.start != null) continue; // already placed, preserve
          const dur = Math.max(1, Math.min(59, a.durationMin));
          const hhmm = findNextFreeSlot(dow as 0|1|2|3|4|5|6, "05:00", dur, "down", snap, a.id);
          updatePlannerAction(a.id, { start: hhmm, fixed: false });
        }
      }
    };
    normalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsByDow, findNextFreeSlot, snap, updatePlannerAction]);
  // ------------------------------------------------------------------------

  // past day lock (toggleable)
  const todayMidnight = (() => {
    const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
  })();
  const isPastDay = (colIdx: number) => {
    if (!LOCK_PAST_DAYS) return false;
    const d = days[colIdx]; const t = new Date(d);
    t.setHours(0,0,0,0); return t.getTime() < todayMidnight;
  };

  // metrics
  const totalHours = DAY_END_HOUR - DAY_START_HOUR;
  const pxPerMin = PX_PER_HOUR / 60;

  // drag state
  const [drag, setDrag] = useState<{
    id: string;
    colIdx: number;
    startAtDragMin: number;
    offsetY: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, action: PlannerAction, colIdx: number) => {
      if (action.fixed) return;
      if (isPastDay(colIdx)) return;

      const target = e.currentTarget as HTMLDivElement;
      const column = target.parentElement as HTMLDivElement;
      const colRect = column.getBoundingClientRect();
      const itemRect = target.getBoundingClientRect();
      const yWithin = itemRect.top - colRect.top;

      const fromMin =
        action.start != null
          ? timeToMin(action.start)
          : Math.round((yWithin / pxPerMin + DAY_START_HOUR * 60) / snap) * snap;

      setDrag({
        id: action.id,
        colIdx,
        startAtDragMin: fromMin,
        offsetY: 0,
      });

      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    },
    [pxPerMin, snap]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      setDrag((prev) => (prev ? { ...prev, offsetY: prev.offsetY + e.movementY } : prev));
      e.preventDefault();
    },
    [drag]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      const movedMin = Math.round((drag.offsetY / pxPerMin) / snap) * snap;
      const desired = Math.min(
        DAY_END_HOUR * 60 - snap,
        Math.max(DAY_START_HOUR * 60, drag.startAtDragMin + movedMin)
      );
      const direction = movedMin >= 0 ? "down" : "up";
      const day = ((startOfWeek + drag.colIdx) % 7) as 0|1|2|3|4|5|6;

      // Use the action's real duration when finding next free slot
      const action = plannerActions.find(p => p.id === drag.id);
      const dur = Math.max(1, Math.min(59, action?.durationMin || 30));

      const nextHHMM = findNextFreeSlot(day, minToTime(desired), dur, direction, snap, drag.id);
      updatePlannerAction(drag.id, { start: nextHHMM, fixed: false });

      setDrag(null);
      e.preventDefault();
    },
    [drag, pxPerMin, snap, updatePlannerAction, startOfWeek, findNextFreeSlot, plannerActions]
  );

  // ticks
  const ticks = useMemo(() => {
    const out: { time: string; top: number }[] = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
      out.push({ time: `${pad2(h)}:00`, top: (h - DAY_START_HOUR) * PX_PER_HOUR });
    }
    return out;
  }, []);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Weekly Planner</div>
        <div className="text-xs text-slate-400">Snap: {settings.snapMinutes} min</div>
      </div>

      <div className="grid grid-cols-8 gap-2 text-xs mb-2">
        <div className="text-right pr-2 text-slate-400">Time</div>
        {days.map((d, i) => (
          <div key={i} className="text-center font-medium">
            {d.toLocaleDateString(undefined, { weekday: "short" })}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-8 gap-2 overflow-y-auto"
        style={{ height: `${VIEWPORT_H}px` }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* time ruler */}
        <div className="relative">
          <div className="relative" style={{ height: totalHours * PX_PER_HOUR }}>
            {ticks.map((t) => (
              <div
                key={t.time}
                className="absolute -top-2 right-2 text-[10px] text-slate-400 select-none"
                style={{ top: t.top }}
              >
                {t.time}
              </div>
            ))}
          </div>
        </div>

        {/* day columns */}
        {days.map((_, colIdx) => {
          const displayDow = (startOfWeek + colIdx) % 7;
          const items = actionsByDow[displayDow] || [];
          const lockedDay = isPastDay(colIdx);

          return (
            <div key={colIdx} className="relative border-l border-slate-600/40">
              {/* hour lines */}
              <div className="absolute left-0 right-0" style={{ height: totalHours * PX_PER_HOUR }}>
                {ticks.map((t) => (
                  <div
                    key={t.time}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-600/40"
                    style={{ top: t.top }}
                  />
                ))}
              </div>

              {/* items */}
              {items.map((a) => {
                const durMin = Math.max(1, Math.min(59, a.durationMin));
                const startMin = a.start ? timeToMin(a.start) : DAY_START_HOUR * 60;
                const topMin = startMin - DAY_START_HOUR * 60;
                const topPx =
                  (drag && drag.id === a.id)
                    ? (topMin * (PX_PER_HOUR/60) + drag.offsetY)
                    : (topMin * (PX_PER_HOUR/60));

                const heightPx = Math.max(PX_PER_HOUR * (durMin / 60), 18);
                const fixed = !!a.fixed || lockedDay;

                return (
                  <div
                    key={a.id}
                    className={`absolute left-1 right-1 rounded-md px-2 py-1 text-xs shadow
                      ${fixed
                        ? "bg-slate-600/80 text-white cursor-not-allowed"
                        : "bg-indigo-600/90 text-white cursor-grab active:cursor-grabbing"}
                    `}
                    style={{ top: Math.max(0, topPx), height: heightPx }}
                    onPointerDown={(e) => onPointerDown(e, a, colIdx)}
                    title={
                      fixed
                        ? `${a.label} • ${a.start ?? "—"} • ${durMin}m${lockedDay ? " (locked – past day)" : " (fixed)"}`
                        : `${a.label} • ${a.start ?? "(time: drag to set)"} • ${durMin}m`
                    }
                  >
                    <div className="font-semibold truncate">{a.label}</div>
                    <div className="opacity-80">
                      {(a.start ?? "(time: drag to set)")} • {durMin}m
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
