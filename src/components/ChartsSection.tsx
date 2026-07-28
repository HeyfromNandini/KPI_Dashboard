import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { IndustryRow, TimeSeriesPoint } from '../lib/analytics';
import { Card, SectionHeader } from './ui/Card';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e7e7ea',
  boxShadow: '0 12px 24px -8px rgb(17 17 20 / 0.12)',
  fontSize: 12.5,
  padding: '8px 12px',
};

export function ChartsSection({
  series,
  industryRows,
}: {
  series: TimeSeriesPoint[];
  industryRows: IndustryRow[];
}) {
  return (
    <section>
      <SectionHeader title="Trends" subtitle="Leads, responses and meetings over the selected period" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-rise col-span-2 p-5">
          <p className="mb-3 text-[13px] font-medium text-(--color-ink-soft)">
            Leads, Responses &amp; Meetings Over Time
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e7ea" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#8a8a94' }}
                axisLine={{ stroke: '#e7e7ea' }}
                tickLine={false}
                interval={Math.max(0, Math.floor(series.length / 8))}
              />
              <YAxis tick={{ fontSize: 11, fill: '#8a8a94' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
              <Line
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="responses"
                name="Responses"
                stroke="#b45309"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="meetings"
                name="Meetings"
                stroke="#12875a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="animate-rise p-5">
          <p className="mb-3 text-[13px] font-medium text-(--color-ink-soft)">Industry Performance</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={industryRows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e7ea" vertical={false} />
              <XAxis
                dataKey="industry"
                tick={{ fontSize: 10, fill: '#8a8a94' }}
                axisLine={{ stroke: '#e7e7ea' }}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11, fill: '#8a8a94' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="companies" name="Companies" fill="#e7e7ea" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clients" name="Clients" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </section>
  );
}
