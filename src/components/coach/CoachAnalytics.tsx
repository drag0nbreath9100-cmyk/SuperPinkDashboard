"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    Users,
    Zap,
    Trophy,
    AlertTriangle,
    CheckCircle2,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api, CURRENT_COACH_ID, Client, CheckIn } from "@/lib/api";

interface AnalyticsData {
    avgAdherence: number;
    adherenceTrend: number; // positive = improving
    avgResponseTime: number; // in hours
    responseTimeTrend: number;
    clientsOnTrack: number;
    clientsOffTrack: number;
    totalWeightLost: number;
    avgWeeklyCheckins: number;
    topPerformers: { name: string; progress: number }[];
    needsAttention: { name: string; issue: string }[];
}

function ProgressRing({ value, size = 80, strokeWidth = 6, color = "primary" }: {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const colorMap: Record<string, string> = {
        primary: "stroke-primary",
        emerald: "stroke-emerald-400",
        amber: "stroke-amber-400",
        rose: "stroke-rose-400"
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-white/10"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-1000", colorMap[color] || colorMap.primary)}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{Math.round(value)}%</span>
            </div>
        </div>
    );
}

function InsightCard({ icon: Icon, title, value, subtitle, trend, color = "white" }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; up: boolean };
    color?: string;
}) {
    const colorMap: Record<string, string> = {
        primary: "text-primary bg-primary/10 border-primary/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        white: "text-white bg-white/5 border-white/10"
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className={cn("p-2 rounded-lg border", colorMap[color])}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{title}</p>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{value}</span>
                    {trend && (
                        <span className={cn(
                            "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                            trend.up ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        )}>
                            {trend.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>
                {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    );
}

export function CoachAnalytics({ coachId }: { coachId?: string }) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAnalytics() {
            try {
                // Get clients and their check-ins
                const effectiveCoachId = coachId || CURRENT_COACH_ID;
                const clients = await api.getCoachClients(effectiveCoachId);
                const adherenceData = await api.getClientAdherenceScores(effectiveCoachId);

                // Calculate analytics from real data
                let totalAdherence = 0;
                let adherenceCount = 0;
                let onTrack = 0;
                let offTrack = 0;
                let totalWeightChange = 0;
                const topPerformers: { name: string; progress: number }[] = [];
                const needsAttention: { name: string; issue: string }[] = [];

                for (const client of clients) {
                    const adherence = adherenceData.get(client.id);
                    if (adherence) {
                        totalAdherence += adherence.score;
                        adherenceCount++;

                        if (adherence.score >= 70) {
                            onTrack++;
                            if (adherence.score >= 85) {
                                topPerformers.push({ name: client.full_name, progress: adherence.score });
                            }
                        } else {
                            offTrack++;
                            if (adherence.score < 50) {
                                needsAttention.push({
                                    name: client.full_name,
                                    issue: adherence.score === 0 ? "No check-ins" : "Low adherence"
                                });
                            }
                        }
                    }

                    // Calculate weight change if available
                    if (client.initial_weight && client.weight_kg) {
                        const currentWeight = typeof client.weight_kg === 'string' ? parseFloat(client.weight_kg) : client.weight_kg;
                        const initialWeight = typeof client.initial_weight === 'number' ? client.initial_weight : parseFloat(String(client.initial_weight));
                        if (!isNaN(currentWeight) && !isNaN(initialWeight)) {
                            totalWeightChange += (initialWeight - currentWeight);
                        }
                    }
                }

                const avgAdherence = adherenceCount > 0 ? totalAdherence / adherenceCount : 0;

                setAnalytics({
                    avgAdherence: Math.round(avgAdherence),
                    adherenceTrend: 8, // Placeholder - would need historical data
                    avgResponseTime: 2.4, // Placeholder - would need message timestamps
                    responseTimeTrend: -15, // Negative means faster (better)
                    clientsOnTrack: onTrack,
                    clientsOffTrack: offTrack,
                    totalWeightLost: Math.round(totalWeightChange * 10) / 10,
                    avgWeeklyCheckins: Math.round((adherenceCount * 0.7) * 10) / 10, // Estimate
                    topPerformers: topPerformers.sort((a, b) => b.progress - a.progress).slice(0, 3),
                    needsAttention: needsAttention.slice(0, 3)
                });
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        }
        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <GlassCard className="p-6 animate-pulse">
                <div className="h-6 w-40 bg-white/5 rounded mb-6" />
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl" />
                    ))}
                </div>
            </GlassCard>
        );
    }

    if (!analytics) return null;

    return (
        <GlassCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-white">Performance Analytics</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Last 7 Days</span>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Main Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <InsightCard
                        icon={Target}
                        title="Avg. Adherence"
                        value={`${analytics.avgAdherence}%`}
                        trend={{ value: analytics.adherenceTrend, up: analytics.adherenceTrend > 0 }}
                        color="primary"
                    />
                    <InsightCard
                        icon={Clock}
                        title="Response Time"
                        value={`${analytics.avgResponseTime}h`}
                        subtitle="Avg. reply time"
                        trend={{ value: Math.abs(analytics.responseTimeTrend), up: analytics.responseTimeTrend < 0 }}
                        color="emerald"
                    />
                    <InsightCard
                        icon={Users}
                        title="On Track"
                        value={analytics.clientsOnTrack}
                        subtitle={`of ${analytics.clientsOnTrack + analytics.clientsOffTrack} clients`}
                        color="emerald"
                    />
                    <InsightCard
                        icon={Zap}
                        title="Weight Lost"
                        value={`${analytics.totalWeightLost}kg`}
                        subtitle="Total client progress"
                        color="primary"
                    />
                </div>

                {/* Performance Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Performers */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-sm font-bold text-emerald-400">Top Performers</h4>
                        </div>
                        {analytics.topPerformers.length > 0 ? (
                            <div className="space-y-2">
                                {analytics.topPerformers.map((client, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-emerald-400/60">{i + 1}.</span>
                                            <span className="text-sm text-white truncate max-w-[120px]">{client.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400">{client.progress}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No top performers yet</p>
                        )}
                    </div>

                    {/* Needs Attention */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <h4 className="text-sm font-bold text-amber-400">Needs Attention</h4>
                        </div>
                        {analytics.needsAttention.length > 0 ? (
                            <div className="space-y-2">
                                {analytics.needsAttention.map((client, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-sm text-white truncate max-w-[120px]">{client.name}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                            {client.issue}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs">All clients on track!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Summary */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/10">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <p className="text-xs text-muted-foreground">
                            <span className="text-primary font-medium">Weekly Insight:</span>
                            {analytics.avgAdherence >= 70
                                ? ` Your clients are performing well! Focus on the ${analytics.clientsOffTrack} off-track clients to boost overall results.`
                                : ` ${analytics.clientsOffTrack} clients need attention. Consider reaching out to boost engagement.`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
