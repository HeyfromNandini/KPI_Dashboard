import {
  Users,
  Search,
  Mail,
  RefreshCw,
  MessageSquareReply,
  CalendarCheck2,
  FileText,
  Trophy,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { ExecutiveSummary as Summary, FunnelStage } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

interface KpiDef {
  key: keyof Summary;
  label: string;
  icon: typeof Users;
  tone: string;
  /** Label of the matching funnel stage, if this metric is a step in the conversion funnel. */
  funnelLabel?: string;
}

const KPI_DEFS: KpiDef[] = [
  { key: 'newLeads', label: 'New Leads', icon: Users, tone: 'text-(--color-accent)' },
  {
    key: 'companiesResearched',
    label: 'Companies Researched',
    icon: Search,
    tone: 'text-(--color-accent)',
    funnelLabel: 'Companies Identified',
  },
  {
    key: 'emailsSent',
    label: 'Emails Sent',
    icon: Mail,
    tone: 'text-(--color-ink-soft)',
    funnelLabel: 'Emails Sent',
  },
  { key: 'followUpsSent', label: 'Follow-ups Sent', icon: RefreshCw, tone: 'text-(--color-ink-soft)' },
  {
    key: 'responsesReceived',
    label: 'Responses Received',
    icon: MessageSquareReply,
    tone: 'text-(--color-warning)',
    funnelLabel: 'Responses Received',
  },
  {
    key: 'meetingsScheduled',
    label: 'Meetings Scheduled',
    icon: CalendarCheck2,
    tone: 'text-(--color-warning)',
    funnelLabel: 'Meetings Scheduled',
  },
  {
    key: 'proposalsSent',
    label: 'Proposals Sent',
    icon: FileText,
    tone: 'text-(--color-success)',
    funnelLabel: 'Proposals Sent',
  },
  {
    key: 'clientsWon',
    label: 'Clients Won',
    icon: Trophy,
    tone: 'text-(--color-success)',
    funnelLabel: 'Clients Won',
  },
];

export function ExecutiveSummary({ summary, funnel }: { summary: Summary; funnel: FunnelStage[] }) {
  const conversionByLabel = new Map<string, number | null>();
  funnel.forEach((stage, i) => {
    const prev = i > 0 ? funnel[i - 1].count : null;
    conversionByLabel.set(stage.label, prev && prev > 0 ? (stage.count / prev) * 100 : null);
  });

  return (
    <section>
      <SectionHeader
        title="Executive Summary"
        subtitle="Instant overview of performance, and where leads drop off, for the selected period"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {KPI_DEFS.map((def, i) => {
          const Icon = def.icon;
          const conversion = def.funnelLabel ? conversionByLabel.get(def.funnelLabel) : undefined;

          return (
            <Card
              key={def.key}
              className="animate-rise group p-4 transition-transform hover:-translate-y-0.5 hover:shadow-(--shadow-pop)"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-(--color-ink-faint)">{def.label}</span>
                <Icon size={16} className={def.tone} strokeWidth={2} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight text-(--color-ink)">
                  {summary[def.key].toLocaleString()}
                </span>
                {conversion !== undefined && conversion !== null && (
                  <span
                    className={
                      conversion >= 100
                        ? 'flex items-center gap-0.5 text-[11px] font-medium text-(--color-success)'
                        : 'flex items-center gap-0.5 text-[11px] font-medium text-(--color-danger)'
                    }
                  >
                    {conversion >= 100 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {conversion.toFixed(0)}% of prev. stage
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
