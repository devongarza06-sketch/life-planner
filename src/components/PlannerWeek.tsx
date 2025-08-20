"use client";
import React, { useMemo, useState, useCallback } from "react";
import { useStore } from "@/state/useStore";
import type { PlannerAction } from "@/domain/types";

/**
 * Google Calendar–style week view (scrollable & zoomed)
 * - Floating actions (fixed === false) can be dragged vertically any number of times
 * - Fixed actions (fixed === true) are not draggable
 * - Optional lock for past days (configurable below)
 *
 * FIXES kept from previous patch:
 * - Correct column→weekday mapping when startOfWeek !== 0
 * - Past-day lock uses numeric timestamps (not string compare)
 */

// --------- tune these if desired ----------
const DAY_START_HOUR = 5;    // grid top (inclusive)
const DAY_END_HOUR   = 23;   // grid bottom (exclusive)
const PX_PER_HOUR    = 60;   // zoom level (px per hour)
const VIEWPORT_H     = 720;  // grid viewport height (px), scrollable

// NEW: toggle whether past days are locked (default OFF so you can drag any day)
const LOCK_PAST_DAYS = false;
// ------------------------------------------

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
  const todayDow = now.getDay(); // 0..6 (Sun..Sat)
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
  } = useStore();

  const snap = settings.snapMinutes; // 15/30 etc.
  const startOfWeek = prefs.startOfWeek ?? 0;

  const days = useMemo(() => getWeekDays(startOfWeek), [startOfWeek]);

  // Bucket by real weekday (0=Sun..6=Sat) taken from action.day
  const actionsByDow = useMemo(() => {
    const map: Record<number, PlannerAction[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const a of plannerActions) {
      const d = a.day as 0|1|2|3|4|5|6;
      (map[d] ||= []).push(a);
    }
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

  // Past day lock (toggle-able)
  const todayMidnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const isPastDay = (colIdx: number) => {
    if (!LOCK_PAST_DAYS) return false;
    const d = days[colIdx];
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    return t.getTime() < todayMidnight;
  };

  // grid metrics
  const totalHours = DAY_END_HOUR - DAY_START_HOUR;
  const pxPerMin = PX_PER_HOUR / 60;

  // dragging state (for a single item)
  const [drag, setDrag] = useState<{
    id: string;
    colIdx: number;          // visible column index (0..6)
    startAtDragMin: number;  // item's starting minutes when drag began
    offsetY: number;         // px offset since drag start
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, action: PlannerAction, colIdx: number) => {
      // fixed items are not draggable; past days locked (if enabled)
      if (action.fixed) return;
      if (isPastDay(colIdx)) return;

      const target = e.currentTarget as HTMLDivElement;
      const column = target.parentElement as HTMLDivElement; // day column
      const colRect = column.getBoundingClientRect();
      const itemRect = target.getBoundingClientRect();
      const yWithin = itemRect.top - colRect.top; // px from column top to item top

      // if item has a start -> use it; else derive from its y position
      const fromMin = (action.start != null)
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
      const nextMinClamped = Math.min(
        DAY_END_HOUR * 60 - snap,
        Math.max(DAY_START_HOUR * 60, drag.startAtDragMin + movedMin)
      );
      // keep floating (fixed=false) so it stays draggable later
      updatePlannerAction(drag.id, { start: minToTime(nextMinClamped), fixed: false });
      setDrag(null);
      e.preventDefault();
    },
    [drag, pxPerMin, snap, updatePlannerAction]
  );

  // hour ticks
  const ticks: { time: string; top: number }[] = useMemo(() => {
    const out: { time: string; top: number }[] = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
      const top = (h - DAY_START_HOUR) * PX_PER_HOUR;
      out.push({ time: `${pad2(h)}:00`, top });
    }
    return out;
  }, []);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Weekly Planner</div>
        <div className="text-xs text-slate-400">Snap: {settings.snapMinutes} min</div>
      </div>

      {/* header row */}
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
          // Map visible column to actual weekday (0=Sun..6=Sat)
          const displayDow = (startOfWeek + colIdx) % 7;
          const items = actionsByDow[displayDow] || [];
          const lockedDay = isPastDay(colIdx);

          return (
            <div key={colIdx} className="relative border-l border-slate-600/40">
              {/* background hour lines */}
              <div className="absolute left-0 right-0" style={{ height: totalHours * PX_PER_HOUR }}>
                {ticks.map((t) => (
                  <div
                    key={t.time}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-600/40"
                    style={{ top: t.top }}
                  />
                ))}
              </div>

              {/* actions */}
              {items.map((a) => {
                const durMin = Math.max(1, Math.min(59, a.durationMin));
                const startMin = a.start ? timeToMin(a.start) : DAY_START_HOUR * 60;
                const topMin = startMin - DAY_START_HOUR * 60;
                const topPx =
                  (drag && drag.id === a.id)
                    ? (topMin * pxPerMin + drag.offsetY)
                    : (topMin * pxPerMin);

                const heightPx = Math.max(PX_PER_HOUR * (durMin / 60), 18);
                // Only fixed items lock; past-day lock applies if enabled
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
