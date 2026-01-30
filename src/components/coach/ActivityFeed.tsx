"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    CheckCircle,
    Bell,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api, CURRENT_COACH_ID, CheckIn, Client } from "@/lib/api";

interface ActivityItem {
    id: string;
    type: "checkin";
    message: string;
    timestamp: Date;
    clientName: string;
    clientId: number;
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

function ActivityRow({ activity, index }: { activity: ActivityItem; index: number }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 100);
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
            <div className="p-2 rounded-lg shrink-0 bg-emerald-500/10">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                            {activity.clientName}
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

export function ActivityFeed({ coachId }: { coachId?: string }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadActivities() {
            try {
                // Get coach's clients first
                const effectiveCoachId = coachId || CURRENT_COACH_ID;
                const clients = await api.getCoachClients(effectiveCoachId);
                const clientMap = new Map<number, Client>();
                clients.forEach(c => clientMap.set(c.id, c));
                const clientIds = clients.map(c => c.id);

                if (clientIds.length === 0) {
                    setActivities([]);
                    setLoading(false);
                    return;
                }

                // Get recent check-ins for these clients
                const allCheckins: CheckIn[] = [];
                for (const clientId of clientIds) {
                    const checkins = await api.getCheckIns(String(clientId));
                    allCheckins.push(...checkins);
                }

                // Sort by date descending and take top 10
                allCheckins.sort((a, b) =>
                    new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
                );

                const recentCheckins = allCheckins.slice(0, 10);

                // Convert to activity items
                const activityItems: ActivityItem[] = recentCheckins.map((checkin, idx) => {
                    const client = clientMap.get(checkin.client_id);
                    return {
                        id: String(checkin.id || idx),
                        type: "checkin" as const,
                        message: `Submitted check-in (${checkin.weight}kg, ${checkin.calories} cal)`,
                        timestamp: new Date(checkin.created_at || checkin.date),
                        clientName: client?.full_name || "Unknown Client",
                        clientId: checkin.client_id
                    };
                });

                setActivities(activityItems);
            } catch (error) {
                console.error("Failed to load activities", error);
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
                    {[...Array(4)].map((_, i) => (
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
                    <h3 className="font-bold text-white">Recent Check-ins</h3>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                </div>
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto max-h-[280px] custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Bell className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No recent check-ins</p>
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
