# AWI Lead Generation KPI Dashboard

A lightweight, read-only KPI dashboard for tracking lead generation and sales performance. Built to answer "how are we doing?" in under two minutes.

This is a front-end prototype for the PRD. It runs on realistic **mock data** by default so the full experience (filters, funnel, charts, tables, notes) can be reviewed — but it can also read live data directly from a Google Sheet with no backend, see below.

> ⚠️ **Data accuracy is the top priority before this goes into real use.** The dashboard shows a persistent "sample data" banner until a real sheet is connected (see "Connecting to Google Sheets" below).

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
  components/            Dashboard sections (Executive Summary, Funnel, Pipeline, etc.)
  components/ui/         Shared UI primitives (Card, SectionHeader)
  data/mockData.ts       Deterministic mock leads, campaigns, and weekly reviews (fallback)
  hooks/useDashboardData.ts  Decides live sheet vs. mock data, exposes loading/error state
  lib/sheetSource.ts     Fetches the Google Sheet's CSV export feed (no backend/API key)
  lib/sheetMapping.ts    Maps raw sheet rows into Lead/Campaign/WeeklyReview objects
  lib/csv.ts             Tiny CSV parser
  lib/analytics.ts       All KPI/funnel/pipeline/chart/revenue aggregation logic
  lib/dateRange.ts       Date preset + custom range helpers
  types.ts               Shared TypeScript types
sheet-templates/          CSV templates for the three sheet tabs (Leads, Campaigns, Weekly Reviews)
```

## Connecting to Google Sheets

The dashboard reads the sheet directly from the browser using its public CSV export feed — no API key, no backend, and it's read-only (the app never writes to the sheet). It automatically falls back to sample data if no sheet is configured, or if the live fetch fails.

**We deliberately did not touch or repurpose your existing lead-research sheet** (the raw prospecting list) — it has a different, per-niche column layout that doesn't map cleanly to KPI tracking. Instead, create a **new** sheet dedicated to KPI tracking, structured as below.

### 1. Create the new sheet

Create a new Google Sheet with up to three tabs. You can start from the CSV templates in [`sheet-templates/`](./sheet-templates) — open each file, copy its contents, and paste into the matching tab (Google Sheets will auto-split it into columns), or use **File → Import** in Sheets.

- **Leads** (required) — one row per lead/opportunity. Columns: `Company, Industry, Sub Industry, Studio Type, Website, City, Country, Email, Mobile App Status, Booking Platform Used, Business Pain, Recommended Solution, Campaign, Date Added, Email Sent Date, Follow Up Date, Response Date, Meeting Date, Proposal Date, Won Date, Lost Date, Stage, Deal Value`.
  - `Industry` is normalized to a **finite** top-level category so reporting stays consistent: `Fitness & Wellness, Healthcare, Hospitality, Real Estate, E-commerce & Retail, Professional Services, Education, Technology / SaaS, Manufacturing, Other` (see `INDUSTRY_CATEGORIES` in `src/types.ts`). If you type something else (e.g. "Pilates"), the dashboard automatically buckets it into the closest category (e.g. "Fitness & Wellness") using keyword matching in `src/lib/sheetMapping.ts`, and keeps your original text as `Sub Industry` for detail.
  - `Sub Industry` is free text for the specific niche (e.g. "Pilates studio", "Personal training studio") — shown in the Lead Directory table but not used for grouping/reporting.
  - `Studio Type, Website, City, Country, Email, Mobile App Status, Booking Platform Used, Business Pain, Recommended Solution` are optional prospecting/context columns, all shown in the new **Lead Directory** table but not used in KPI math.
  - `Stage` should be one of `New Lead / Contacted / Responded / Meeting Scheduled / Proposal Sent / Won / Lost`. If left blank or unrecognized, the dashboard infers it from whichever date columns are filled in.
  - `Deal Value` is the contract/estimated value in USD once a proposal is sent — it drives the Revenue KPIs.
- **Campaigns** (optional) — columns: `ID, Name, Industry, AI Workflow, Lessons Learned`.
- **Weekly Reviews** (optional) — columns: `Week, Wins, Bottlenecks, Improvement Actions`.

Column names are matched case-insensitively and tolerate common variants (e.g. "Company Name" also works), so an exact match isn't required.

### 2. Share it

Click **Share → General access → Anyone with the link → Viewer**. This only allows read access to whoever has the link — nobody can edit it, and it isn't indexed/searchable.

### 3. Get the sheet ID and tab gids

- The **sheet ID** is the long string in the URL: `https://docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`.
- The **gid** of each tab appears in the URL after clicking that tab, e.g. `...#gid=123456789`. The first tab is usually `gid=0`.

### 4. Configure the app

Copy `.env.example` to `.env.local` and fill in the values:

```bash
VITE_SHEET_ID=<your sheet id>
VITE_LEADS_GID=<gid of the Leads tab>
VITE_CAMPAIGNS_GID=<gid of the Campaigns tab>
VITE_WEEKLY_REVIEWS_GID=<gid of the Weekly Reviews tab>
```

Restart `npm run dev`. The sample-data banner disappears once leads load successfully; if the fetch fails (e.g. sharing not set correctly), an error banner explains why and the dashboard keeps showing sample data as a safe fallback.

## Recent additions

- **Live Google Sheet integration** — `src/hooks/useDashboardData.ts` + `src/lib/sheetSource.ts` fetch and map real sheet data client-side; see "Connecting to Google Sheets" above.
- **Funnel Conversion** (`src/components/FunnelConversion.tsx`) — stage-to-stage conversion rate across Leads → Emails → Responses → Meetings → Proposals → Clients, so drop-off points are easy to spot at a glance.
- **Revenue KPIs** (`src/components/RevenueKpis.tsx`) — Pipeline Value, Revenue Won, Deals Won, and Win Rate, computed from each lead's `dealValue`.
- **Last Updated badge** — shown in the header and footer, reflecting when the sheet was last fetched.
- **Sample data / error banners** — visible warnings whenever the dashboard isn't showing live, successfully-loaded sheet data.

## Design notes

- Typeface: Inter Variable for clean, highly readable UI text.
- Minimal off-white canvas with white cards, subtle borders/shadows, and a single indigo accent color.
- All interactive elements use smooth, consistent transitions (180ms ease) plus a subtle rise-in animation on section mount.
- Single date filter with **Today / This Week / This Month** presets and a **custom range** popover calendar — every section reacts to it.
