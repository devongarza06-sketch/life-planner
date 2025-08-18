"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/state/useStore";
import { TabId, Vision } from "@/domain/types";
import Modal from "@/components/Modal";

type Props = {
  tab: TabId;
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

export default function VisionBoxes({ tab }: Props) {
  const { selected, visions } = useStore();
  const directionId = selected[tab] ?? null;

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

      {/* Editor Modal (per side), force readable text */}
      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={
          open === "legacy"
            ? `Edit Legacy Vision — ${vision.label}`
            : open === "personal"
            ? `Edit Personal Vision — ${vision.label}`
            : "Edit"
        }
        actions={
          <>
            <button
              onClick={() => setOpen(null)}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </>
        }
      >
        {open === "legacy" && (
          <div className="grid gap-3 text-slate-800">
            <div>
              <div className="text-xs text-slate-600 mb-1">Legacy Vision</div>
              <textarea
                value={legacyText}
                onChange={(e) => setLegacyText(e.target.value)}
                className="w-full min-h-[100px] rounded border p-2 text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="How others will see me and what I’ll be recognized for…"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Legacy Values</div>
              <div className="flex flex-wrap gap-2">
                {VALUES_LIST.map((v) => {
                  const on = legacyValues.includes(v);
                  return (
                    <button
                      type="button"
                      key={`lv-opt-${v}`}
                      onClick={() => toggleValue("legacy", v)}
                      className={`px-2 py-0.5 text-xs rounded-full border ${
                        on
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-800"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {open === "personal" && (
          <div className="grid gap-3 text-slate-800">
            <div>
              <div className="text-xs text-slate-600 mb-1">Personal Vision</div>
              <textarea
                value={personalText}
                onChange={(e) => setPersonalText(e.target.value)}
                className="w-full min-h-[100px] rounded border p-2 text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="What this means for me; the impact I want to have…"
              />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Personal Values</div>
              <div className="flex flex-wrap gap-2">
                {VALUES_LIST.map((v) => {
                  const on = personalValues.includes(v);
                  return (
                    <button
                      type="button"
                      key={`pv-opt-${v}`}
                      onClick={() => toggleValue("personal", v)}
                      className={`px-2 py-0.5 text-xs rounded-full border ${
                        on
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-800"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
