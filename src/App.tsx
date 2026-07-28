import { useMemo, useState } from 'react';
import { DateFilter } from './components/DateFilter';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { IndustryPerformance } from './components/IndustryPerformance';
import { CampaignPerformance } from './components/CampaignPerformance';
import { Pipeline } from './components/Pipeline';
import { ChartsSection } from './components/ChartsSection';
import { ProgressTargets } from './components/ProgressTargets';
import { WeeklyNotes } from './components/WeeklyNotes';
import { LEADS, CAMPAIGNS, WEEKLY_REVIEWS } from './data/mockData';
import {
  computeCampaignPerformance,
  computeExecutiveSummary,
  computeFunnel,
  computeIndustryPerformance,
  computePipeline,
  computeTimeSeries,
} from './lib/analytics';
import { rangeForPreset } from './lib/dateRange';
import type { DateRange, PresetKey } from './types';
import { LayoutDashboard } from 'lucide-react';

export default function App() {
  const [preset, setPreset] = useState<PresetKey>('month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  const range = useMemo(() => rangeForPreset(preset, customRange), [preset, customRange]);

  function handleDateChange(nextPreset: PresetKey, next?: DateRange) {
    setPreset(nextPreset);
    if (next) setCustomRange(next);
  }

  const summary = useMemo(() => computeExecutiveSummary(LEADS, range), [range]);
  const funnel = useMemo(() => computeFunnel(LEADS, range), [range]);
  const industryRows = useMemo(() => computeIndustryPerformance(LEADS, range), [range]);
  const campaignRows = useMemo(() => computeCampaignPerformance(LEADS, CAMPAIGNS, range), [range]);
  const pipelineCounts = useMemo(() => computePipeline(LEADS, range), [range]);
  const series = useMemo(() => computeTimeSeries(LEADS, range), [range]);

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
          <DateFilter preset={preset} customRange={customRange} onChange={handleDateChange} />
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <ExecutiveSummary summary={summary} funnel={funnel} />
        <ChartsSection series={series} industryRows={industryRows} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Pipeline counts={pipelineCounts} />
          </div>
          <ProgressTargets targets={targets} />
        </div>

        <IndustryPerformance rows={industryRows} />
        <CampaignPerformance rows={campaignRows} />
        <WeeklyNotes reviews={WEEKLY_REVIEWS} />

        <footer className="pb-4 pt-2 text-center text-[12px] text-(--color-ink-faint)">
          Data source: Lead Generation Google Sheet · Manual updates · Built for Ros, Nandini &amp; Kailash
        </footer>
      </main>
    </div>
  );
}
