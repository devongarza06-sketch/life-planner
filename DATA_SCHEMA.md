# Data Schema

## Overview

The application is local‑first.  All data is stored in IndexedDB via Dexie and mirrored into a Zustand store.  Each entity has an `id` (string, UUID) and is scoped by `tabId` (e.g. `"passion"`, `"person-physical"`, `"play"`, `"misc-finance"`).

## Entities

### UserPrefs
```ts
interface UserPrefs {
  theme: 'light' | 'dark';
  startOfWeek: number;      // 0 = Sunday … 6 = Saturday
  plannerGridMinutes: number; // snap interval in minutes
}
