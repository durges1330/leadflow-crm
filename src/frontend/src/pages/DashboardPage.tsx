import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Layers,
  Loader2,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageCard } from "../components/shared/PageCard";
import { StatCard } from "../components/shared/StatCard";
import { StatusBadge } from "../components/shared/StatusBadge";
import {
  LEAD_SOURCE_CONFIG,
  LEAD_STATUS_CONFIG,
  PIPELINE_STAGES,
} from "../constants";
import {
  useGenerateSampleData,
  useGetConversionFunnel,
  useGetCounselorStats,
  useGetDashboardStats,
  useGetLeadsBySourceCounts,
  useGetOverdueTasks,
  useGetRecentActivities,
  useListLeads,
} from "../hooks/useQueries";
import type { RouteId } from "../types";
import type {
  ActivityEntry,
  ConversionFunnelStage,
  CounselorStat,
} from "../types";
import { formatRelativeTime } from "../utils/dateHelpers";

// ==================== Types ====================
type DateRange = "7d" | "30d" | "90d";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const DATE_RANGE_DAYS: Record<DateRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

// ==================== Sub-components ====================

const ChartTooltip = ({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color?: string }>;
  label?: string;
  valueLabel?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground">
        {valueLabel ?? "Leads"}: {payload[0].value}
      </p>
    </div>
  );
};

