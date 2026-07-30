import { ArrowDown } from 'lucide-react';
import type { FunnelStage } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

const BAR_COLORS = [
  '#4f46e5',
  '#6355e8',
  '#7d63ea',
  '#b45309',
  '#d4830a',
  '#12875a',
];

export function FunnelConversion({ funnel }: { funnel: FunnelStage[] }) {
  const maxCount = Math.max(1, ...funnel.map((s) => s.count));
  const overall = funnel.length > 0 ? funnel[funnel.length - 1].conversionFromFirst : null;

  return (
    <section>
      <SectionHeader
        title="Funnel Conversion"
        subtitle="Stage-to-stage conversion rate, so drop-off points are easy to spot"
        action={
          overall !== null && (
            <div className="rounded-full bg-(--color-accent-soft) px-3 py-1 text-[12px] font-medium text-(--color-accent)">
              {overall.toFixed(1)}% Leads → Clients
            </div>
          )
        }
      />
      <Card className="animate-rise p-5">
        <div className="flex flex-col">
          {funnel.map((stage, i) => {
            const widthPct = Math.max(6, (stage.count / maxCount) * 100);
            return (
              <div key={stage.label}>
                {i > 0 && (
                  <div className="flex items-center gap-2 py-1.5 pl-1">
                    <ArrowDown size={13} className="text-(--color-ink-faint)" />
                    <span
                      className={`text-[12px] font-semibold ${
                        stage.conversionFromPrev !== null && stage.conversionFromPrev < 40
                          ? 'text-(--color-danger)'
                          : 'text-(--color-ink-soft)'
                      }`}
                    >
                      {stage.conversionFromPrev !== null ? `${stage.conversionFromPrev.toFixed(0)}%` : '—'} converted
                    </span>
                    <span className="text-[11.5px] text-(--color-ink-faint)">
                      from {funnel[i - 1].label}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-[132px] shrink-0 text-[13px] font-medium text-(--color-ink-soft)">
                    {stage.label}
                  </div>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-(--color-canvas)">
                    <div
                      className="flex h-full items-center justify-end rounded-lg pr-2.5 transition-[width] duration-700 ease-out"
                      style={{ width: `${widthPct}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                    >
                      <span className="text-[12.5px] font-semibold text-white">{stage.count}</span>
                    </div>
                  </div>
                  <div className="w-14 shrink-0 text-right text-[12px] text-(--color-ink-faint)">
                    {stage.conversionFromFirst !== null ? `${stage.conversionFromFirst.toFixed(0)}%` : '100%'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
