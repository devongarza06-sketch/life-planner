"use client";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/state/useStore";
import { BoardCard, BoardStatus } from "@/domain/types";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  useDroppable
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ScoreBadge from "./ScoreBadge";

/** Column IDs used as droppable areas */
type ColumnId = BoardStatus;

/** Sortable card renderer */
function SortableCard({ card, columnId }: { card: BoardCard; columnId: ColumnId }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id as UniqueIdentifier,
    data: { columnId, card }
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-surface-light dark:bg-surface-dark rounded-xl p-2 mb-2 shadow cursor-grab"
      role="listitem"
      aria-label={card.title}
    >
      <div className="font-medium text-sm">{card.title}</div>
      <ScoreBadge scoring={card.scoring} />
    </div>
  );
}

/** Droppable column wrapper so `event.over.data.current.columnId` is defined */
function DroppableColumn({
  id,
  label,
  children,
  count
}: {
  id: ColumnId;
  label: string;
  children: React.ReactNode;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id as UniqueIdentifier,
    data: { columnId: id }
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-2 shadow bg-surface-light dark:bg-surface-dark border ${
        isOver ? "border-accent" : "border-transparent"
      }`}
      role="list"
      aria-labelledby={`col-${id}`}
    >
      <h4 id={`col-${id}`} className="text-sm font-semibold mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-xs opacity-70">{count}</span>
      </h4>
      {children}
    </div>
  );
}

export default function AidBoard({ tabId }: { tabId: string }) {
  const { boards, moveBoardCard } = useStore();

  const columns: { id: ColumnId; label: string }[] = useMemo(
    () => [
      { id: "active", label: "Active" },
      { id: "incubating", label: "Incubating" },
      { id: "dormant", label: "Dormant" }
    ],
    []
  );

  const [items, setItems] = useState<Record<ColumnId, BoardCard[]>>({
    active: [],
    incubating: [],
    dormant: []
  });

  useEffect(() => {
    const filtered = boards.filter((b) => b.tabId === tabId);
    const grouped: Record<ColumnId, BoardCard[]> = { active: [], incubating: [], dormant: [] };
    for (const card of filtered) grouped[card.status].push(card);
    setItems(grouped);
  }, [boards, tabId]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // TS fix #1: guard because `over` can be null
    if (!over) return;

    // TS fix #2: normalize ids to string for comparisons
    const activeId = String(active.id);
    const overId = String(over.id);

    // Determine source & destination columns. We set data on droppable columns,
    // so columnId will be present on both active/over data when relevant.
    const activeCol = (active.data.current?.columnId as ColumnId | undefined) ?? getColumnOfCard(activeId);
    const overCol = (over.data.current?.columnId as ColumnId | undefined) ?? getColumnOfTarget(overId);

    if (!activeCol || !overCol) return;

    if (activeCol === overCol) {
      // Reorder within the same column
      setItems((prev) => {
        const column = prev[activeCol];
        const oldIndex = column.findIndex((c) => c.id === activeId);
        const newIndex = column.findIndex((c) => c.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(column, oldIndex, newIndex);
        return { ...prev, [activeCol]: reordered };
      });
    } else {
      // Move across columns
      setItems((prev) => {
        const source = prev[activeCol];
        const target = prev[overCol];
        const movingIndex = source.findIndex((c) => c.id === activeId);
        if (movingIndex === -1) return prev;
        const moving = source[movingIndex];
        const newSource = source.filter((c) => c.id !== activeId);
        const newTarget = [moving, ...target];
        // Persist new status
        moveBoardCard(moving.id, overCol);
        return { ...prev, [activeCol]: newSource, [overCol]: newTarget };
      });
    }
  };

  /** Helper: find which column currently contains a card id */
  const getColumnOfCard = (cardId: string): ColumnId | undefined => {
    if (items.active.some((c) => c.id === cardId)) return "active";
    if (items.incubating.some((c) => c.id === cardId)) return "incubating";
    if (items.dormant.some((c) => c.id === cardId)) return "dormant";
    return undefined;
  };

  /** Helper: decide column from a droppable/over identifier */
  const getColumnOfTarget = (overId: string): ColumnId | undefined => {
    // If overId is one of the column ids, we know where it is.
    if (overId === "active" || overId === "incubating" || overId === "dormant") return overId;
    // Otherwise, the pointer is over another card; infer by containment:
    return getColumnOfCard(overId);
  };

  return (
    <div className="mt-4">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="grid md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <SortableContext
              key={col.id}
              items={items[col.id].map((c) => c.id as UniqueIdentifier)}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn id={col.id} label={col.label} count={items[col.id].length}>
                {items[col.id].map((card) => (
                  <SortableCard key={card.id} card={card} columnId={col.id} />
                ))}
              </DroppableColumn>
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
