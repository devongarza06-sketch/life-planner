"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/state/useStore";
import { TabId, Vision } from "@/domain/types";
import ConfirmDialog from "./ConfirmDialog";
import { Minus, Plus } from "lucide-react";

type Props = {
  tab: TabId;
  /** Optional: scope to a Person section (e.g., 'physical', 'cognitive', ...) */
  sectionKey?: string;
};

export default function NorthStarBar({ tab, sectionKey }: Props) {
  const {
    visibleVisionsForTab,
    selected,
    selectedPerson,
    selectDirection,
    addDirection,
  } = useStore();

  const visions = visibleVisionsForTab(tab, sectionKey);
  const selectedId =
    tab === "person" && sectionKey
      ? selectedPerson[sectionKey] ?? null
      : selected[tab] ?? null;

  // --- ensure one is always selected for the given scope ---
  useEffect(() => {
    if (!visions || visions.length === 0) return;
    const hasSelected = selectedId && visions.some((v) => v.id === selectedId);
    if (!hasSelected) {
      selectDirection(tab, visions[0].id, sectionKey);
    }
  }, [tab, visions, selectedId, selectDirection, sectionKey]);

  const [confirm, setConfirm] = useState<{ open: boolean; target?: Vision }>({
    open: false,
  });

  const onAdd = () => {
    const name = prompt("Name of the new direction (e.g., Become a Writer):");
    const label = (name ?? "").trim() || "New direction";
    addDirection(tab, label, sectionKey);
  };

  const onAskRemove = (vision: Vision) => {
    setConfirm({ open: true, target: vision });
  };

  const onConfirmRemove = () => {
    const v = confirm.target;
    if (!v) return setConfirm({ open: false });
    useStore.getState().removeDirection(tab, v.id);
    setConfirm({ open: false });
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {visions.map((v) => {
        const isSel = selectedId === v.id;
        return (
          <button
            key={v.id}
            onClick={() => selectDirection(tab, v.id, sectionKey)}
            className={`relative rounded-full px-3 py-1 text-sm border transition
              ${
                isSel
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-slate-800/50 text-slate-100 border-slate-600 hover:bg-slate-700/60"
              }`}
            title={v.label}
          >
            {v.label}
            <span
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onAskRemove(v);
              }}
              className={`absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 rounded-full
                ${isSel ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-800"}
                border border-slate-300 shadow`}
            >
              <Minus className="w-3 h-3" />
            </span>
          </button>
        );
      })}

      <button
        onClick={onAdd}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-600 text-slate-100 bg-slate-800/50 hover:bg-slate-700/60"
        title="Add direction"
      >
        <Plus className="w-4 h-4" />
      </button>

      <ConfirmDialog
        open={confirm.open}
        title="Delete direction?"
        message={`Are you sure you want to delete “${confirm.target?.label ?? ""}”?`}
        onCancel={() => setConfirm({ open: false })}
        onConfirm={onConfirmRemove}
      />
    </div>
  );
}
