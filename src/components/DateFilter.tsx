import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DayPicker, type DateRange as RDPRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { CalendarDays, ChevronDown } from 'lucide-react';
import type { DateRange, PresetKey } from '../types';
import { formatRangeLabel, rangeForPreset } from '../lib/dateRange';
import clsx from 'clsx';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

interface DateFilterProps {
  preset: PresetKey;
  customRange: DateRange | undefined;
  onChange: (preset: PresetKey, customRange?: DateRange) => void;
}

export function DateFilter({ preset, customRange, onChange }: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RDPRange | undefined>(
    customRange ? { from: customRange.from, to: customRange.to } : undefined,
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const activeRange = rangeForPreset(preset, customRange);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-card)">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={clsx(
              'rounded-full px-3.5 py-1.5 text-sm font-medium cursor-pointer',
              preset === p.key
                ? 'bg-(--color-ink) text-white'
                : 'text-(--color-ink-soft) hover:bg-(--color-surface-hover) hover:text-(--color-ink)',
            )}
          >
            {p.label}
          </button>
        ))}

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium cursor-pointer',
              preset === 'custom'
                ? 'bg-(--color-ink) text-white'
                : 'text-(--color-ink-soft) hover:bg-(--color-surface-hover) hover:text-(--color-ink)',
            )}
          >
            <CalendarDays size={15} />
            {preset === 'custom' ? formatRangeLabel(activeRange) : 'Custom'}
            <ChevronDown size={14} className={clsx('transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div
              ref={popoverRef}
              className="animate-rise absolute right-0 z-20 mt-2 flex max-h-[min(28rem,80vh)] w-max flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 shadow-(--shadow-pop)"
            >
              <div className="overflow-y-auto">
                <DayPicker
                  mode="range"
                  selected={draft}
                  onSelect={setDraft}
                  defaultMonth={draft?.from ?? new Date()}
                  numberOfMonths={1}
                  className="text-sm"
                  style={
                    {
                      '--rdp-day-width': '32px',
                      '--rdp-day-height': '32px',
                      '--rdp-day_button-width': '30px',
                      '--rdp-day_button-height': '30px',
                      '--rdp-nav-height': '2rem',
                    } as CSSProperties
                  }
                />
              </div>
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-(--color-border) pt-2.5">
                <span className="text-xs text-(--color-ink-faint)">
                  {draft?.from
                    ? formatRangeLabel({ from: draft.from, to: draft.to ?? draft.from })
                    : 'Select a start date (and optionally an end date)'}
                </span>
                <button
                  disabled={!draft?.from}
                  onClick={() => {
                    if (draft?.from) {
                      onChange('custom', { from: draft.from, to: draft.to ?? draft.from });
                      setOpen(false);
                    }
                  }}
                  className="cursor-pointer rounded-lg bg-(--color-accent) px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <span className="text-xs text-(--color-ink-faint)">
        Showing <span className="font-medium text-(--color-ink-soft)">{formatRangeLabel(activeRange)}</span>
      </span>
    </div>
  );
}
