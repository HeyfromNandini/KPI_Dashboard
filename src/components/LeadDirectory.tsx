import { ExternalLink } from 'lucide-react';
import type { Lead, LeadStage } from '../types';
import { Card, SectionHeader } from './ui/Card';

const STAGE_BADGE: Record<LeadStage, string> = {
  'New Lead': 'bg-(--color-canvas) text-(--color-ink-faint)',
  Contacted: 'bg-(--color-accent-soft) text-(--color-accent)',
  Responded: 'bg-indigo-50 text-indigo-600',
  'Meeting Scheduled': 'bg-(--color-warning-soft) text-(--color-warning)',
  'Proposal Sent': 'bg-amber-50 text-amber-700',
  Won: 'bg-(--color-success-soft) text-(--color-success)',
  Lost: 'bg-(--color-danger-soft) text-(--color-danger)',
};

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function LeadDirectory({ leads }: { leads: Lead[] }) {
  return (
    <section>
      <SectionHeader
        title="Lead Directory"
        subtitle="Prospecting detail for every lead added in the selected period"
        action={
          <span className="rounded-full bg-(--color-canvas) px-2.5 py-1 text-[11.5px] font-medium text-(--color-ink-faint)">
            {leads.length} lead{leads.length === 1 ? '' : 's'}
          </span>
        }
      />
      <Card className="animate-rise overflow-hidden">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="sticky top-0 bg-(--color-surface)">
              <tr className="border-b border-(--color-border) text-[12px] text-(--color-ink-faint)">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Industry / Niche</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Mobile App Status</th>
                <th className="px-4 py-3 font-medium">Booking Platform</th>
                <th className="px-4 py-3 font-medium">Business Pain</th>
                <th className="px-4 py-3 font-medium">Recommended Solution</th>
                <th className="px-4 py-3 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-(--color-ink-faint)">
                    No leads for the selected period.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-(--color-border) last:border-b-0 hover:bg-(--color-surface-hover)"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-(--color-ink)">{lead.company}</div>
                    {lead.website && (
                      <a
                        href={normalizeUrl(lead.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 flex items-center gap-1 text-[11.5px] text-(--color-accent) hover:underline"
                      >
                        {lead.website}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">
                    <div>{lead.industry}</div>
                    {lead.subIndustry && (
                      <div className="text-[11.5px] text-(--color-ink-faint)">{lead.subIndustry}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">
                    {[lead.city, lead.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">{lead.mobileAppStatus || '—'}</td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">{lead.bookingPlatformUsed || '—'}</td>
                  <td className="max-w-[220px] px-4 py-3 text-[12.5px] text-(--color-ink-faint)">
                    {lead.businessPain || '—'}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-[12.5px] text-(--color-ink-faint)">
                    {lead.recommendedSolution || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium ${STAGE_BADGE[lead.stage]}`}
                    >
                      {lead.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
