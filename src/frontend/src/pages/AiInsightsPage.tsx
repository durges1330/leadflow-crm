import { Badge } from "@/components/ui/badge";
import { Bot, Lightbulb, TrendingUp, Zap } from "lucide-react";
import type React from "react";
import { PageCard } from "../components/shared/PageCard";
import { StatCard } from "../components/shared/StatCard";
import { useListLeads } from "../hooks/useQueries";

export const AiInsightsPage: React.FC = () => {
  const { data: leads = [] } = useListLeads();

  const avgScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((a, l) => a + (l.aiScore || 0), 0) / leads.length,
        )
      : 0;

  const highPriority = leads.filter((l) => l.aiScore >= 70).length;

  const sentimentCounts = leads.reduce(
    (acc, l) => {
      const s = l.aiSentiment || "Unknown";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6" data-ocid="ai-insights.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          AI Insights
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Intelligent recommendations powered by AI
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg AI Score"
          value={avgScore}
          icon={Bot}
          accentColor="border-l-violet-500"
          data-ocid="ai-insights.stat_card.avg_score"
        />
        <StatCard
          title="High Priority"
          value={highPriority}
          change="Score ≥ 70"
          changeType="positive"
          icon={Zap}
          accentColor="border-l-amber-500"
          data-ocid="ai-insights.stat_card.high_priority"
        />
        <StatCard
          title="Total Analyzed"
          value={leads.length}
          icon={TrendingUp}
          accentColor="border-l-indigo-500"
          data-ocid="ai-insights.stat_card.total_analyzed"
        />
        <StatCard
          title="Positive Sentiment"
          value={sentimentCounts.Positive ?? 0}
          icon={Lightbulb}
          accentColor="border-l-emerald-500"
          data-ocid="ai-insights.stat_card.positive_sentiment"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PageCard title="Lead Sentiment Distribution">
          {Object.keys(sentimentCounts).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sentiment data yet. Add leads with AI analysis to see results.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(sentimentCounts).map(([sentiment, count]) => (
                <div
                  key={sentiment}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {sentiment}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {count} leads
                  </span>
                </div>
              ))}
            </div>
          )}
        </PageCard>

        <PageCard title="Top Recommended Actions">
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add leads to receive AI-powered next action recommendations.
            </p>
          ) : (
            <div className="space-y-3">
              {leads
                .filter((l) => l.aiNextAction)
                .slice(0, 5)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg"
                  >
                    <Bot className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {lead.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lead.aiNextAction}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {lead.aiScore}/100
                    </Badge>
                  </div>
                ))}
              {leads.filter((l) => l.aiNextAction).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No AI recommendations available yet.
                </p>
              )}
            </div>
          )}
        </PageCard>
      </div>
    </div>
  );
};
