import type { Campaign, DateRange, Industry, Lead, LeadStage } from '../types';

function inRange(iso: string | null, range: DateRange): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}

export interface ExecutiveSummary {
  newLeads: number;
  companiesResearched: number;
  emailsSent: number;
  followUpsSent: number;
  responsesReceived: number;
  meetingsScheduled: number;
  proposalsSent: number;
  clientsWon: number;
}

export function computeExecutiveSummary(leads: Lead[], range: DateRange): ExecutiveSummary {
  return {
    newLeads: leads.filter((l) => inRange(l.dateAdded, range)).length,
    companiesResearched: leads.filter((l) => inRange(l.dateAdded, range)).length,
    emailsSent: leads.filter((l) => inRange(l.emailSentDate, range)).length,
    followUpsSent: leads.filter((l) => inRange(l.followUpDate, range)).length,
    responsesReceived: leads.filter((l) => inRange(l.responseDate, range)).length,
    meetingsScheduled: leads.filter((l) => inRange(l.meetingDate, range)).length,
    proposalsSent: leads.filter((l) => inRange(l.proposalDate, range)).length,
    clientsWon: leads.filter((l) => inRange(l.wonDate, range)).length,
  };
}

export interface FunnelStage {
  label: string;
  count: number;
  /** % of the previous stage's count that reached this stage. Null for the first stage. */
  conversionFromPrev: number | null;
  /** % of the first stage's count that reached this stage. Null for the first stage. */
  conversionFromFirst: number | null;
}

export function computeFunnel(leads: Lead[], range: DateRange): FunnelStage[] {
  const summary = computeExecutiveSummary(leads, range);
  const rawStages = [
    { label: 'Leads', count: summary.newLeads },
    { label: 'Emails Sent', count: summary.emailsSent },
    { label: 'Responses', count: summary.responsesReceived },
    { label: 'Meetings', count: summary.meetingsScheduled },
    { label: 'Proposals', count: summary.proposalsSent },
    { label: 'Clients Won', count: summary.clientsWon },
  ];

  const firstCount = rawStages[0].count;

  return rawStages.map((stage, i) => {
    const prevCount = i > 0 ? rawStages[i - 1].count : null;
    return {
      ...stage,
      conversionFromPrev: i === 0 ? null : pctChange(stage.count, prevCount ?? 0),
      conversionFromFirst: i === 0 ? null : pctChange(stage.count, firstCount),
    };
  });
}

/**
 * Tracks how many leads received each successive outreach touch (1st email, then
 * 2nd/3rd/4th/5th follow-ups), regardless of whether they eventually respond. Useful for
 * seeing outreach persistence and where follow-up effort tails off.
 */
export function computeOutreachStages(leads: Lead[], range: DateRange): FunnelStage[] {
  const cohort = leads.filter((l) => inRange(l.dateAdded, range));
  const rawStages = [
    { label: '1st Outreach', count: cohort.filter((l) => l.emailSentDate).length },
    { label: '2nd Outreach', count: cohort.filter((l) => l.followUpDate).length },
    { label: '3rd Outreach', count: cohort.filter((l) => l.followUpDate2).length },
    { label: '4th Outreach', count: cohort.filter((l) => l.followUpDate3).length },
    { label: '5th Outreach', count: cohort.filter((l) => l.followUpDate4).length },
  ];

  const firstCount = rawStages[0].count;

  return rawStages.map((stage, i) => {
    const prevCount = i > 0 ? rawStages[i - 1].count : null;
    return {
      ...stage,
      conversionFromPrev: i === 0 ? null : pctChange(stage.count, prevCount ?? 0),
      conversionFromFirst: i === 0 ? null : pctChange(stage.count, firstCount),
    };
  });
}

export interface IndustryRow {
  industry: Industry;
  companies: number;
  responses: number;
  meetings: number;
  clients: number;
}

export function computeIndustryPerformance(leads: Lead[], range: DateRange): IndustryRow[] {
  const cohort = leads.filter((l) => inRange(l.dateAdded, range));
  const byIndustry = new Map<Industry, IndustryRow>();

  for (const lead of cohort) {
    const row = byIndustry.get(lead.industry) ?? {
      industry: lead.industry,
      companies: 0,
      responses: 0,
      meetings: 0,
      clients: 0,
    };
    row.companies += 1;
    if (lead.responseDate) row.responses += 1;
    if (lead.meetingDate) row.meetings += 1;
    if (lead.wonDate) row.clients += 1;
    byIndustry.set(lead.industry, row);
  }

  return Array.from(byIndustry.values()).sort((a, b) => b.clients - a.clients || b.meetings - a.meetings);
}

export interface CampaignRow {
  campaign: Campaign;
  companies: number;
  responses: number;
  meetings: number;
  clients: number;
}

