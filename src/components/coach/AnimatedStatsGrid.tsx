"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    CheckSquare,
    Users,
    Flame,
    AlertCircle,
    UserPlus,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useCoachStats, useCoachChurnRisks } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { CURRENT_COACH_ID } from "@/lib/api";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: "primary" | "secondary" | "rose" | "emerald" | "amber" | "violet";
    trend?: { value: number; up: boolean };
    subtitle?: string;
    isUrgent?: boolean;
    delay?: number;
    className?: string;
    actionLabel?: string;
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
    primary: {
        bg: "bg-primary/10",
        border: "border-primary/20",
        text: "text-primary",
        glow: "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]",
        gradient: "from-primary/20 to-transparent"
    },
    secondary: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]",
        gradient: "from-blue-500/20 to-transparent"
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
    violet: {
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        text: "text-violet-400",
        glow: "shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)]",
        gradient: "from-violet-500/20 to-transparent"
    }
};

function StatCard({ title, value, icon: Icon, color, trend, subtitle, isUrgent, delay = 0, className, actionLabel }: StatCardProps) {
    const animatedValue = useAnimatedCounter(value, 1200, delay);
    const styles = colorStyles[color];
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <GlassCard
            className={cn(
                "relative overflow-hidden p-6 transition-all duration-700 group flex flex-col justify-between",
                isUrgent && styles.glow,
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                className
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
                    {animatedValue}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {subtitle && (
                    <p className="text-xs text-white/40 pt-2 border-t border-white/5 mt-3">{subtitle}</p>
                )}
                {actionLabel && (
                    <div className="pt-4 mt-auto">
                        <button className={cn(
                            "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            styles.bg,
                            styles.text,
                            "hover:opacity-80 hover:scale-[1.02]"
                        )}>
                            {actionLabel}
                        </button>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

export function AnimatedStatsGrid({ coachId }: { coachId?: string }) {
    // Use TanStack Query hooks for automatic caching & deduplication
    const effectiveCoachId = coachId || CURRENT_COACH_ID;
    const { data: coachStats, isLoading: statsLoading } = useCoachStats(effectiveCoachId);
    const { data: churnRisks, isLoading: churnLoading } = useCoachChurnRisks(effectiveCoachId);

    const isLoading = statsLoading || churnLoading;

    const stats = {
        activeClients: coachStats?.activeClients || 0,
        pendingCheckins: coachStats?.pendingCheckins || 0,
        expiringClients: coachStats?.expiringClients || 0,
        churnRiskCount: churnRisks?.length || 0,
        newLeadsCount: coachStats?.newLeadsWithoutPlan || 0
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <GlassCard key={`hero-${i}`} className="p-6 h-40 animate-pulse bg-white/5"><div /></GlassCard>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <GlassCard key={`sub-${i}`} className="p-6 h-32 animate-pulse bg-white/5"><div /></GlassCard>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Hero Row: Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                    title="New Leads"
                    value={stats.newLeadsCount}
                    icon={UserPlus}
                    color="violet"
                    isUrgent={stats.newLeadsCount > 0}
                    subtitle="Missing Workout Plan"
                    actionLabel="Assign Plan"
                    delay={0}
                    className="h-full"
                />
                <StatCard
                    title="Pending Check-ins"
                    value={stats.pendingCheckins}
                    icon={CheckSquare}
                    color="primary"
                    isUrgent={stats.pendingCheckins > 0}
                    subtitle="Requires Review"
                    actionLabel="Review Now"
                    delay={100}
                    className="h-full"
                />
            </div>

            {/* Status Row: Monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Churn Risk"
                    value={stats.churnRiskCount}
                    icon={AlertCircle}
                    color="rose"
                    isUrgent={stats.churnRiskCount > 0}
                    subtitle="At Risk"
                    delay={200}
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats.expiringClients}
                    icon={Flame}
                    color="amber"
                    isUrgent={stats.expiringClients > 0}
                    subtitle="Next 7 Days"
                    delay={300}
                />
                <StatCard
                    title="Active Clients"
                    value={stats.activeClients}
                    icon={Users}
                    color="secondary"
                    trend={{ value: 12, up: true }}
                    subtitle="Total Roster"
                    delay={400}
                />
            </div>
        </div>
    );
}
