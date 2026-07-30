// A finite, curated set of top-level industry categories used for grouping/reporting.
// Sheet rows are matched against this list (case-insensitively); anything that doesn't
// match falls back to "Other" so reporting stays consistent even as new niches appear.
export const INDUSTRY_CATEGORIES = [
  'Fitness & Wellness',
  'Healthcare',
  'Hospitality',
  'Real Estate',
  'E-commerce & Retail',
  'Professional Services',
  'Education',
  'Technology / SaaS',
  'Manufacturing',
  'Other',
] as const;

// Kept as `string` (rather than a strict union of INDUSTRY_CATEGORIES) since this is
// runtime data from a spreadsheet — mapping/normalization happens in sheetMapping.ts.
export type Industry = string;

export type LeadStage =
  | 'New Lead'
  | 'Contacted'
  | 'Responded'
  | 'Meeting Scheduled'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export interface Lead {
  id: string;
  company: string;
  /** Top-level category, normalized against INDUSTRY_CATEGORIES (e.g. "Fitness & Wellness"). */
  industry: Industry;
  /** Finer-grained niche as written in the sheet (e.g. "Pilates studio"). Free text, not normalized. */
  subIndustry?: string;
  campaignId: string;
  dateAdded: string;
  emailSentDate: string | null;
  followUpDate: string | null;
  responseDate: string | null;
  meetingDate: string | null;
  proposalDate: string | null;
  wonDate: string | null;
  lostDate: string | null;
  stage: LeadStage;
  /** Estimated/contracted deal value in USD. Set once a proposal is sent; 0 before that. */
  dealValue: number;

  // Prospecting/context detail fields, optional since mock data and older rows won't have them.
  studioType?: string;
  website?: string;
  city?: string;
  country?: string;
  email?: string;
  mobileAppStatus?: string;
  bookingPlatformUsed?: string;
  businessPain?: string;
  recommendedSolution?: string;
}

export interface Campaign {
  id: string;
  name: string;
  industry: Industry;
  aiWorkflow: string;
  lessonsLearned: string;
}

export interface WeeklyReview {
  week: string;
  wins: string;
  bottlenecks: string;
  improvementActions: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type PresetKey = 'today' | 'week' | 'month' | 'custom';
