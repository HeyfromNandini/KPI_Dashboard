import type { CampaignRow } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

export function CampaignPerformance({ rows }: { rows: CampaignRow[] }) {
  return (
    <section>
      <SectionHeader title="Campaign Performance" subtitle="How each outreach campaign is performing" />
      <Card className="animate-rise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-[12px] text-(--color-ink-faint)">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Industry</th>
                <th className="px-4 py-3 font-medium">AI Workflow</th>
                <th className="px-4 py-3 font-medium">Companies</th>
                <th className="px-4 py-3 font-medium">Responses</th>
                <th className="px-4 py-3 font-medium">Meetings</th>
                <th className="px-4 py-3 font-medium">Clients</th>
                <th className="px-4 py-3 font-medium">Lessons Learned</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-(--color-ink-faint)">
                    No campaign activity for the selected period.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr
                  key={row.campaign.id}
                  className="border-b border-(--color-border) last:border-b-0 hover:bg-(--color-surface-hover)"
                >
                  <td className="px-4 py-3 font-medium text-(--color-ink)">{row.campaign.name}</td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">{row.campaign.industry}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-(--color-accent-soft) px-2 py-0.5 text-[12px] font-medium text-(--color-accent)">
                      {row.campaign.aiWorkflow}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">{row.companies}</td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">{row.responses}</td>
                  <td className="px-4 py-3 text-(--color-ink-soft)">{row.meetings}</td>
                  <td className="px-4 py-3 font-medium text-(--color-ink)">{row.clients}</td>
                  <td className="max-w-[260px] px-4 py-3 text-[12.5px] text-(--color-ink-faint)">
                    {row.campaign.lessonsLearned}
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