export function computeCampaignPerformance(
  leads: Lead[],
  campaigns: Campaign[],
  range: DateRange,
): CampaignRow[] {
  const cohort = leads.filter((l) => inRange(l.dateAdded, range));
  const byCampaign = new Map<string, CampaignRow>();

  for (const campaign of campaigns) {
    byCampaign.set(campaign.id, { campaign, companies: 0, responses: 0, meetings: 0, clients: 0 });
  }

  for (const lead of cohort) {
    const row = byCampaign.get(lead.campaignId);
    if (!row) continue;
    row.companies += 1;
    if (lead.responseDate) row.responses += 1;
    if (lead.meetingDate) row.meetings += 1;
    if (lead.wonDate) row.clients += 1;
  }

  return Array.from(byCampaign.values())
    .filter((r) => r.companies > 0)
    .sort((a, b) => b.companies - a.companies);
}

export function computePipeline(leads: Lead[], range: DateRange): Record<LeadStage, number> {
  const cohort = leads.filter((l) => inRange(l.dateAdded, range));
  const counts: Record<LeadStage, number> = {
    'New Lead': 0,
    Contacted: 0,
    Responded: 0,
    'Meeting Scheduled': 0,
    'Proposal Sent': 0,
    Won: 0,
    Lost: 0,
  };
  for (const lead of cohort) {
    counts[lead.stage] += 1;
  }
  return counts;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  leads: number;
  responses: number;
  meetings: number;
}

export function computeTimeSeries(leads: Lead[], range: DateRange): TimeSeriesPoint[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const spanDays = Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / dayMs) + 1);
  const points: TimeSeriesPoint[] = [];

  for (let i = 0; i < spanDays; i++) {
    const dayStart = new Date(range.from);
    dayStart.setDate(dayStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const dayRange = { from: dayStart, to: dayEnd };

    points.push({
      date: dayStart.toISOString(),
      label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      leads: leads.filter((l) => inRange(l.dateAdded, dayRange)).length,
      responses: leads.filter((l) => inRange(l.responseDate, dayRange)).length,
      meetings: leads.filter((l) => inRange(l.meetingDate, dayRange)).length,
    });
  }

  return points;
}

/** Leads added in range, most recent first — used for the Lead Directory table. */
export function computeLeadDirectory(leads: Lead[], range: DateRange): Lead[] {
  return leads
    .filter((l) => inRange(l.dateAdded, range))
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
}

