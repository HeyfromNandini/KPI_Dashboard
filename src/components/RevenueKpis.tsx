import { Banknote, Handshake, Target, TrendingUp } from 'lucide-react';
import type { RevenueSummary } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function RevenueKpis({ revenue }: { revenue: RevenueSummary }) {
  const cards = [
    {
      label: 'Pipeline Value',
      value: formatCurrency(revenue.pipelineValue),
      hint: 'Open proposals in period',
      icon: Target,
      tone: 'text-(--color-accent)',
    },
    {
      label: 'Revenue Won',
      value: formatCurrency(revenue.revenueWon),
      hint: 'Closed-won value in period',
      icon: Banknote,
      tone: 'text-(--color-success)',
    },
    {
      label: 'Deals Won',
      value: revenue.dealsWon.toLocaleString(),
      hint: `Avg. deal size ${formatCurrency(revenue.avgDealSize)}`,
      icon: Handshake,
      tone: 'text-(--color-success)',
    },
    {
      label: 'Win Rate',
      value: revenue.winRate !== null ? `${revenue.winRate.toFixed(0)}%` : '—',
      hint: 'Won vs. won + lost proposals',
      icon: TrendingUp,
      tone: 'text-(--color-warning)',
    },
  ];

  return (
    <section>
      <SectionHeader
        title="Revenue"
        subtitle="Pipeline value and revenue generated for the selected period"
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.label}
              className="animate-rise p-4"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-(--color-ink-faint)">{c.label}</span>
                <Icon size={16} className={c.tone} strokeWidth={2} />
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-(--color-ink)">{c.value}</div>
              <div className="mt-1 text-[11.5px] text-(--color-ink-faint)">{c.hint}</div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
