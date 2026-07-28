# AWI Lead Generation KPI Dashboard

A lightweight, read-only KPI dashboard for tracking lead generation and sales performance. Built to answer "how are we doing?" in under two minutes.

This is a front-end prototype for the PRD. It currently runs on realistic **mock data** generated in `src/data/mockData.ts` so the full experience (filters, funnel, charts, tables, notes) can be reviewed before wiring it up to the live Google Sheet.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Recharts (charts)
- react-day-picker (custom date range picker)

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

## Project structure

```
src/
  components/        Dashboard sections (Executive Summary, Funnel, Pipeline, etc.)
  components/ui/      Shared UI primitives (Card, SectionHeader)
  data/mockData.ts    Deterministic mock leads, campaigns, and weekly reviews
  lib/analytics.ts    All KPI/funnel/pipeline/chart aggregation logic
  lib/dateRange.ts    Date preset + custom range helpers
  types.ts            Shared TypeScript types
```

## Connecting to Google Sheets later

All aggregation logic lives in `src/lib/analytics.ts` and expects a flat array of `Lead` objects (see `src/types.ts`). To go live:

1. Publish the Lead Database sheet or use the Google Sheets API (with a service account) to fetch rows.
2. Map each sheet row into a `Lead` object.
3. Replace the `LEADS` / `CAMPAIGNS` / `WEEKLY_REVIEWS` imports from `src/data/mockData.ts` with data fetched from the sheet (e.g. via a small fetch hook or a serverless function that proxies the Sheets API).

No other component code needs to change — the dashboard only depends on the shapes defined in `types.ts`.

## Design notes

- Typeface: Inter Variable for clean, highly readable UI text.
- Minimal off-white canvas with white cards, subtle borders/shadows, and a single indigo accent color.
- All interactive elements use smooth, consistent transitions (180ms ease) plus a subtle rise-in animation on section mount.
- Single date filter with **Today / This Week / This Month** presets and a **custom range** popover calendar — every section reacts to it.