export function pctChange(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export interface RevenueSummary {
  /** Total value of deals still open (proposal sent, not yet won or lost) — cohort added in range. */
  pipelineValue: number;
  /** Total value of deals won, where the win date falls in range. */
  revenueWon: number;
  /** Count of deals won, where the win date falls in range. */
  dealsWon: number;
  /** Average value of won deals in range. */
  avgDealSize: number;
  /** Won / (Won + Lost) among deals that reached the proposal stage, in range. */
  winRate: number | null;
}

export interface AutoInsights {
  wins: string[];
  bottlenecks: string[];
  improvementActions: string[];
}

// What to suggest when a given funnel stage-to-stage transition is the weakest link.
const STAGE_ACTION_HINTS: Record<string, string> = {
  'Emails Sent': 'Increase outreach volume and follow-up cadence to keep leads moving into the funnel.',
  Responses: 'Test shorter subject lines and more personalized openers to lift email response rates.',
  Meetings: 'Follow up faster after a response — speed-to-lead strongly affects meeting bookings.',
  Proposals: 'Shorten the gap between meeting and proposal delivery so momentum isn\u2019t lost.',
  'Clients Won': 'Tighten proposal follow-up and negotiation cadence to close a higher share of proposals.',
};

function previousPeriod(range: DateRange): DateRange {
  const spanMs = range.to.getTime() - range.from.getTime();
  const to = new Date(range.from.getTime() - 1);
  const from = new Date(to.getTime() - spanMs);
  return { from, to };
}

/**
 * Rule-based insights computed straight from real lead data — no manual write-up
 * required. Compares the selected period against the immediately preceding period
 * of equal length.
 */
export function computeAutoInsights(leads: Lead[], range: DateRange): AutoInsights {
  const summary = computeExecutiveSummary(leads, range);
  const funnel = computeFunnel(leads, range);
  const industryRows = computeIndustryPerformance(leads, range);
  const revenue = computeRevenue(leads, range);

  const prevRange = previousPeriod(range);
  const prevSummary = computeExecutiveSummary(leads, prevRange);
  const prevFunnel = computeFunnel(leads, prevRange);

  const wins: string[] = [];
  const bottlenecks: string[] = [];
  const improvementActions: string[] = [];

  if (summary.newLeads === 0) {
    return {
      wins: ['No leads recorded in this period yet.'],
      bottlenecks: ['Not enough data in this period to identify bottlenecks.'],
      improvementActions: ['Add leads for this period, or widen the date range, to generate insights.'],
    };
  }

  // Wins
  if (summary.clientsWon > 0) {
    const delta = summary.clientsWon - prevSummary.clientsWon;
    const trend = delta > 0 ? ` (up from ${prevSummary.clientsWon})` : delta === 0 ? ' (same as last period)' : '';
    wins.push(`Won ${summary.clientsWon} client${summary.clientsWon === 1 ? '' : 's'} this period${trend}.`);
  }
  if (revenue.revenueWon > 0) {
    wins.push(`Generated ${revenue.revenueWon.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} in closed-won revenue.`);
  }
  const bestIndustry = industryRows
    .filter((r) => r.companies >= 3)
    .map((r) => ({ ...r, winRate: (r.clients / r.companies) * 100 }))
    .sort((a, b) => b.winRate - a.winRate)[0];
  if (bestIndustry && bestIndustry.winRate > 0) {
    wins.push(`${bestIndustry.industry} is converting best this period, at a ${bestIndustry.winRate.toFixed(0)}% win rate.`);
  }
  const overallConversion = funnel[funnel.length - 1]?.conversionFromFirst;
  const prevOverallConversion = prevFunnel[prevFunnel.length - 1]?.conversionFromFirst;
  if (overallConversion !== null && overallConversion !== undefined && prevOverallConversion !== null && prevOverallConversion !== undefined && overallConversion > prevOverallConversion) {
    wins.push(`Overall Leads \u2192 Clients conversion improved to ${overallConversion.toFixed(1)}% (from ${prevOverallConversion.toFixed(1)}%).`);
  }
  if (wins.length === 0) {
    wins.push('No closed-won deals yet this period \u2014 keep pushing proposals through the pipeline.');
  }

  // Bottlenecks: the weakest stage-to-stage conversion in the funnel.
  const stagesWithConversion = funnel.filter((s) => s.conversionFromPrev !== null);
  const weakest = stagesWithConversion.sort((a, b) => (a.conversionFromPrev ?? 100) - (b.conversionFromPrev ?? 100))[0];
  const weakestIndex = weakest ? funnel.findIndex((s) => s.label === weakest.label) : -1;
  if (weakest && weakest.conversionFromPrev !== null && weakestIndex > 0) {
    bottlenecks.push(
      `Biggest drop-off: only ${weakest.conversionFromPrev.toFixed(0)}% of "${funnel[weakestIndex - 1].label}" moved to "${weakest.label}".`,
    );
  }
  if (summary.newLeads < prevSummary.newLeads) {
    const pctDown = pctChange(prevSummary.newLeads - summary.newLeads, prevSummary.newLeads);
    bottlenecks.push(`New leads are down ${pctDown ? pctDown.toFixed(0) : ''}% vs. the previous period (${summary.newLeads} vs. ${prevSummary.newLeads}).`);
  }
  if (summary.meetingsScheduled === 0 && summary.responsesReceived > 0) {
    bottlenecks.push('Leads are responding but no meetings have been booked yet this period.');
  }
  const stuckProposals = leads.filter((l) => l.stage === 'Proposal Sent' && inRange(l.dateAdded, range)).length;
  if (stuckProposals > 0) {
    bottlenecks.push(`${stuckProposals} proposal${stuckProposals === 1 ? '' : 's'} sent with no decision yet.`);
  }
  if (bottlenecks.length === 0) {
    bottlenecks.push('No major drop-off detected this period \u2014 the funnel is moving smoothly.');
  }

  // Improvement actions, tied to the weakest stage found above.
  if (weakest && STAGE_ACTION_HINTS[weakest.label]) {
    improvementActions.push(STAGE_ACTION_HINTS[weakest.label]);
  }
  if (stuckProposals > 0) {
    improvementActions.push('Follow up on open proposals this week to move them to a decision.');
  }
  if (improvementActions.length === 0) {
    improvementActions.push('Keep current outreach and follow-up cadence \u2014 performance is on track.');
  }

  return { wins, bottlenecks, improvementActions };
}

export function computeRevenue(leads: Lead[], range: DateRange): RevenueSummary {
  const cohort = leads.filter((l) => inRange(l.dateAdded, range));
  const pipelineValue = cohort
    .filter((l) => l.stage === 'Proposal Sent')
    .reduce((sum, l) => sum + l.dealValue, 0);

  const wonInRange = leads.filter((l) => inRange(l.wonDate, range));
  const revenueWon = wonInRange.reduce((sum, l) => sum + l.dealValue, 0);
  const dealsWon = wonInRange.length;
  const avgDealSize = dealsWon > 0 ? revenueWon / dealsWon : 0;

  const decidedInRange = cohort.filter((l) => l.stage === 'Won' || l.stage === 'Lost');
  const wonInCohort = decidedInRange.filter((l) => l.stage === 'Won').length;
  const winRate = decidedInRange.length > 0 ? (wonInCohort / decidedInRange.length) * 100 : null;

  return { pipelineValue, revenueWon, dealsWon, avgDealSize, winRate };
}
