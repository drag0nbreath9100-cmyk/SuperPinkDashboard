"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    CheckCircle,
    Bell,
    Activity,
    UserPlus,
    AlertCircle,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ActivityItem {
    id: string;
    type: "checkin" | "new_client" | "alert" | "milestone";
    message: string;
    timestamp: Date;
    coachName?: string;
    clientName?: string;
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

const activityIcons = {
    checkin: { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-400" },
    new_client: { icon: UserPlus, color: "bg-violet-500/10 text-violet-400" },
    alert: { icon: AlertCircle, color: "bg-rose-500/10 text-rose-400" },
    milestone: { icon: Zap, color: "bg-amber-500/10 text-amber-400" }
};

function ActivityRow({ activity, index }: { activity: ActivityItem; index: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const { icon: Icon, color } = activityIcons[activity.type];

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 80);
        return () => clearTimeout(timer);
    }, [index]);

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all duration-500",
                "hover:bg-white/5",
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}
        >
            <div className={cn("p-2 rounded-lg shrink-0", color)}>
                <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm text-white font-medium leading-tight">
                            {activity.coachName && (
                                <span className="text-indigo-400">{activity.coachName}</span>
                            )}
                            {activity.coachName && activity.clientName && " → "}
                            {activity.clientName && (
                                <span className="text-violet-400">{activity.clientName}</span>
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {activity.message}
                        </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function TeamActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadActivities() {
            try {
                const [coaches, clients, intelligenceItems] = await Promise.all([
                    api.getCoaches(),
                    api.getClients(),
                    api.getIntelligenceFeed()
                ]);

                const coachMap = new Map(coaches.map(c => [c.id, c.name]));

                // Generate activity items from intelligence feed and recent clients
                const activityItems: ActivityItem[] = [];

                // Add intelligence items as activities
                intelligenceItems.slice(0, 5).forEach((item, idx) => {
                    activityItems.push({
                        id: `intel-${item.id || idx}`,
                        type: item.type === 'critical' ? 'alert' : 'milestone',
                        message: item.message,
                        timestamp: new Date(item.created_at || Date.now() - idx * 3600000),
                        coachName: item.coach_name || "System"
                    });
                });

                // Add recent client activities
                const recentClients = clients
                    .filter(c => c.created_at)
                    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
                    .slice(0, 5);

                recentClients.forEach((client, idx) => {
                    const coachName = client.coach_id ? coachMap.get(client.coach_id) : undefined;
                    activityItems.push({
                        id: `client-${client.id}`,
                        type: 'new_client',
                        message: "New client onboarded",
                        timestamp: new Date(client.created_at!),
                        coachName,
                        clientName: client.full_name
                    });
                });

                // Sort by timestamp
                activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                setActivities(activityItems.slice(0, 8));
            } catch (error) {
                console.error("Failed to load team activities", error);
            } finally {
                setLoading(false);
            }
        }
        loadActivities();
    }, []);

    if (loading) {
        return (
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                    <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-lg bg-white/5" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 bg-white/5 rounded" />
                                <div className="h-3 w-32 bg-white/5 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-pink-500/10">
                        <Activity className="w-4 h-4 text-pink-400" />
                    </div>
                    <h3 className="font-bold text-white">Team Activity</h3>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                </div>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto max-h-[320px] custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Bell className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No recent activity</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {activities.map((activity, index) => (
                            <ActivityRow key={activity.id} activity={activity} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
