import { useEffect, useState } from 'react';
import { CAMPAIGNS as MOCK_CAMPAIGNS, LEADS as MOCK_LEADS, WEEKLY_REVIEWS as MOCK_REVIEWS } from '../data/mockData';
import type { Campaign, Lead, WeeklyReview } from '../types';
import { fetchSheetTabs, IS_SHEET_CONFIGURED } from '../lib/sheetSource';
import { mapRowsToCampaigns, mapRowsToLeads, mapRowsToWeeklyReviews } from '../lib/sheetMapping';

export interface DashboardData {
  leads: Lead[];
  campaigns: Campaign[];
  weeklyReviews: WeeklyReview[];
  /** True while the initial live fetch is in flight. Never true when running on mock data. */
  loading: boolean;
  /** Set when a live fetch was attempted but failed (dashboard falls back to mock data). */
  error: string | null;
  /** False once real sheet data has loaded successfully. */
  isSample: boolean;
  lastUpdated: string;
}

export function useDashboardData(): DashboardData {
  const [state, setState] = useState<DashboardData>({
    leads: MOCK_LEADS,
    campaigns: MOCK_CAMPAIGNS,
    weeklyReviews: MOCK_REVIEWS,
    loading: IS_SHEET_CONFIGURED,
    error: null,
    isSample: true,
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    if (!IS_SHEET_CONFIGURED) return;

    let cancelled = false;

    async function load() {
      try {
        const tabs = await fetchSheetTabs();
        if (cancelled) return;

        const campaigns = tabs.campaigns.length > 0 ? mapRowsToCampaigns(tabs.campaigns) : MOCK_CAMPAIGNS;
        const leads = mapRowsToLeads(tabs.leads, campaigns);
        const weeklyReviews =
          tabs.weeklyReviews.length > 0 ? mapRowsToWeeklyReviews(tabs.weeklyReviews) : [];

        if (leads.length === 0) {
          setState((s) => ({
            ...s,
            loading: false,
            error: 'The connected sheet returned no lead rows — check the tab and column names.',
          }));
          return;
        }

        setState({
          leads,
          campaigns,
          weeklyReviews,
          loading: false,
          error: null,
          isSample: false,
          lastUpdated: tabs.fetchedAt,
        });
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load live sheet data.',
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
