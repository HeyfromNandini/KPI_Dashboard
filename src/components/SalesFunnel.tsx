import type { FunnelStage } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';
import { ArrowRight } from 'lucide-react';

export function SalesFunnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <section>
      <SectionHeader title="Sales Funnel" subtitle="Where leads are dropping off in the selected period" />
      <Card className="animate-rise p-5">
        <div className="flex flex-col gap-0 md:flex-row md:items-stretch md:gap-2">
          {stages.map((stage, i) => {
            const prev = i > 0 ? stages[i - 1].count : null;
            const conversion = prev && prev > 0 ? (stage.count / prev) * 100 : null;
            const widthPct = Math.max(8, (stage.count / max) * 100);

            return (
              <div key={stage.label} className="flex flex-1 items-center gap-2">
                <div className="flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[12.5px] font-medium text-(--color-ink-soft)">{stage.label}</span>
                  </div>
                  <div className="relative h-9 overflow-hidden rounded-lg bg-(--color-canvas)">
                    <div
                      className="animate-rise flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-(--color-accent) to-(--color-accent) px-3 text-sm font-semibold text-white"
                      style={{ width: `${widthPct}%`, opacity: 0.9 - i * 0.06, animationDelay: `${i * 60}ms` }}
                    >
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                  {conversion !== null && (
                    <div className="mt-1.5 text-[11px] text-(--color-ink-faint)">
                      {conversion.toFixed(0)}% from previous
                    </div>
                  )}
                </div>
                {i < stages.length - 1 && (
                  <ArrowRight
                    size={16}
                    className="hidden shrink-0 text-(--color-border-strong) md:block"
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
