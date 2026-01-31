"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    Users,
    UserCheck,
    AlertCircle,
    TrendingUp,
    Star,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useCoaches, useClients, useAlerts, useDashboardStats } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: "indigo" | "violet" | "rose" | "emerald" | "amber" | "blue";
    trend?: { value: number; up: boolean };
    subtitle?: string;
    isUrgent?: boolean;
    delay?: number;
}

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1000, delay: number = 0) {
    const [count, setCount] = useState(0);
    const startTime = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const animate = (currentTime: number) => {
                if (startTime.current === null) {
                    startTime.current = currentTime;
                }

                const elapsed = currentTime - startTime.current;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);

                setCount(Math.floor(easeOutQuart * target));

                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(animate);
                } else {
                    setCount(target);
                }
            };

            frameRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [target, duration, delay]);

    return count;
}

const colorStyles = {
    indigo: {
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        text: "text-indigo-400",
        glow: "shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]",
        gradient: "from-indigo-500/20 to-transparent"
    },
    violet: {
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        text: "text-violet-400",
        glow: "shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)]",
        gradient: "from-violet-500/20 to-transparent"
    },
    rose: {
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        text: "text-rose-400",
        glow: "shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]",
        gradient: "from-rose-500/20 to-transparent"
    },
    emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]",
        gradient: "from-emerald-500/20 to-transparent"
    },
    amber: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)]",
        gradient: "from-amber-500/20 to-transparent"
    },
    blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]",
        gradient: "from-blue-500/20 to-transparent"
    }
};

function StatCard({ title, value, icon: Icon, color, trend, subtitle, isUrgent, delay = 0 }: StatCardProps) {
    const numericValue = typeof value === 'number' ? value : 0;
    const animatedValue = useAnimatedCounter(numericValue, 1200, delay);
    const styles = colorStyles[color];
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <GlassCard
            className={cn(
                "relative overflow-hidden p-6 transition-all duration-700 group",
                isUrgent && styles.glow,
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
        >
            {/* Background gradient */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-50",
                `bg-gradient-to-br ${styles.gradient}`
            )} />

            {/* Urgent pulse ring */}
            {isUrgent && (
                <div className="absolute inset-0 rounded-[20px] animate-pulse pointer-events-none">
                    <div className={cn("absolute inset-0 rounded-[20px]", styles.border, "border-2 opacity-50")} />
                </div>
            )}

            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={cn(
                    "p-3 rounded-xl border transition-all duration-300",
                    styles.bg,
                    styles.border,
                    styles.text,
                    "group-hover:scale-110"
                )}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                        trend.up ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                        {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend.value}%
                    </div>
                )}
            </div>

            <div className="relative z-10 space-y-1">
                <h3 className="text-3xl font-bold text-white tracking-tight tabular-nums">
                    {typeof value === 'string' ? value : animatedValue}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {subtitle && (
                    <p className="text-xs text-white/40 pt-2 border-t border-white/5 mt-3">{subtitle}</p>
                )}
            </div>
        </GlassCard>
    );
}

export function HeadCoachStatsGrid() {
    // Use TanStack Query hooks for automatic caching & deduplication
    const { data: coaches = [], isLoading: coachesLoading } = useCoaches();
    const { data: clients = [], isLoading: clientsLoading } = useClients({ lightweight: true });
    const { data: alerts = [], isLoading: alertsLoading } = useAlerts();
    const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

    const isLoading = coachesLoading || clientsLoading || alertsLoading || statsLoading;

    // Calculate stats from fetched data
    const avgRating = coaches.length > 0
        ? coaches.reduce((sum, c) => sum + (c.rating || 0), 0) / coaches.length
        : 0;

    const activeCount = clients.filter(c => c.status === 'active').length;

    const stats = {
        totalCoaches: coaches.length,
        totalClients: clients.length,
        avgCoachRating: Math.round(avgRating * 10) / 10,
        criticalAlerts: alerts.filter(a => a.type === 'error').length,
        activeClients: activeCount,
        teamAdherence: dashboardStats?.teamAdherence || 95
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <GlassCard key={i} className="p-6 h-36 animate-pulse bg-white/5"><div /></GlassCard>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Active Coaches"
                value={stats.totalCoaches}
                icon={Users}
                color="indigo"
                trend={{ value: 8, up: true }}
                subtitle="Team Members"
                delay={0}
            />
            <StatCard
                title="Total Clients"
                value={stats.totalClients}
                icon={UserCheck}
                color="violet"
                trend={{ value: 12, up: true }}
                subtitle="Across All Rosters"
                delay={100}
            />
            <StatCard
                title="Avg. Coach Rating"
                value={stats.avgCoachRating.toFixed(1)}
                icon={Star}
                color="amber"
                subtitle="Based on Feedback"
                delay={200}
            />
            <StatCard
                title="Team Adherence"
                value={`${stats.teamAdherence}%`}
                icon={Activity}
                color="emerald"
                trend={{ value: 2.4, up: true }}
                subtitle="Overall Performance"
                delay={300}
            />
        </div>
    );
}
