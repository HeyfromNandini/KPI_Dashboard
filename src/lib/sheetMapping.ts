import {
  INDUSTRY_CATEGORIES,
  type Campaign,
  type Industry,
  type Lead,
  type LeadStage,
  type WeeklyReview,
} from '../types';

type Row = Record<string, string>;

const KNOWN_STAGES: LeadStage[] = [
  'New Lead',
  'Contacted',
  'Responded',
  'Meeting Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

/** Looks up a field by trying several possible (already-lowercased) header spellings. */
function get(row: Row, ...aliases: string[]): string {
  for (const alias of aliases) {
    const v = row[alias];
    if (v !== undefined && v !== '') return v;
  }
  return '';
}

/** Same as `get`, but returns `undefined` instead of an empty string when nothing is found. */
function getOpt(row: Row, ...aliases: string[]): string | undefined {
  const v = get(row, ...aliases);
  return v || undefined;
}

/**
 * Normalizes a free-text key for matching (e.g. linking a lead's "Campaign" cell to a
 * Campaign row's ID/Name). Lowercases, trims, collapses whitespace, and unifies dash
 * variants (–, —, −) to a plain hyphen so small copy/paste differences (a common issue
 * when pasting from docs or auto-correct turning "-" into an en-dash) don't break the match.
 */
function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ');
}

// Keyword hints used to bucket free-text industry/niche values into a finite category
// when the sheet doesn't already use one of INDUSTRY_CATEGORIES verbatim.
const INDUSTRY_KEYWORDS: [string, Industry][] = [
  ['pilates', 'Fitness & Wellness'],
  ['yoga', 'Fitness & Wellness'],
  ['gym', 'Fitness & Wellness'],
  ['fitness', 'Fitness & Wellness'],
  ['wellness', 'Fitness & Wellness'],
  ['dental', 'Healthcare'],
  ['clinic', 'Healthcare'],
  ['medical', 'Healthcare'],
  ['health', 'Healthcare'],
  ['hotel', 'Hospitality'],
  ['restaurant', 'Hospitality'],
  ['cafe', 'Hospitality'],
  ['hospitality', 'Hospitality'],
  ['real estate', 'Real Estate'],
  ['realty', 'Real Estate'],
  ['property', 'Real Estate'],
  ['e-commerce', 'E-commerce & Retail'],
  ['ecommerce', 'E-commerce & Retail'],
  ['retail', 'E-commerce & Retail'],
  ['shop', 'E-commerce & Retail'],
  ['store', 'E-commerce & Retail'],
  ['law', 'Professional Services'],
  ['legal', 'Professional Services'],
  ['accounting', 'Professional Services'],
  ['consulting', 'Professional Services'],
  ['agency', 'Professional Services'],
  ['school', 'Education'],
  ['academy', 'Education'],
  ['education', 'Education'],
  ['saas', 'Technology / SaaS'],
  ['software', 'Technology / SaaS'],
  ['tech', 'Technology / SaaS'],
  ['manufactur', 'Manufacturing'],
  ['factory', 'Manufacturing'],
  ['industrial', 'Manufacturing'],
];

