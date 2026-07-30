import type { DateRange, PresetKey } from '../types';

function startOfDay(d: Date): Date {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function endOfDay(d: Date): Date {
  const nd = new Date(d);
  nd.setHours(23, 59, 59, 999);
  return nd;
}

function startOfWeek(d: Date): Date {
  const nd = startOfDay(d);
  const day = nd.getDay();
  nd.setDate(nd.getDate() - day);
  return nd;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function rangeForPreset(preset: PresetKey, custom?: DateRange): DateRange {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'week':
      return { from: startOfWeek(now), to: endOfDay(now) };
    case 'month':
      return { from: startOfMonth(now), to: endOfDay(now) };
    case 'custom':
      if (custom) return { from: startOfDay(custom.from), to: endOfDay(custom.to) };
      return { from: startOfMonth(now), to: endOfDay(now) };
  }
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRangeLabel(range: DateRange): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const sameDay = startOfDay(range.from).getTime() === startOfDay(range.to).getTime();
  if (sameDay) return fmt(range.from);
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}
