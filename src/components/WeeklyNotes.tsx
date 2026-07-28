import { useState } from 'react';
import type { WeeklyReview } from '../types';
import { Card, SectionHeader } from './ui/Card';
import { Sparkles, AlertTriangle, Wrench, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const FIELD_META = [
  { key: 'wins' as const, label: 'Wins', icon: Sparkles, tone: 'text-(--color-success)', bg: 'bg-(--color-success-soft)' },
  { key: 'bottlenecks' as const, label: 'Bottlenecks', icon: AlertTriangle, tone: 'text-(--color-warning)', bg: 'bg-(--color-warning-soft)' },
  { key: 'improvementActions' as const, label: 'Improvement Actions', icon: Wrench, tone: 'text-(--color-accent)', bg: 'bg-(--color-accent-soft)' },
];

export function WeeklyNotes({ reviews }: { reviews: WeeklyReview[] }) {
  const [entries, setEntries] = useState(reviews);
  const [expanded, setExpanded] = useState<string | null>(reviews[0]?.week ?? null);

  function updateField(week: string, field: 'wins' | 'bottlenecks' | 'improvementActions', value: string) {
    setEntries((prev) => prev.map((e) => (e.week === week ? { ...e, [field]: value } : e)));
  }

  return (
    <section>
      <SectionHeader title="Weekly Notes" subtitle="Free-form reflections captured each week" />
      <div className="flex flex-col gap-3">
        {entries.map((review, idx) => {
          const isOpen = expanded === review.week;
          return (
            <Card key={review.week} className="animate-rise overflow-hidden" style={{ animationDelay: `${idx * 40}ms` }}>
              <button
                onClick={() => setExpanded(isOpen ? null : review.week)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-3.5 text-left hover:bg-(--color-surface-hover)"
              >
                <span className="text-sm font-semibold text-(--color-ink)">Week of {review.week}</span>
                <ChevronDown
                  size={16}
                  className={clsx('text-(--color-ink-faint) transition-transform', isOpen && 'rotate-180')}
                />
              </button>
              <div
                className={clsx(
                  'grid transition-[grid-template-rows] duration-300 ease-out',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-3 border-t border-(--color-border) p-5 sm:grid-cols-3">
                    {FIELD_META.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key}>
                          <div className={clsx('mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1', field.bg)}>
                            <Icon size={13} className={field.tone} />
                            <span className={clsx('text-[11.5px] font-semibold', field.tone)}>{field.label}</span>
                          </div>
                          <textarea
                            value={review[field.key]}
                            onChange={(e) => updateField(review.week, field.key, e.target.value)}
                            rows={4}
                            className="w-full resize-none rounded-xl border border-(--color-border) bg-(--color-canvas) p-3 text-[13px] leading-relaxed text-(--color-ink) outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-ring)"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
