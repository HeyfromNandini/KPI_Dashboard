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
}

export function computeFunnel(leads: Lead[], range: DateRange): FunnelStage[] {
  const summary = computeExecutiveSummary(leads, range);
  return [
    { label: 'Companies Identified', count: summary.companiesResearched },
    { label: 'Emails Sent', count: summary.emailsSent },
    { label: 'Responses Received', count: summary.responsesReceived },
    { label: 'Meetings Scheduled', count: summary.meetingsScheduled },
    { label: 'Proposals Sent', count: summary.proposalsSent },
    { label: 'Clients Won', count: summary.clientsWon },
  ];
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

export function pctChange(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}
