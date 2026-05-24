import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Clock3, HardDrive, Tickets, Users } from 'lucide-react';

type Kpi = {
  label: string;
  value: string;
  trend: string;
  icon: typeof HardDrive;
};

const operationalKpis: Kpi[] = [
  { label: 'Open tickets', value: '24', trend: '+12% vs last week', icon: Tickets },
  { label: 'Assets active', value: '128', trend: '+8 inventory updates', icon: HardDrive },
  { label: 'Technicians online', value: '08', trend: '2 on-call shifts', icon: Users },
  { label: 'Avg. response', value: '14m', trend: '-3m from baseline', icon: Clock3 },
];

const ticketStatus = [
  { label: 'OPEN', value: 18, tone: 'bg-cyan-400/70' },
  { label: 'IN PROGRESS', value: 9, tone: 'bg-amber-300/70' },
  { label: 'RESOLVED', value: 31, tone: 'bg-emerald-400/70' },
  { label: 'CLOSED', value: 72, tone: 'bg-zinc-400/70' },
];

const assetHealth = [
  { label: 'Laptops', total: 84, note: '9 assigned for maintenance' },
  { label: 'Monitors', total: 52, note: '2 pending replacement' },
  { label: 'Peripherals', total: 31, note: '4 awaiting review' },
  { label: 'Servers', total: 11, note: '100% monitored' },
];

const recentEvents = [
  'Ticket #421 opened by employee profile',
  'Asset 10001 moved to maintenance',
  'Comment added to incident thread',
  'Priority escalation requested for network outage',
];

const DashboardPage = () => {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
      <div className="grid gap-6">
        <Card className="overflow-hidden border-white/10 bg-white/5">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge>Operational Overview</Badge>
                <CardTitle className="mt-4 text-3xl">Analytical dashboard for corporate support</CardTitle>
                <CardDescription className="mt-2 max-w-2xl">
                  Server-rendered snapshot focused on assets, tickets and service throughput with a secure shell around the logged-in session.
                </CardDescription>
              </div>
              <div className="hidden rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100 md:block">
                <ArrowUpRight className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {operationalKpis.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div key={metric.label} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">{metric.label}</p>
                      <Icon className="size-4 text-cyan-300" />
                    </div>
                    <p className="mt-4 text-4xl font-semibold tracking-tight text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-zinc-400">{metric.trend}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge>Ticket flow</Badge>
              <CardTitle>Lifecycle distribution</CardTitle>
              <CardDescription>Volume by status across the current support queue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketStatus.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-zinc-300">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${Math.min(item.value * 1.1, 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Asset health</Badge>
              <CardTitle>Corporate inventory summary</CardTitle>
              <CardDescription>Registered device families and operational notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assetHealth.map((asset) => (
                <div key={asset.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-white">{asset.label}</p>
                    <span className="text-sm text-cyan-200">{asset.total}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{asset.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="h-fit xl:sticky xl:top-6">
        <CardHeader>
          <Badge>Activity feed</Badge>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Latest movements and operational signals from the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEvents.map((entry, index) => (
            <div key={entry} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-300/20">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-zinc-300">{entry}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
