import { Sparkles, AlertTriangle, Wrench } from 'lucide-react';
import type { AutoInsights as Insights } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

const FIELD_META = [
  { key: 'wins' as const, label: 'Wins', icon: Sparkles, tone: 'text-(--color-success)', bg: 'bg-(--color-success-soft)' },
  { key: 'bottlenecks' as const, label: 'Bottlenecks', icon: AlertTriangle, tone: 'text-(--color-warning)', bg: 'bg-(--color-warning-soft)' },
  {
    key: 'improvementActions' as const,
    label: 'Improvement Actions',
    icon: Wrench,
    tone: 'text-(--color-accent)',
    bg: 'bg-(--color-accent-soft)',
  },
];

export function AutoInsights({ insights }: { insights: Insights }) {
  return (
    <section>
      <SectionHeader
        title="Insights"
        subtitle="Auto-generated from real lead data for the selected period vs. the period before it"
      />
      <Card className="animate-rise grid gap-3 p-5 sm:grid-cols-3">
        {FIELD_META.map((field) => {
          const Icon = field.icon;
          const items = insights[field.key];
          return (
            <div key={field.key}>
              <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${field.bg}`}>
                <Icon size={13} className={field.tone} />
                <span className={`text-[11.5px] font-semibold ${field.tone}`}>{field.label}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-(--color-border) bg-(--color-canvas) p-3 text-[13px] leading-relaxed text-(--color-ink-soft)"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Card>
    </section>
  );
}