/** Maps free-text industry/niche input to one of the finite INDUSTRY_CATEGORIES. */
function normalizeIndustry(raw: string): Industry {
  const trimmed = raw.trim();
  if (!trimmed) return 'Other';

  const exact = INDUSTRY_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  const lower = trimmed.toLowerCase();
  const hit = INDUSTRY_KEYWORDS.find(([keyword]) => lower.includes(keyword));
  return hit ? hit[1] : 'Other';
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function parseMoney(value: string): number {
  if (!value) return 0;
  const n = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeStage(raw: string, dates: Record<string, string | null>): LeadStage {
  const match = KNOWN_STAGES.find((s) => s.toLowerCase() === raw.trim().toLowerCase());
  if (match) return match;

  // Fall back to deriving the stage from whichever date columns are filled in.
  if (dates.lostDate) return 'Lost';
  if (dates.wonDate) return 'Won';
  if (dates.proposalDate) return 'Proposal Sent';
  if (dates.meetingDate) return 'Meeting Scheduled';
  if (dates.responseDate) return 'Responded';
  if (dates.emailSentDate) return 'Contacted';
  return 'New Lead';
}

export function mapRowsToLeads(rows: Row[], campaigns: Campaign[]): Lead[] {
  const campaignByKey = new Map<string, string>();
  for (const c of campaigns) {
    campaignByKey.set(normalizeKey(c.id), c.id);
    campaignByKey.set(normalizeKey(c.name), c.id);
  }

  return rows
    .map((row, i) => {
      const company = get(row, 'company', 'company name', 'name', 'account');
      if (!company) return null;

      const dateAdded = parseDate(get(row, 'date added', 'dateadded', 'created', 'created date', 'lead date'));
      const emailSentDate = parseDate(get(row, 'email sent date', 'emailsentdate', 'email sent'));
      const followUpDate = parseDate(
        get(row, 'follow up date', 'followupdate', 'follow-up date', '2nd outreach date', 'follow up 1 date'),
      );
      const followUpDate2 = parseDate(
        get(row, 'follow up 2 date', 'followup2date', 'follow-up 2 date', '3rd outreach date'),
      );
      const followUpDate3 = parseDate(
        get(row, 'follow up 3 date', 'followup3date', 'follow-up 3 date', '4th outreach date'),
      );
      const followUpDate4 = parseDate(
        get(row, 'follow up 4 date', 'followup4date', 'follow-up 4 date', '5th outreach date'),
      );
      const responseDate = parseDate(get(row, 'response date', 'responsedate', 'replied date'));
      const meetingDate = parseDate(get(row, 'meeting date', 'meetingdate', 'meeting scheduled date'));
      const proposalDate = parseDate(get(row, 'proposal date', 'proposaldate', 'proposal sent date'));
      const wonDate = parseDate(get(row, 'won date', 'wondate', 'closed won date'));
      const lostDate = parseDate(get(row, 'lost date', 'lostdate', 'closed lost date'));

      const rawCampaign = get(row, 'campaign id', 'campaignid', 'campaign');
      const campaignId = campaignByKey.get(normalizeKey(rawCampaign)) ?? (rawCampaign || 'unassigned');

      const stage = normalizeStage(get(row, 'stage', 'status'), {
        emailSentDate,
        responseDate,
        meetingDate,
        proposalDate,
        wonDate,
        lostDate,
      });

      const industryRaw = get(row, 'industry');
      const industry = normalizeIndustry(industryRaw);
      const subIndustry = getOpt(
        row,
        'sub industry',
        'sub-industry',
        'sub niche',
        'sub-niche',
        'niche',
        'studio type',
      ) ?? (industryRaw && industryRaw.toLowerCase() !== industry.toLowerCase() ? industryRaw : undefined);

      const lead: Lead = {
        id: get(row, 'id', 'lead id') || `sheet-lead-${i + 1}`,
        company,
        industry,
        subIndustry,
        campaignId,
        dateAdded: dateAdded ?? new Date().toISOString(),
        emailSentDate,
        followUpDate,
        followUpDate2,
        followUpDate3,
        followUpDate4,
        responseDate,
        meetingDate,
        proposalDate,
        wonDate,
        lostDate,
        stage,
        dealValue: parseMoney(get(row, 'deal value', 'dealvalue', 'estimated revenue', 'value')),
        studioType: getOpt(row, 'studio type', 'business type'),
        website: getOpt(row, 'website', 'domain'),
        city: getOpt(row, 'city'),
        country: getOpt(row, 'country'),
        email: getOpt(row, 'email', 'contact email'),
        mobileAppStatus: getOpt(row, 'mobile app status', 'app status'),
        bookingPlatformUsed: getOpt(row, 'booking platform used', 'booking platform'),
        businessPain: getOpt(row, 'business pain', 'pain', 'pain point'),
        recommendedSolution: getOpt(row, 'recommended solution', 'recommended awi service', 'solution'),
      };
      return lead;
    })
    .filter((l): l is Lead => l !== null);
}

export function mapRowsToCampaigns(rows: Row[]): Campaign[] {
  return rows
    .map((row, i) => {
      const name = get(row, 'name', 'campaign name', 'campaign');
      if (!name) return null;
      const campaign: Campaign = {
        id: get(row, 'id', 'campaign id') || `sheet-campaign-${i + 1}`,
        name,
        industry: normalizeIndustry(get(row, 'industry')),
        aiWorkflow: get(row, 'ai workflow', 'aiworkflow', 'workflow'),
        lessonsLearned: get(row, 'lessons learned', 'lessonslearned', 'notes'),
      };
      return campaign;
    })
    .filter((c): c is Campaign => c !== null);
}

export function mapRowsToWeeklyReviews(rows: Row[]): WeeklyReview[] {
  return rows
    .map((row) => {
      const week = get(row, 'week', 'week of');
      if (!week) return null;
      const review: WeeklyReview = {
        week,
        wins: get(row, 'wins'),
        bottlenecks: get(row, 'bottlenecks', 'blockers'),
        improvementActions: get(row, 'improvement actions', 'improvementactions', 'actions'),
      };
      return review;
    })
    .filter((r): r is WeeklyReview => r !== null);
}
