"use client";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useStore } from "@/state/useStore";
import { useEffect } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

/**
 * Weekly calendar component allowing drag-and-drop of tasks.
 */
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales
});
const DnDCalendar = withDragAndDrop(Calendar);

export default function PlannerWeek() {
  const { tasks, updateTask, settings, init } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.start),
    end: new Date(task.end),
    resource: task
  }));

  const onEventDrop = ({ event, start, end }: any) => {
    const updated = { ...event.resource, start: start.toISOString(), end: end.toISOString() };
    updateTask(updated);
  };

  const onEventResize = ({ event, start, end }: any) => {
    const updated = { ...event.resource, start: start.toISOString(), end: end.toISOString() };
    updateTask(updated);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Weekly Planner</h2>
      <DnDCalendar
        localizer={localizer}
        events={events}
        defaultView="week"
        style={{ height: 460 }}
        step={settings?.snapMinutes || 15}
        timeslots={4}
        draggableAccessor={() => true}
        resizable
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        eventPropGetter={() => ({
          style: {
            backgroundColor: "var(--rbc-accent, #6C63FF)",
            borderRadius: "0.5rem",
            color: "white"
          }
        })}
      />
    </div>
  );
}
