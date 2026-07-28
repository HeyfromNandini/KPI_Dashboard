import { Card, SectionHeader } from './ui/Card';

interface Target {
  label: string;
  value: number;
  target: number;
  unit?: string;
}

export function ProgressTargets({ targets }: { targets: Target[] }) {
  return (
    <section>
      <SectionHeader title="Progress Against Monthly Targets" subtitle="How this period tracks toward the monthly goal" />
      <Card className="animate-rise grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {targets.map((t) => {
          const pct = Math.min(100, (t.value / t.target) * 100);
          const over = t.value >= t.target;
          return (
            <div key={t.label}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-(--color-ink-soft)">{t.label}</span>
                <span className="text-[13px] font-semibold text-(--color-ink)">
                  {t.value}
                  <span className="text-(--color-ink-faint)"> / {t.target}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-canvas)">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                    over ? 'bg-(--color-success)' : 'bg-(--color-accent)'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1.5 text-[11.5px] text-(--color-ink-faint)">{pct.toFixed(0)}% of target</div>
            </div>
          );
        })}
      </Card>
    </section>
  );
}
