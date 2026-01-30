"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    ChevronRight,
    Star,
    Users,
    TrendingUp,
    TrendingDown,
    Search,
    Activity
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Coach, Client } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CoachWithStats extends Coach {
    clientCount: number;
    activeClients: number;
    loadPercentage: number;
}

export function CoachPerformanceList() {
    const [coaches, setCoaches] = useState<CoachWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [coachesData, clientsData] = await Promise.all([
                    api.getCoaches(),
                    api.getClients()
                ]);

                // Calculate stats for each coach
                const coachesWithStats: CoachWithStats[] = coachesData.map(coach => {
                    const coachClients = clientsData.filter(c => c.coach_id === coach.id);
                    const activeClients = coachClients.filter(c => c.status === 'active').length;
                    const maxLoad = coach.max_clients || coach.max_load || 30;
                    const loadPercentage = Math.round((coachClients.length / maxLoad) * 100);

                    return {
                        ...coach,
                        clientCount: coachClients.length,
                        activeClients,
                        loadPercentage: Math.min(loadPercentage, 100)
                    };
                });

                setCoaches(coachesWithStats);
            } catch (error) {
                console.error("Failed to load coach data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredCoaches = coaches.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <GlassCard className="h-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
                    <div className="h-8 w-48 bg-white/5 rounded-full animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 animate-pulse">
                            <div className="w-12 h-12 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 bg-white/10 rounded" />
                                <div className="h-3 w-24 bg-white/5 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="h-full p-0 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10">
                                <Activity className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Coach Performance</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{coaches.length} Active Coaches</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search coaches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Coach List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[500px] custom-scrollbar">
                {filteredCoaches.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {searchQuery ? "No coaches match your search." : "No coaches found."}
                    </div>
                ) : (
                    filteredCoaches.map((coach, index) => (
                        <CoachRow key={coach.id} coach={coach} index={index} />
                    ))
                )}
            </div>
        </GlassCard>
    );
}

function CoachRow({ coach, index }: { coach: CoachWithStats; index: number }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 50);
        return () => clearTimeout(timer);
    }, [index]);

    const isHighLoad = coach.loadPercentage >= 80;
    const isLowLoad = coach.loadPercentage < 40;

    return (
        <Link href={`/head-coach/coaches/${coach.id}`}>
            <div
                className={cn(
                    "flex items-center justify-between py-4 px-4 rounded-xl border transition-all group cursor-pointer",
                    "hover:border-indigo-500/30 hover:bg-white/10",
                    "bg-white/5 border-white/5",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
            >
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
                            <span className="text-sm font-bold text-white uppercase tracking-wider">
                                {coach.name ? coach.name.substring(0, 2) : 'CH'}
                            </span>
                        </div>
                        {/* Rating badge */}
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            <span className="text-[9px] font-bold text-amber-400">{coach.rating?.toFixed(1) || "N/A"}</span>
                        </div>
                    </div>

                    {/* Coach Info */}
                    <div className="min-w-0">
                        <h4 className="text-white font-semibold group-hover:text-indigo-400 transition-colors truncate max-w-[180px]">
                            {coach.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            {coach.specialization || "Performance Coach"}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                    {/* Client Count */}
                    <div className="hidden md:block text-center min-w-[80px]">
                        <div className="flex items-center justify-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-sm font-bold text-white">{coach.clientCount}</span>
                            <span className="text-xs text-muted-foreground">/ {coach.max_clients || coach.max_load || 30}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Clients</div>
                    </div>

                    {/* Load Bar */}
                    <div className="hidden md:block min-w-[100px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className={cn(
                                "text-xs font-bold",
                                isHighLoad ? "text-amber-400" : isLowLoad ? "text-emerald-400" : "text-blue-400"
                            )}>
                                {coach.loadPercentage}%
                            </span>
                            {isHighLoad ? (
                                <TrendingUp className="w-3 h-3 text-amber-400" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-emerald-400" />
                            )}
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    isHighLoad ? "bg-amber-500" : isLowLoad ? "bg-emerald-500" : "bg-indigo-500"
                                )}
                                style={{ width: `${coach.loadPercentage}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Capacity</div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </Link>
    );
}
