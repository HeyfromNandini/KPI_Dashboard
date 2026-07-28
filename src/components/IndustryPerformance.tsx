import type { IndustryRow } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

export function IndustryPerformance({ rows }: { rows: IndustryRow[] }) {
  const maxClients = Math.max(1, ...rows.map((r) => r.clients));

  return (
    <section>
      <SectionHeader title="Industry Performance" subtitle="Which industries generate the best results" />
      <Card className="animate-rise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-[12px] text-(--color-ink-faint)">
                <th className="px-4 py-3 font-medium">Industry</th>
                <th className="px-4 py-3 font-medium">Companies</th>
                <th className="px-4 py-3 font-medium">Responses</th>
                <th className="px-4 py-3 font-medium">Meetings</th>
                <th className="px-4 py-3 font-medium">Clients</th>
                <th className="px-4 py-3 font-medium">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-(--color-ink-faint)">
                    No data for the selected period.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const winRate = row.companies > 0 ? (row.clients / row.companies) * 100 : 0;
                return (
                  <tr
                    key={row.industry}
                    className="border-b border-(--color-border) last:border-b-0 hover:bg-(--color-surface-hover)"
                  >
                    <td className="px-4 py-3 font-medium text-(--color-ink)">{row.industry}</td>
                    <td className="px-4 py-3 text-(--color-ink-soft)">{row.companies}</td>
                    <td className="px-4 py-3 text-(--color-ink-soft)">{row.responses}</td>
                    <td className="px-4 py-3 text-(--color-ink-soft)">{row.meetings}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-medium text-(--color-ink)">{row.clients}</span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-(--color-canvas)">
                          <div
                            className="h-full rounded-full bg-(--color-success)"
                            style={{ width: `${(row.clients / maxClients) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-(--color-ink-soft)">{winRate.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
