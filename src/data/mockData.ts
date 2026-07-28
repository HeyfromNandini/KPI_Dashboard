import type { Campaign, Industry, Lead, LeadStage, WeeklyReview } from '../types';

// Deterministic pseudo-random generator so the dashboard looks stable across reloads.
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rng = createRng(42);

const INDUSTRIES: Industry[] = [
  'SaaS',
  'Healthcare',
  'FinTech',
  'E-commerce',
  'Manufacturing',
  'Real Estate',
  'Education',
  'Logistics',
];

const COMPANY_PREFIXES = [
  'Northwind', 'Bluepeak', 'Silverline', 'Crestwood', 'Ironvale', 'Sunrise', 'Meridian', 'Harborview',
  'Oakfield', 'Brightpath', 'Cobalt', 'Everline', 'Fernwood', 'Granite', 'Highland', 'Ivory', 'Junction',
  'Kestrel', 'Lumen', 'Marlowe', 'Novara', 'Orbit', 'Pinecrest', 'Quartz', 'Ridgeline', 'Stonebridge',
  'Tidalwave', 'Umbra', 'Vantage', 'Westgate', 'Yonder', 'Zenith', 'Arcadia', 'Bellwood', 'Coral',
];

const COMPANY_SUFFIXES = [
  'Labs', 'Group', 'Partners', 'Solutions', 'Technologies', 'Holdings', 'Systems', 'Collective',
  'Industries', 'Networks', 'Ventures', 'Works', 'Studio', 'Analytics', 'Dynamics',
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Cold Email V1',
    industry: 'SaaS',
    aiWorkflow: 'GPT-4 Personalized Opener',
    lessonsLearned: 'Short subject lines (<6 words) doubled open rates. Personalized first line matters most.',
  },
  {
    id: 'camp-2',
    name: 'Founder Direct Outreach',
    industry: 'FinTech',
    aiWorkflow: 'Claude Research Agent',
    lessonsLearned: 'Referencing recent funding news boosted response rate significantly.',
  },
  {
    id: 'camp-3',
    name: 'LinkedIn + Email Combo',
    industry: 'Healthcare',
    aiWorkflow: 'n8n Auto-Sequencer',
    lessonsLearned: 'Multi-channel touch improved reply rate but needs 3-4 day spacing to avoid fatigue.',
  },
  {
    id: 'camp-4',
    name: 'Case Study Follow-up',
    industry: 'E-commerce',
    aiWorkflow: 'GPT-4 Personalized Opener',
    lessonsLearned: 'Attaching a relevant case study in the second touch increased meeting bookings.',
  },
  {
    id: 'camp-5',
    name: 'Warm Intro Sequence',
    industry: 'Manufacturing',
    aiWorkflow: 'Claude Research Agent',
    lessonsLearned: 'Warm intros convert 3x higher, but volume is limited — best used for high-value accounts.',
  },
  {
    id: 'camp-6',
    name: 'Event Follow-up Blast',
    industry: 'Real Estate',
    aiWorkflow: 'n8n Auto-Sequencer',
    lessonsLearned: 'Follow-up within 48 hours of an event tripled response rate vs. week-later outreach.',
  },
  {
    id: 'camp-7',
    name: 'Industry Report Hook',
    industry: 'Education',
    aiWorkflow: 'GPT-4 Personalized Opener',
    lessonsLearned: 'Leading with a data point specific to their market performed best as an opener.',
  },
  {
    id: 'camp-8',
    name: 'Referral Chain Outreach',
    industry: 'Logistics',
    aiWorkflow: 'Claude Research Agent',
    lessonsLearned: 'Asking for a referral in the closing line generated unexpected downstream leads.',
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(9 + Math.floor(rng() * 8), Math.floor(rng() * 60), 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function toISO(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

function addDays(d: Date, n: number): Date {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

function generateLeads(count: number): Lead[] {
  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    const ageDays = Math.floor(rng() * 120); // spread across ~4 months
    const dateAdded = daysAgo(ageDays);
    const industry = pick(INDUSTRIES);
    const campaign = pick(CAMPAIGNS.filter((c) => c.industry === industry).concat(CAMPAIGNS));

    let emailSentDate: Date | null = null;
    let followUpDate: Date | null = null;
    let responseDate: Date | null = null;
    let meetingDate: Date | null = null;
    let proposalDate: Date | null = null;
    let wonDate: Date | null = null;
    let lostDate: Date | null = null;
    let stage: LeadStage = 'New Lead';

    // Funnel drop-off probabilities, tuned to feel realistic.
    const emailed = rng() < 0.86;
    if (emailed) {
      emailSentDate = addDays(dateAdded, 1 + Math.floor(rng() * 3));
      stage = 'Contacted';

      const followedUp = rng() < 0.55;
      if (followedUp) {
        followUpDate = addDays(emailSentDate, 3 + Math.floor(rng() * 4));
      }

      const responded = rng() < 0.32;
      if (responded) {
        responseDate = addDays(emailSentDate, 1 + Math.floor(rng() * 6));
        stage = 'Responded';

        const meeting = rng() < 0.58;
        if (meeting) {
          meetingDate = addDays(responseDate, 1 + Math.floor(rng() * 5));
          stage = 'Meeting Scheduled';

          const proposal = rng() < 0.5;
          if (proposal) {
            proposalDate = addDays(meetingDate, 2 + Math.floor(rng() * 6));
            stage = 'Proposal Sent';

            const won = rng() < 0.42;
            const lost = !won && rng() < 0.55;
            if (won) {
              wonDate = addDays(proposalDate, 3 + Math.floor(rng() * 10));
              stage = 'Won';
            } else if (lost) {
              lostDate = addDays(proposalDate, 3 + Math.floor(rng() * 10));
              stage = 'Lost';
            }
          } else if (rng() < 0.3) {
            lostDate = addDays(meetingDate, 4 + Math.floor(rng() * 8));
            stage = 'Lost';
          }
        } else if (rng() < 0.25) {
          lostDate = addDays(responseDate, 5 + Math.floor(rng() * 10));
          stage = 'Lost';
        }
      } else if (rng() < 0.12) {
        lostDate = addDays(emailSentDate, 10 + Math.floor(rng() * 14));
        stage = 'Lost';
      }
    }

    // Don't allow future dates to leak in.
    const now = new Date();
    const clamp = (d: Date | null) => (d && d > now ? now : d);

    leads.push({
      id: `lead-${i + 1}`,
      company: `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`,
      industry,
      campaignId: campaign.id,
      dateAdded: toISO(dateAdded)!,
      emailSentDate: toISO(clamp(emailSentDate)),
      followUpDate: toISO(clamp(followUpDate)),
      responseDate: toISO(clamp(responseDate)),
      meetingDate: toISO(clamp(meetingDate)),
      proposalDate: toISO(clamp(proposalDate)),
      wonDate: toISO(clamp(wonDate)),
      lostDate: toISO(clamp(lostDate)),
      stage,
    });
  }

  return leads;
}

export const LEADS: Lead[] = generateLeads(420);

function weekLabel(offsetWeeks: number): string {
  const d = daysAgo(offsetWeeks * 7);
  const start = new Date(d);
  start.setDate(start.getDate() - start.getDay());
  const end = addDays(start, 6);
  const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export const WEEKLY_REVIEWS: WeeklyReview[] = [
  {
    week: weekLabel(0),
    wins: 'Closed 2 new clients in FinTech. Response rate on the Founder Direct Outreach campaign hit 38%, well above target.',
    bottlenecks: 'Follow-up sequence is inconsistent — several leads went 5+ days without a second touch. Manual research is slowing down new company additions.',
    improvementActions: 'Automate follow-up reminders at day 3. Batch industry research sessions twice a week instead of ad-hoc.',
  },
  {
    week: weekLabel(1),
    wins: 'Highest weekly meeting count this quarter (14). Case Study Follow-up campaign converting well in E-commerce.',
    bottlenecks: 'Proposal turnaround time increased to 6 days on average, causing some leads to go cold.',
    improvementActions: 'Create a proposal template library by industry to cut turnaround to under 3 days.',
  },
  {
    week: weekLabel(2),
    wins: 'Healthcare vertical outperformed forecast — 5 meetings booked from 40 companies contacted.',
    bottlenecks: 'Email deliverability dipped mid-week, likely due to sending volume spike.',
    improvementActions: 'Stagger sends across the day and warm up the new sending domain further before scaling volume.',
  },
];
