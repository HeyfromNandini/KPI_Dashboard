import type { LeadStage } from '../types';
import { Card, SectionHeader } from './ui/Card';

const STAGE_ORDER: LeadStage[] = [
  'New Lead',
  'Contacted',
  'Responded',
  'Meeting Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

const STAGE_COLOR: Record<LeadStage, string> = {
  'New Lead': 'bg-(--color-ink-faint)',
  Contacted: 'bg-(--color-accent)',
  Responded: 'bg-indigo-400',
  'Meeting Scheduled': 'bg-(--color-warning)',
  'Proposal Sent': 'bg-amber-400',
  Won: 'bg-(--color-success)',
  Lost: 'bg-(--color-danger)',
};

export function Pipeline({ counts }: { counts: Record<LeadStage, number> }) {
  const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));

  return (
    <section>
      <SectionHeader title="Pipeline" subtitle="Where current opportunities sit in the process" />
      <Card className="animate-rise p-5">
        <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-(--color-canvas)">
          {STAGE_ORDER.map((stage) => {
            const pct = (counts[stage] / total) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={stage}
                className={`${STAGE_COLOR[stage]} h-full`}
                style={{ width: `${pct}%` }}
                title={`${stage}: ${counts[stage]}`}
              />
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {STAGE_ORDER.map((stage) => (
            <div key={stage} className="rounded-xl bg-(--color-canvas) p-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STAGE_COLOR[stage]}`} />
                <span className="text-[11.5px] font-medium text-(--color-ink-faint)">{stage}</span>
              </div>
              <div className="mt-1.5 text-xl font-semibold text-(--color-ink)">{counts[stage]}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
