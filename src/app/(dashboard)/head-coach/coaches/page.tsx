"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Input } from "@/components/ui/input";
import { Search, Filter, Users, Activity, Star, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Coach, Client } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CoachWithClients extends Coach {
    clientCount: number;
    activeClients: number;
}

export default function HeadCoachCoachesPage() {
    const [coaches, setCoaches] = useState<CoachWithClients[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [coachesData, clientsData] = await Promise.all([
                    api.getCoaches(),
                    api.getClients()
                ]);

                // Calculate real client counts for each coach
                const coachesWithClients: CoachWithClients[] = coachesData.map(coach => {
                    const coachClients = clientsData.filter(c => c.coach_id === coach.id);
                    const activeClients = coachClients.filter(c => c.status === 'active').length;
                    return {
                        ...coach,
                        clientCount: coachClients.length,
                        activeClients
                    };
                });

                setCoaches(coachesWithClients);
            } catch (error) {
                console.error("Failed to load coaches", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredCoaches = coaches.filter(coach =>
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 pb-24 relative animate-in fade-in duration-700">
            {/* Dynamic Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse opacity-50" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-sm font-mono text-indigo-400 tracking-widest uppercase">Roster Management</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Active <span className="accent-text">Coaches</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Monitor workload, performance metrics, and client distribution across your team.
                        </p>
                    </div>

                    {/* Back to Dashboard */}
                    <Link href="/head-coach">
                        <GlassCard className="py-2.5 px-4 flex items-center gap-2 !bg-white/5 hover:!bg-white/10 cursor-pointer group">
                            <span className="text-sm font-medium text-white">← Back to Dashboard</span>
                        </GlassCard>
                    </Link>
                </header>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-11 h-12 bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all rounded-xl text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <NeonButton variant="ghost" className="h-12 px-6 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filter Status
                    </NeonButton>
                </div>

                {/* Coaches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[320px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                        ))
                    ) : filteredCoaches.length === 0 ? (
                        <div className="col-span-full text-center py-16 text-muted-foreground">
                            {searchQuery ? "No coaches match your search." : "No coaches found in the system."}
                        </div>
                    ) : (
                        filteredCoaches.map((coach, index) => (
                            <CoachCard key={coach.id} coach={coach} index={index} />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}

function CoachCard({ coach, index }: { coach: CoachWithClients; index: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const maxClients = coach.max_clients || 30;
    const loadPercentage = Math.min(Math.round((coach.clientCount / maxClients) * 100), 100);
    const isHighLoad = loadPercentage >= 80;

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 80);
        return () => clearTimeout(timer);
    }, [index]);

    return (
        <Link href={`/head-coach/coaches/${coach.id}`} className="block group h-full">
            <GlassCard
                className={cn(
                    "h-full p-0 overflow-hidden transition-all duration-500",
                    "hover:border-indigo-500/30 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
            >
                {/* Header with gradient */}
                <div className="h-28 bg-gradient-to-br from-indigo-900/50 to-violet-900/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-20" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]" />



                    {/* Rating badge */}
                    <div className="absolute top-3 right-3">
                        <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-white">{Number(coach.rating).toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Avatar Initials Placeholder - Moved outside header to prevent clipping */}
                <div className="absolute top-20 left-5 z-10">
                    <div className="w-16 h-16 rounded-xl bg-slate-900 ring-4 ring-[#020617] p-[2px] shadow-2xl overflow-hidden flex items-center justify-center">
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <span className="text-xl font-bold text-white uppercase tracking-wider">
                                {coach.name ? coach.name.substring(0, 2) : 'CH'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="pt-10 p-5 flex flex-col h-[calc(100%-112px)]">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                            {coach.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {coach.specialization || coach.role || "Performance Coach"}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Clients</p>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-400" />
                                <span className="text-lg font-bold text-white">{coach.clientCount}</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-violet-500/20 transition-colors">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Capacity</p>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-violet-400" />
                                <span className="text-lg font-bold text-white">{maxClients}</span>
                            </div>
                        </div>
                    </div>

                    {/* Load bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Workload</span>
                            <span className={cn(
                                "text-xs font-bold",
                                isHighLoad ? "text-amber-400" : "text-emerald-400"
                            )}>
                                {loadPercentage}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    isHighLoad ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${loadPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
                            View Profile
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </GlassCard>
        </Link>
    );
}
