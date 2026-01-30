"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    CheckCircle2,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api, CheckIn } from "@/lib/api";

interface DayData {
    day: string;
    date: string;
    checkins: number;
    reviewed: number;
}

interface WeeklyInsightsProps {
    coachId?: string;
}

export function WeeklyInsights({ coachId }: WeeklyInsightsProps) {
    const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!coachId) return;

        async function loadWeeklyData() {
            try {
                // Get coach's clients
                const clients = await api.getCoachClients(coachId!);
                const clientIds = clients.map(c => c.id);

                if (clientIds.length === 0) {
                    setWeeklyData([]);
                    setLoading(false);
                    return;
                }

                // Get check-ins for last 7 days
                const allCheckins: CheckIn[] = [];
                for (const clientId of clientIds) {
                    const checkins = await api.getCheckIns(String(clientId));
                    allCheckins.push(...checkins);
                }

                // Build last 7 days data
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const last7Days: DayData[] = [];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];

                    const dayCheckins = allCheckins.filter(c => c.date === dateStr);
                    const reviewedCount = dayCheckins.filter(c => c.reviewed).length;

                    last7Days.push({
                        day: days[date.getDay()],
                        date: dateStr,
                        checkins: dayCheckins.length,
                        reviewed: reviewedCount
                    });
                }

                setWeeklyData(last7Days);
            } catch (error) {
                console.error("Failed to load weekly data", error);
            } finally {
                setLoading(false);
                setTimeout(() => setIsLoaded(true), 300);
            }
        }
        loadWeeklyData();
    }, [coachId]);

    const totalCheckins = weeklyData.reduce((sum, d) => sum + d.checkins, 0);
    const totalReviewed = weeklyData.reduce((sum, d) => sum + d.reviewed, 0);
    const reviewRate = totalCheckins > 0 ? Math.round((totalReviewed / totalCheckins) * 100) : 0;
    const maxCheckins = Math.max(...weeklyData.map(d => d.checkins), 1);

    // Compare to previous data (simple: compare last 3 days to first 3 days)
    const recentDays = weeklyData.slice(-3).reduce((sum, d) => sum + d.checkins, 0);
    const earlierDays = weeklyData.slice(0, 3).reduce((sum, d) => sum + d.checkins, 0);
    const isTrendingUp = recentDays >= earlierDays;

    if (loading) {
        return (
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                    <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-4">
                    <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                        <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    </div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white">Weekly Performance</h3>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                        isTrendingUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                        {isTrendingUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isTrendingUp ? "Up" : "Down"}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-5">
                {/* Weekly Bar Chart */}
                {weeklyData.length > 0 && (
                    <div>
                        <div className="flex items-end justify-between gap-1.5 h-20">
                            {weeklyData.map((data, index) => (
                                <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full relative flex items-end justify-center" style={{ height: '64px' }}>
                                        <div
                                            className={cn(
                                                "w-full max-w-[24px] rounded-t transition-all duration-700 ease-out",
                                                data.checkins > 0 ? "bg-primary/60 hover:bg-primary/80" : "bg-white/10"
                                            )}
                                            style={{
                                                height: isLoaded ? `${Math.max((data.checkins / maxCheckins) * 64, 4)}px` : '4px',
                                                transitionDelay: `${index * 80}ms`
                                            }}
                                        >
                                            {data.checkins > 0 && (
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-white font-bold opacity-0 group-hover:opacity-100">
                                                    {data.checkins}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-[9px]",
                                        index === weeklyData.length - 1 ? "text-primary font-bold" : "text-muted-foreground"
                                    )}>
                                        {data.day}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-ins</p>
                        </div>
                        <p className="text-xl font-bold text-white">{totalCheckins}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-3.5 h-3.5 text-emerald-400" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Reviewed</p>
                        </div>
                        <p className={cn(
                            "text-xl font-bold",
                            reviewRate >= 90 ? "text-emerald-400" : reviewRate >= 70 ? "text-amber-400" : "text-rose-400"
                        )}>
                            {reviewRate}%
                        </p>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
