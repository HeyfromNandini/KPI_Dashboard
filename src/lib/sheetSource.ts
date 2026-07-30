import { parseCSV, rowsToRecords } from './csv';

/**
 * Reads the *new* KPI-tracking Google Sheet directly from the browser using its
 * public CSV export feed — no API key or backend needed, as long as the sheet's
 * sharing is set to "Anyone with the link — Viewer".
 *
 * Configure via `.env.local` (see `.env.example`):
 *   VITE_SHEET_ID           - the long ID from the sheet URL
 *   VITE_LEADS_GID          - gid of the "Leads" tab
 *   VITE_CAMPAIGNS_GID      - gid of the "Campaigns" tab (optional)
 *   VITE_WEEKLY_REVIEWS_GID - gid of the "Weekly Reviews" tab (optional)
 */

const SHEET_ID = import.meta.env.VITE_SHEET_ID as string | undefined;
const LEADS_GID = (import.meta.env.VITE_LEADS_GID as string | undefined) ?? '0';
const CAMPAIGNS_GID = import.meta.env.VITE_CAMPAIGNS_GID as string | undefined;
const WEEKLY_REVIEWS_GID = import.meta.env.VITE_WEEKLY_REVIEWS_GID as string | undefined;

/** True once a real sheet ID has been configured — used to decide mock vs. live data. */
export const IS_SHEET_CONFIGURED = Boolean(SHEET_ID);

function csvUrl(gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

async function fetchTab(gid: string | undefined): Promise<Record<string, string>[]> {
  if (!SHEET_ID || !gid) return [];
  const res = await fetch(csvUrl(gid), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(
      `Could not read sheet tab (gid=${gid}): HTTP ${res.status}. ` +
        'Make sure the sheet is shared as "Anyone with the link — Viewer".',
    );
  }
  const text = await res.text();
  return rowsToRecords(parseCSV(text));
}

export interface SheetTabs {
  leads: Record<string, string>[];
  campaigns: Record<string, string>[];
  weeklyReviews: Record<string, string>[];
  fetchedAt: string;
}

export async function fetchSheetTabs(): Promise<SheetTabs> {
  const [leads, campaigns, weeklyReviews] = await Promise.all([
    fetchTab(LEADS_GID),
    fetchTab(CAMPAIGNS_GID),
    fetchTab(WEEKLY_REVIEWS_GID),
  ]);
  return { leads, campaigns, weeklyReviews, fetchedAt: new Date().toISOString() };
}
