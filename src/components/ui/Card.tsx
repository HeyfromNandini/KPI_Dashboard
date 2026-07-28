import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-card)',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-semibold text-(--color-ink)">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-(--color-ink-faint)">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
