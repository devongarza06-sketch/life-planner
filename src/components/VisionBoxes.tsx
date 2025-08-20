"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/state/useStore";
import { TabId, Vision } from "@/domain/types";
import Modal from "@/components/Modal";

type Props = {
  tab: TabId;
  /** Optional: scope to a Person section (e.g., 'physical'). */
  sectionKey?: string;
};

const VALUES_LIST = [
  "Integrity",
  "Growth",
  "Service",
  "Creativity",
  "Adventure",
  "Curiosity",
  "Discipline",
  "Compassion",
  "Excellence",
];

export default function VisionBoxes({ tab, sectionKey }: Props) {
  const { selected, selectedPerson, visions } = useStore();

  const directionId =
    tab === "person" && sectionKey
      ? selectedPerson[sectionKey] ?? null
      : selected[tab] ?? null;

  const vision: Vision | undefined = useMemo(
    () => visions.find((v) => v.id === directionId),
    [visions, directionId]
  );

  const [open, setOpen] = useState<null | "legacy" | "personal">(null);
  const [legacyText, setLegacyText] = useState("");
  const [personalText, setPersonalText] = useState("");
  const [legacyValues, setLegacyValues] = useState<string[]>([]);
  const [personalValues, setPersonalValues] = useState<string[]>([]);

  const startEdit = (side: "legacy" | "personal") => {
    if (!vision) return;
    setLegacyText(vision.legacyText ?? "");
    setPersonalText(vision.personalText ?? "");
    setLegacyValues([...(vision.legacyValues ?? [])]);
    setPersonalValues([...(vision.personalValues ?? [])]);
    setOpen(side);
  };

  const toggleValue = (bucket: "legacy" | "personal", v: string) => {
    if (bucket === "legacy") {
      setLegacyValues((prev) =>
        prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
      );
    } else {
      // FIX: .prev -> ...prev
      setPersonalValues((prev) =>
        prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
      );
    }
  };

  const save = () => {
    if (!vision || !open) return setOpen(null);
    if (open === "legacy") {
      useStore.getState().updateVision(vision.id, { legacyText, legacyValues });
    } else {
      useStore.getState().updateVision(vision.id, {
        personalText,
        personalValues,
      });
    }
    setOpen(null);
  };

  const cardCls =
    "rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-100 shadow-inner";

  if (!vision) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`${cardCls} p-4`}>
          <div className="font-medium mb-1">Legacy Vision</div>
          <div className="text-sm text-slate-400">
            Select or create a direction to edit.
          </div>
        </div>
        <div className={`${cardCls} p-4`}>
          <div className="font-medium mb-1">Personal Vision</div>
          <div className="text-sm text-slate-400">
            Select or create a direction to edit.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`${cardCls} p-4`}>
          <div className="flex items-center justify-between">
            <div className="font-medium">Legacy Vision (Seen by Others)</div>
            <button
              onClick={() => startEdit("legacy")}
              className="px-2 py-1 rounded border border-slate-500 text-slate-200 text-xs hover:bg-slate-700/60"
            >
              Edit
            </button>
          </div>
          <div className="text-sm mt-1 min-h-[1.25rem]">
            {vision.legacyText || "—"}
          </div>
          <div className="text-xs text-slate-400 mt-2">Values</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {(vision.legacyValues ?? []).map((v) => (
              <span
                key={`lv-${v}`}
                className="px-2 py-0.5 text-xs rounded-full border border-slate-600 bg-slate-900/40"
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className={`${cardCls} p-4`}>
          <div className="flex items-center justify-between">
            <div className="font-medium">Personal Vision (For Me)</div>
            <button
              onClick={() => startEdit("personal")}
              className="px-2 py-1 rounded border border-slate-500 text-slate-200 text-xs hover:bg-slate-700/60"
            >
              Edit
            </button>
          </div>
          <div className="text-sm mt-1 min-h-[1.25rem]">
            {vision.personalText || "—"}
          </div>
          <div className="text-xs text-slate-400 mt-2">Values</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {(vision.personalValues ?? []).map((v) => (
              <span
                key={`pv-${v}`}
                className="px-2 py-0.5 text-xs rounded-full border border-slate-600 bg-slate-900/40"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open === "legacy" ? "Edit Legacy Vision" : "Edit Personal Vision"}
      >
        <div className="space-y-3">
          {open === "legacy" ? (
            <>
              <textarea
                className="w-full rounded border border-slate-600 bg-slate-800 p-2"
                rows={3}
                placeholder="Who I’m known as / actions others see me do…"
                value={legacyText}
                onChange={(e) => setLegacyText(e.target.value)}
              />
              <div className="text-sm">Values</div>
              <div className="flex flex-wrap gap-2">
                {VALUES_LIST.map((v) => (
                  <button
                    key={`lv-opt-${v}`}
                    onClick={() => toggleValue("legacy", v)}
                    className={`px-2 py-0.5 rounded-full border text-xs ${
                      legacyValues.includes(v)
                        ? "border-indigo-400 bg-indigo-500/20"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <textarea
                className="w-full rounded border border-slate-600 bg-slate-800 p-2"
                rows={3}
                placeholder="Why it matters to me / impact I want…"
                value={personalText}
                onChange={(e) => setPersonalText(e.target.value)}
              />
              <div className="text-sm">Values</div>
              <div className="flex flex-wrap gap-2">
                {VALUES_LIST.map((v) => (
                  <button
                    key={`pv-opt-${v}`}
                    onClick={() => toggleValue("personal", v)}
                    className={`px-2 py-0.5 rounded-full border text-xs ${
                      personalValues.includes(v)
                        ? "border-indigo-400 bg-indigo-500/20"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              className="px-3 py-1 rounded border border-slate-600"
              onClick={() => setOpen(null)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 rounded bg-indigo-600 text-white"
              onClick={save}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
