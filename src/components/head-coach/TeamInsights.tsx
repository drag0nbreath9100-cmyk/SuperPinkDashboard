"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    TrendingUp,
    TrendingDown,
    Target,
    Users,
    Award,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface InsightItem {
    title: string;
    value: string;
    trend?: { value: number; up: boolean };
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export function TeamInsights() {
    const [insights, setInsights] = useState<InsightItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInsights() {
            try {
                const [coaches, clients, churnRisks] = await Promise.all([
                    api.getCoaches(),
                    api.getClients(),
                    api.getChurnRiskReport()
                ]);

                // Calculate insights
                const activeClients = clients.filter(c => c.status === 'active').length;
                const retentionRate = clients.length > 0
                    ? Math.round((activeClients / clients.length) * 100)
                    : 100;

                const avgClientsPerCoach = coaches.length > 0
                    ? Math.round(clients.length / coaches.length)
                    : 0;

                const topPerformer = coaches.reduce((best, coach) =>
                    (coach.rating || 0) > (best.rating || 0) ? coach : best
                    , coaches[0]);

                setInsights([
                    {
                        title: "Client Retention",
                        value: `${retentionRate}%`,
                        trend: { value: 2.3, up: true },
                        icon: Target,
                        color: "emerald"
                    },
                    {
                        title: "Avg. Clients/Coach",
                        value: String(avgClientsPerCoach),
                        trend: { value: 5, up: true },
                        icon: Users,
                        color: "indigo"
                    },
                    {
                        title: "Churn Risk",
                        value: String(churnRisks.length),
                        trend: { value: 1.2, up: false },
                        icon: TrendingDown,
                        color: "rose"
                    },
                    {
                        title: "Top Performer",
                        value: topPerformer?.name?.split(' ')[0] || "N/A",
                        icon: Award,
                        color: "amber"
                    }
                ]);
            } catch (error) {
                console.error("Failed to load insights", error);
            } finally {
                setLoading(false);
            }
        }
        loadInsights();
    }, []);

    const colorStyles: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    };

    if (loading) {
        return (
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse h-24" />
                    ))}
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/10">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="font-bold text-white">Team Insights</h3>
            </div>

            {/* Insights Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
                {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                        <div
                            key={index}
                            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={cn(
                                    "p-1.5 rounded-lg border",
                                    colorStyles[insight.color]
                                )}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                {insight.trend && (
                                    <div className={cn(
                                        "flex items-center gap-0.5 text-[10px] font-bold",
                                        insight.trend.up ? "text-emerald-400" : "text-rose-400"
                                    )}>
                                        {insight.trend.up ? (
                                            <TrendingUp className="w-3 h-3" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3" />
                                        )}
                                        {insight.trend.value}%
                                    </div>
                                )}
                            </div>
                            <div className="text-xl font-bold text-white">{insight.value}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {insight.title}
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
}
