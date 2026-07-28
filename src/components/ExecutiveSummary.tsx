import {
  Users,
  Search,
  Mail,
  RefreshCw,
  MessageSquareReply,
  CalendarCheck2,
  FileText,
  Trophy,
} from 'lucide-react';
import type { ExecutiveSummary as Summary } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

interface KpiDef {
  key: keyof Summary;
  label: string;
  icon: typeof Users;
  tone: string;
}

const KPI_DEFS: KpiDef[] = [
  { key: 'newLeads', label: 'New Leads', icon: Users, tone: 'text-(--color-accent)' },
  { key: 'companiesResearched', label: 'Companies Researched', icon: Search, tone: 'text-(--color-accent)' },
  { key: 'emailsSent', label: 'Emails Sent', icon: Mail, tone: 'text-(--color-ink-soft)' },
  { key: 'followUpsSent', label: 'Follow-ups Sent', icon: RefreshCw, tone: 'text-(--color-ink-soft)' },
  { key: 'responsesReceived', label: 'Responses Received', icon: MessageSquareReply, tone: 'text-(--color-warning)' },
  { key: 'meetingsScheduled', label: 'Meetings Scheduled', icon: CalendarCheck2, tone: 'text-(--color-warning)' },
  { key: 'proposalsSent', label: 'Proposals Sent', icon: FileText, tone: 'text-(--color-success)' },
  { key: 'clientsWon', label: 'Clients Won', icon: Trophy, tone: 'text-(--color-success)' },
];

export function ExecutiveSummary({ summary }: { summary: Summary }) {
  return (
    <section>
      <SectionHeader
        title="Executive Summary"
        subtitle="Instant overview of performance for the selected period"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {KPI_DEFS.map((def, i) => {
          const Icon = def.icon;
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
              <div className="mt-2 text-2xl font-semibold tracking-tight text-(--color-ink)">
                {summary[def.key].toLocaleString()}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
