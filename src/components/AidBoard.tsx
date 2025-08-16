"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/state/useStore";
import { BoardCard, BoardStatus } from "@/domain/types";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ScoreBadge from "./ScoreBadge";

/**
 * Helper to read the columnId from a dnd-kit data payload safely.
 */
function getColumnIdFromData(data: any): BoardStatus | undefined {
  const cid = data?.current?.columnId as BoardStatus | undefined;
  if (cid === "active" || cid === "incubating" || cid === "dormant") return cid;
  return undefined;
}

/**
 * A single draggable card.
 */
function SortableCard({ card, columnId }: { card: BoardCard; columnId: BoardStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
    // Save origin column on the draggable item so we can read it in drag end
    data: { columnId, card }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 rounded-xl p-2 mb-2 shadow cursor-grab"
    >
      <div className="font-medium text-sm">{card.title}</div>
      <ScoreBadge scoring={card.scoring} />
    </div>
  );
}

/**
 * Three-column board (Active / Incubating / Dormant) with drag & drop.
 */
export default function AidBoard({ tabId }: { tabId: string }) {
  const { boards, moveBoardCard } = useStore();
  const columns: { id: BoardStatus; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "incubating", label: "Incubating" },
    { id: "dormant", label: "Dormant" }
  ];

  const [items, setItems] = useState<Record<BoardStatus, BoardCard[]>>({
    active: [],
    incubating: [],
    dormant: []
  });

  useEffect(() => {
    const filtered = boards.filter((b) => b.tabId === tabId);
    const grouped: Record<BoardStatus, BoardCard[]> = {
      active: [],
      incubating: [],
      dormant: []
    };
    for (const card of filtered) grouped[card.status].push(card);
    setItems(grouped);
  }, [boards, tabId]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;

    // ✅ Narrow 'over' first; exit early if null
    if (!event.over) return;

    const activeCol = getColumnIdFromData(active.data);
    const overCol = getColumnIdFromData(event.over.data);

    // If we can't determine columns, bail
    if (!activeCol || !overCol) return;

    // Dropped over a card in the same column: reorder
    if (activeCol === overCol) {
      setItems((prev) => {
        const current = prev[activeCol];
        const fromIndex = current.findIndex((c) => c.id === active.id);
        const toIndex = current.findIndex((c) => c.id === event.over!.id);
        if (fromIndex < 0 || toIndex < 0) return prev;
        const nextCol = arrayMove(current, fromIndex, toIndex);
        return { ...prev, [activeCol]: nextCol };
      });
      return;
    }

    // Moved to a different column
    setItems((prev) => {
      const moving = prev[activeCol].find((c) => c.id === active.id);
      if (!moving) return prev;

      const fromList = prev[activeCol].filter((c) => c.id !== active.id);
      const toList = [moving, ...prev[overCol]];

      // Persist status change
      moveBoardCard(moving.id, overCol);

      return {
        ...prev,
        [activeCol]: fromList,
        [overCol]: toList
      };
    });
  };

  return (
    <div className="mt-4">
      <div className="grid md:grid-cols-3 gap-4">
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {columns.map((col) => (
            <div key={col.id} className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow">
              <h4 className="text-sm font-semibold mb-1">{col.label}</h4>
              <SortableContext
                items={items[col.id].map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {items[col.id].map((card) => (
                  <SortableCard key={card.id} card={card} columnId={col.id} />
                ))}
              </SortableContext>
            </div>
          ))}
        </DndContext>
      </div>
    </div>
  );
}
