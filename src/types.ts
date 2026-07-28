export type Industry =
  | 'SaaS'
  | 'Healthcare'
  | 'FinTech'
  | 'E-commerce'
  | 'Manufacturing'
  | 'Real Estate'
  | 'Education'
  | 'Logistics';

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
  industry: Industry;
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
