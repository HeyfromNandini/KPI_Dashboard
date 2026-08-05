import { useMemo, useState } from 'react';
import { DateFilter } from './components/DateFilter';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { FunnelConversion } from './components/FunnelConversion';
import { RevenueKpis } from './components/RevenueKpis';
import { IndustryPerformance } from './components/IndustryPerformance';
import { CampaignPerformance } from './components/CampaignPerformance';
import { LeadDirectory } from './components/LeadDirectory';
import { Pipeline } from './components/Pipeline';
import { ChartsSection } from './components/ChartsSection';
import { ProgressTargets } from './components/ProgressTargets';
import { AutoInsights } from './components/AutoInsights';
import { WeeklyNotes } from './components/WeeklyNotes';
import { useDashboardData } from './hooks/useDashboardData';
import {
  computeAutoInsights,
  computeCampaignPerformance,
  computeExecutiveSummary,
  computeFunnel,
  computeIndustryPerformance,
  computeLeadDirectory,
  computeOutreachStages,
  computePipeline,
  computeRevenue,
  computeTimeSeries,
} from './lib/analytics';
import { formatDateTime, rangeForPreset } from './lib/dateRange';
import type { DateRange, PresetKey } from './types';
import { LayoutDashboard, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [preset, setPreset] = useState<PresetKey>('month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const { leads, campaigns, weeklyReviews, loading, error, isSample, lastUpdated } = useDashboardData();

  const range = useMemo(() => rangeForPreset(preset, customRange), [preset, customRange]);

  function handleDateChange(nextPreset: PresetKey, next?: DateRange) {
    setPreset(nextPreset);
    if (next) setCustomRange(next);
  }

  const summary = useMemo(() => computeExecutiveSummary(leads, range), [leads, range]);
  const funnel = useMemo(() => computeFunnel(leads, range), [leads, range]);
  const outreachStages = useMemo(() => computeOutreachStages(leads, range), [leads, range]);
  const industryRows = useMemo(() => computeIndustryPerformance(leads, range), [leads, range]);
  const campaignRows = useMemo(
    () => computeCampaignPerformance(leads, campaigns, range),
    [leads, campaigns, range],
  );
  const pipelineCounts = useMemo(() => computePipeline(leads, range), [leads, range]);
  const series = useMemo(() => computeTimeSeries(leads, range), [leads, range]);
  const revenue = useMemo(() => computeRevenue(leads, range), [leads, range]);
  const leadDirectory = useMemo(() => computeLeadDirectory(leads, range), [leads, range]);
  const insights = useMemo(() => computeAutoInsights(leads, range), [leads, range]);

  const targets = useMemo(
    () => [
      { label: 'New Leads', value: summary.newLeads, target: 120 },
      { label: 'Meetings Scheduled', value: summary.meetingsScheduled, target: 30 },
      { label: 'Proposals Sent', value: summary.proposalsSent, target: 15 },
      { label: 'Clients Won', value: summary.clientsWon, target: 8 },
    ],
    [summary],
  );

  return (
    <div className="min-h-screen bg-(--color-canvas)">
      <header
        className="sticky top-0 z-30 border-b border-(--color-border) backdrop-blur-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.82)' }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-ink) text-white">
              <LayoutDashboard size={17} />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold leading-tight text-(--color-ink)">
                AWI Lead Generation KPI Dashboard
              </h1>
              <p className="text-[12.5px] text-(--color-ink-faint)">
                Lead generation health, at a glance
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-[12px] text-(--color-ink-faint) shadow-(--shadow-card)">
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <Clock size={13} />}
              {loading ? (
                'Loading live data…'
              ) : (
                <>
                  Last updated{' '}
                  <span className="font-medium text-(--color-ink-soft)">{formatDateTime(lastUpdated)}</span>
                </>
              )}
            </div>
            <DateFilter preset={preset} customRange={customRange} onChange={handleDateChange} />
          </div>
        </div>
      </header>

      {error && (
        <div className="border-b border-(--color-danger-soft) bg-(--color-danger-soft)">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-2 text-[12.5px] text-(--color-danger)">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              Couldn't load the live sheet ({error}). Showing sample data instead.
            </span>
          </div>
        </div>
      )}

      {!error && isSample && (
        <div className="border-b border-(--color-warning-soft) bg-(--color-warning-soft)">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-2 text-[12.5px] text-(--color-warning)">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              This dashboard is currently showing <span className="font-semibold">sample data</span>, not live
              figures. Connect the Lead Generation Google Sheet to ensure all numbers reflect actual performance.
            </span>
          </div>
        </div>
      )}

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <ExecutiveSummary summary={summary} funnel={funnel} />
        <FunnelConversion funnel={funnel} />
        <FunnelConversion
          funnel={outreachStages}
          title="Outreach Persistence"
          subtitle="How many leads received each successive follow-up touch, regardless of response"
          overallLabel="reached the 5th outreach"
        />
        <RevenueKpis revenue={revenue} />
        <ChartsSection series={series} industryRows={industryRows} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Pipeline counts={pipelineCounts} />
          </div>
          <ProgressTargets targets={targets} />
        </div>

        <IndustryPerformance rows={industryRows} />
        <CampaignPerformance rows={campaignRows} />
        <LeadDirectory leads={leadDirectory} />
        <AutoInsights insights={insights} />
        {weeklyReviews.length > 0 && <WeeklyNotes reviews={weeklyReviews} />}

        <footer className="pb-4 pt-2 text-center text-[12px] text-(--color-ink-faint)">
          Data source: {isSample ? 'Sample data' : 'Lead Generation Google Sheet'} · Built for Ros, Nandini &amp;
          Kailash
          <br />
          Last updated {formatDateTime(lastUpdated)}
        </footer>
      </main>
    </div>
  );
}
