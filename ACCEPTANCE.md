# Acceptance Checklist

This document maps the original simulation’s UI/UX elements to the implemented components.  Each item is marked ✅ if implemented or 🔧 if partially implemented.

## Global

| Feature                                                      | Implementation                                         | Status |
| ------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| Four bucket tabs (Passion, Person, Play, Misc)              | `TabbedWorkspace` renders clickable tabs              | ✅    |
| Time budget sliders for each bucket                          | `BudgetScales` component with four range inputs       | ✅    |
| Weekly planner with drag‑and‑drop                            | `PlannerWeek` wraps `react‑big‑calendar` and handles drag | ✅    |
| Autosave to IndexedDB                                        | Dexie database + Zustand persist actions              | ✅    |
| JSON export/import                                           | Settings page with textarea and import button         | ✅    |

## Passion tab

| Feature                                                      | Implementation                                         | Status |
| ------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| Horizontal list of North Star options                       | top of `PassionTab`                                   | ✅    |
| Vision board: legacy & personal statements                  | `VisionBoxes` component                               | ✅    |
| Goal tree extending to 1–3‑month goals                      | `GoalTree` renders hierarchical list                  | 🔧 partial (static data) |
| AID boards for annual themes and 1–3‑month goals            | `AidBoard` displays active/incubating/dormant columns | ✅    |
| SMARTIER detail expands on click                             | Each card can be edited in a side panel/modal         | 🔧 minimal modal placeholder |

## Person tab

| Feature                                                      | Implementation                                         | Status |
| ------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| Five sections: physical, cognitive, emotional, social, meaning | `PersonTab` renders collapsible `PersonSection`       | ✅    |
| Direction/Goal selector per section                          | Horizontal chips within each `PersonSection`           | ✅    |
| UIE (Urgency, Impact, Energy) scoring per card               | `ScoreBadge` shows three‑value badge                   | ✅    |
| AID board with active/incubating/dormant                     | `AidBoard` per section                                | ✅    |

## Play tab

| Feature                                                      | Implementation                                         | Status |
| ------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| Pure Play and Skill Play sections stacked                   | `PlayTab` splits into two panels                      | ✅    |
| JRN scoring for Feature of Week                              | `ScoreBadge` can render JRN fields                    | ✅    |
| Goal tree under Skill Play                                   | `GoalTree` reused                                      | 🔧 partial |
| AID board for Skill Play                                     | `AidBoard`                                             | ✅    |

## Misc tab

| Feature                                                      | Implementation                                         | Status |
| ------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| Dropdown list of misc categories                             | `MiscTab` lists all categories as collapsibles        | ✅    |
| Maintenance vs mini‑projects                                  | Each category shows maintenance tasks and project cards | ✅    |
| R‑O‑B scoring (risk, obligation, batchability)               | `ScoreBadge` displays R, O, B values                  | ✅    |

## Testing

- Playwright tests cover creation/editing of goals, dragging board cards across columns, dragging tasks in the calendar, and JSON export/import.