const FunnelBar: React.FC<{
  stage: ConversionFunnelStage;
  maxCount: number;
  index: number;
}> = ({ stage, maxCount, index }) => {
  const config = LEAD_STATUS_CONFIG[stage.stage];
  const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
  const FUNNEL_COLORS = [
    "#4f46e5",
    "#06b6d4",
    "#f59e0b",
    "#8b5cf6",
    "#10b981",
    "#3b82f6",
    "#10b981",
    "#ef4444",
    "#94a3b8",
  ];
  const color = FUNNEL_COLORS[index % FUNNEL_COLORS.length] ?? config.color;

  return (
    <div
      className="flex items-center gap-3"
      data-ocid={`dashboard.funnel.stage.${index + 1}`}
    >
      <div className="w-32 flex-shrink-0">
        <StatusBadge status={stage.stage} />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
          <div
            className="h-full rounded-md transition-all duration-700"
            style={{ width: `${width}%`, backgroundColor: color }}
          />
        </div>
        <div className="w-24 flex-shrink-0 flex items-center gap-1.5">
          <span className="text-sm font-bold text-foreground">
            {stage.count}
          </span>
          <span className="text-xs text-muted-foreground">
            ({stage.percentage}%)
          </span>
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ entry: ActivityEntry; index: number }> = ({
  entry,
  index,
}) => {
  const activityIcons: Record<string, React.ReactNode> = {
    LeadCreated: <Zap className="w-3.5 h-3.5 text-indigo-500" />,
    StatusChanged: <Layers className="w-3.5 h-3.5 text-amber-500" />,
    TaskCreated: <Target className="w-3.5 h-3.5 text-violet-500" />,
    TaskCompleted: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    NoteAdded: <BarChart2 className="w-3.5 h-3.5 text-blue-500" />,
    LeadAssigned: <Users className="w-3.5 h-3.5 text-cyan-500" />,
  };
  const icon = activityIcons[entry.activityType] ?? (
    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
  );

  return (
    <div
      data-ocid={`dashboard.activity.item.${index + 1}`}
      className="flex items-start gap-3 py-2.5 group"
    >
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-medium">{entry.userName}</span>{" "}
          <span className="text-muted-foreground">{entry.description}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {entry.leadName} · {formatRelativeTime(entry.timestamp)}
        </p>
      </div>
    </div>
  );
};

const CounselorRow: React.FC<{ stat: CounselorStat; index: number }> = ({
  stat,
  index,
}) => {
  const completionRate =
    stat.followUpsCompleted + stat.followUpsPending > 0
      ? Math.round(
          (stat.followUpsCompleted /
            (stat.followUpsCompleted + stat.followUpsPending)) *
            100,
        )
      : 0;

  return (
    <tr
      data-ocid={`dashboard.counselor.item.${index + 1}`}
      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
    >
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {stat.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            {stat.userName}
          </span>
        </div>
      </td>
      <td className="py-3 pr-4 text-right">
        <span className="text-sm font-semibold text-foreground">
          {stat.totalLeads}
        </span>
      </td>
      <td className="py-3 pr-4 text-right hidden sm:table-cell">
        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          {stat.qualifiedLeads}
        </span>
      </td>
      <td className="py-3 pr-4 text-right hidden md:table-cell">
        <span className="text-sm font-semibold text-foreground">
          {stat.conversions}
        </span>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-0">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-9 flex-shrink-0 text-right">
            {completionRate}%
          </span>
        </div>
      </td>
    </tr>
  );
};

// ==================== Main Page ====================

export const DashboardPage: React.FC<{
  onOpenLead?: (id: string) => void;
  onNavigate?: (route: RouteId) => void;
}> = ({ onOpenLead: _onOpenLead, onNavigate }) => {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: leads = [], isLoading: leadsLoading } = useListLeads();
  const { data: sourceCounts = {} } = useGetLeadsBySourceCounts();
  const { data: funnelRaw = [] } = useGetConversionFunnel();
  const { data: counselorStats = [] } = useGetCounselorStats();
  const { data: overdueTasks = [] } = useGetOverdueTasks();
  const { data: recentActivities = [] } = useGetRecentActivities();
  const { mutate: generateSampleData, isPending: isGenerating } =
    useGenerateSampleData();

  const funnel = funnelRaw as ConversionFunnelStage[];

  // === Lead trend data (derived from leads list) ===
  const trendData = useMemo(() => {
    const days = DATE_RANGE_DAYS[dateRange];
    return Array.from({ length: days }, (_, i) => {
      const day = subDays(new Date(), days - 1 - i);
      const dayStr = format(
        day,
        days <= 7 ? "EEE" : days <= 30 ? "MMM d" : "MMM d",
      );
      const count = leads.filter((l) => {
        const created = new Date(Number(l.createdAt / BigInt(1_000_000)));
        return (
          created.getDate() === day.getDate() &&
          created.getMonth() === day.getMonth() &&
          created.getFullYear() === day.getFullYear()
        );
      }).length;
      return { day: dayStr, leads: count };
    });
  }, [leads, dateRange]);

  // === Source bar chart data ===
  const sourceData = useMemo(() => {
    return Object.entries(sourceCounts)
      .map(([key, count]) => ({
        source:
          LEAD_SOURCE_CONFIG[key as keyof typeof LEAD_SOURCE_CONFIG]?.label ??
          key,
        count,
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [sourceCounts]);

  const funnelMax = funnel.reduce((m, s) => Math.max(m, s.count), 0);
  const totalLeadsCount = stats?.totalLeads ?? leads.length;
  const isLoading = statsLoading || leadsLoading;

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      {/* ===== Header ===== */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your sales performance at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range picker */}
          <div
            className="flex items-center rounded-lg border border-border bg-card overflow-hidden text-xs"
            data-ocid="dashboard.date_range_toggle"
          >
            {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((r) => (
              <button
                key={r}
                type="button"
                data-ocid={`dashboard.date_range.${r}`}
                onClick={() => setDateRange(r)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  dateRange === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {DATE_RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          {leads.length === 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => generateSampleData()}
              disabled={isGenerating}
              data-ocid="dashboard.generate_sample_button"
              className="gap-1.5"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Load sample data
            </Button>
          )}
        </div>
      </div>

      {/* ===== Overdue Tasks Alert ===== */}
      {overdueTasks.length > 0 && (
        <div
          data-ocid="dashboard.overdue_alert"
          className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium flex-1">
            You have{" "}
            <span className="font-bold">
              {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? "s" : ""}
            </span>{" "}
            that need attention.
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.("tasks")}
            className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline"
            data-ocid="dashboard.overdue_alert.tasks_link"
          >
            View tasks <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ===== KPI Cards (4-col → 2-col → 1-col) ===== */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="dashboard.kpi_section"
      >
        {isLoading ? (
          ["kpi-total", "kpi-qualified", "kpi-conversions", "kpi-revenue"].map(
            (key) => (
              <div
                key={key}
                className="bg-card border border-border rounded-xl p-5"
              >
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-28" />
              </div>
            ),
          )
        ) : (
          <>
            <StatCard
              title="Total Leads"
              value={totalLeadsCount.toLocaleString()}
              change="↑ +12% vs last week"
              changeType="positive"
              icon={Users}
              accentColor="border-l-indigo-500"
              data-ocid="dashboard.stat_card.total_leads"
            />
            <StatCard
              title="Qualified Leads"
              value={(stats?.qualifiedLeads ?? 0).toLocaleString()}
              change="↑ +8% vs last week"
              changeType="positive"
              icon={TrendingUp}
              accentColor="border-l-emerald-500"
              data-ocid="dashboard.stat_card.qualified_leads"
            />
            <StatCard
              title="Won Deals"
              value={(stats?.conversions ?? 0).toLocaleString()}
              change={
                stats?.conversions === 0 ? "No deals yet" : "↓ −2% vs last week"
              }
              changeType={stats?.conversions === 0 ? "neutral" : "negative"}
              icon={TrendingDown}
              accentColor="border-l-amber-500"
              data-ocid="dashboard.stat_card.won_deals"
            />
            <StatCard
              title="Open Tasks"
              value={(stats?.followUpsDue ?? 0).toLocaleString()}
              change={
                overdueTasks.length > 0
                  ? `${overdueTasks.length} overdue`
                  : "All on track"
              }
              changeType={overdueTasks.length > 0 ? "negative" : "positive"}
              icon={CheckCircle2}
              accentColor={
                overdueTasks.length > 0
                  ? "border-l-red-500"
                  : "border-l-primary"
              }
              data-ocid="dashboard.stat_card.open_tasks"
            />
          </>
        )}
      </div>

      {/* ===== Charts Row ===== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lead Trend (Line Chart) */}
        <PageCard
          title="Lead Trend"
          description={`Leads created – ${DATE_RANGE_LABELS[dateRange]}`}
        >
          {trendData.every((d) => d.leads === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No leads in this period
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={trendData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="trendGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip valueLabel="Leads" />}
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#4f46e5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </PageCard>

        {/* Lead Source (Bar Chart) */}
        <PageCard
          title="Lead Sources"
          description="Lead count by acquisition channel"
        >
          {sourceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart2 className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No source data yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={sourceData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="source"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip valueLabel="Leads" />}
                  cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
                />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </PageCard>
      </div>

      {/* ===== Conversion Funnel + Activity Feed ===== */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2">
          <PageCard
            title="Conversion Funnel"
            description="Lead counts through each pipeline stage"
          >
            {funnel.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="dashboard.funnel.empty_state"
              >
                <Target className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Pipeline stages will appear once leads are created
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {funnel
                  .filter((s) => PIPELINE_STAGES.includes(s.stage))
                  .map((stage, i) => (
                    <FunnelBar
                      key={stage.stage}
                      stage={stage}
                      maxCount={funnelMax}
                      index={i}
                    />
                  ))}
                {/* Won/Lost summary row */}
                <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border">
                  {funnel
                    .filter((s) => s.stage === "Won" || s.stage === "Lost")
                    .map((s) => (
                      <div key={s.stage} className="flex items-center gap-2">
                        <StatusBadge status={s.stage} />
                        <span className="text-sm font-semibold text-foreground">
                          {s.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </PageCard>
        </div>

        {/* Recent Activity Feed */}
        <div data-ocid="dashboard.activity_feed.panel">
          <PageCard
            title="Recent Activity"
            description="Last 10 actions across all leads"
          >
            {recentActivities.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="dashboard.activity.empty_state"
              >
                <Zap className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Activity will appear here as leads are updated
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentActivities.slice(0, 10).map((entry, i) => (
                  <ActivityItem key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            )}
          </PageCard>
        </div>
      </div>

      {/* ===== Counselor Productivity ===== */}
      <PageCard
        title="Counselor Productivity"
        description="Lead assignments and task completion rates"
      >
        {counselorStats.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="dashboard.counselors.empty_state"
          >
            <Users className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Counselor statistics will appear once leads are assigned
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                    Counselor
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                    Leads
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4 hidden sm:table-cell">
                    Qualified
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4 hidden md:table-cell">
                    Won
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                    Task Completion
                  </th>
                </tr>
              </thead>
              <tbody>
                {counselorStats.map((stat, i) => (
                  <CounselorRow key={stat.userId} stat={stat} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>

      {/* ===== Empty state CTA when no data ===== */}
      {leads.length === 0 && !leadsLoading && (
        <div
          className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-border rounded-xl"
          data-ocid="dashboard.empty_state"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your CRM is ready to go
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm text-center mb-6">
            Start by adding your first lead, importing a CSV, or loading sample
            data to explore the dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => generateSampleData()}
              disabled={isGenerating}
              data-ocid="dashboard.empty_state.generate_button"
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Sample Data
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate?.("leads")}
              data-ocid="dashboard.empty_state.add_lead_button"
            >
              <Users className="w-4 h-4 mr-2" />
              Add a Lead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
