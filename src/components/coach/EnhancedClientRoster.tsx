"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    ChevronRight,
    AlertCircle,
    MessageSquare,
    Eye,
    TrendingUp,
    TrendingDown,
    Clock,
    Search,
    Filter,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Client } from "@/lib/api";
import { useCoachClients, useClientAdherenceScores } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { CURRENT_COACH_ID } from "@/lib/api";

type SortOption = "name" | "status" | "lastActivity" | "urgency";

type AdherenceData = { score: number; trend: boolean };

export function EnhancedClientRoster({ coachId }: { coachId?: string }) {
    // Use TanStack Query hooks for automatic caching & deduplication
    const effectiveCoachId = coachId || CURRENT_COACH_ID;
    const { data: clients = [], isLoading: clientsLoading } = useCoachClients(effectiveCoachId);
    const { data: adherenceScores = new Map(), isLoading: adherenceLoading } = useClientAdherenceScores(effectiveCoachId);

    const loading = clientsLoading || adherenceLoading;
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("urgency");
    const [showFilters, setShowFilters] = useState(false);

    // Filter and sort clients
    const filteredClients = clients
        .filter(c => c.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.full_name.localeCompare(b.full_name);
                case "status":
                    return (a.status || "").localeCompare(b.status || "");
                case "lastActivity":
                    return new Date(b.active_status_at || 0).getTime() - new Date(a.active_status_at || 0).getTime();
                case "urgency":
                    const aNew = (a.status?.toLowerCase().includes('lead') || a.status === 'pending') && !a.workout_plan_link;
                    const bNew = (b.status?.toLowerCase().includes('lead') || b.status === 'pending') && !b.workout_plan_link;
                    if (aNew !== bNew) return bNew ? 1 : -1;

                    const aUrgent = !a.active_subscription || (a.subscription_end_date && new Date(a.subscription_end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                    const bUrgent = !b.active_subscription || (b.subscription_end_date && new Date(b.subscription_end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                    return (bUrgent ? 1 : 0) - (aUrgent ? 1 : 0);
                default:
                    return 0;
            }
        });

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
                        <h3 className="text-xl font-bold text-white">My Roster</h3>
                        <p className="text-sm text-muted-foreground">{clients.length} Active Clients</p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "p-2 rounded-full border transition-all",
                                showFilters ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                            )}
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sort Options */}
                {showFilters && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            { key: "urgency", label: "Priority" },
                            { key: "name", label: "Name" },
                            { key: "status", label: "Status" },
                            { key: "lastActivity", label: "Last Active" }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key as SortOption)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                    sortBy === key
                                        ? "bg-primary text-white"
                                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Client List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-h-[450px] custom-scrollbar">
                {filteredClients.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {searchQuery ? "No clients match your search." : "No clients assigned yet."}
                    </div>
                ) : (
                    filteredClients.map((client, index) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            index={index}
                            adherence={adherenceScores.get(client.id)}
                        />
                    ))
                )}
            </div>
        </GlassCard>
    );
}

function ClientCard({ client, index, adherence }: { client: Client; index: number; adherence?: { score: number; trend: boolean } }) {
    const isAttentionNeeded = !client.active_subscription ||
        (client.subscription_end_date && new Date(client.subscription_end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const isExpiringSoon = client.subscription_end_date &&
        new Date(client.subscription_end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
        new Date(client.subscription_end_date) > new Date();

    // Calculate days since last activity
    const lastActivity = client.active_status_at ? new Date(client.active_status_at) : null;
    const daysSinceActivity = lastActivity
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // Use real adherence data or default to 0 if no data
    const adherenceScore = adherence?.score ?? 0;
    const adherenceTrend = adherence?.trend ?? true;

    const isNewLeadNoPlan = (client.status?.toLowerCase().includes('lead') || client.status === 'pending') && !client.workout_plan_link;

    return (
        <Link href={`/clients/${client.id}`}>
            <div
                className={cn(
                    "flex items-center justify-between py-5 px-4 rounded-xl border transition-all group cursor-pointer",
                    "hover:border-primary/30 hover:bg-white/10",
                    isAttentionNeeded
                        ? "bg-rose-500/5 border-rose-500/20"
                        : isNewLeadNoPlan
                            ? "bg-violet-500/5 border-violet-500/20"
                            : "bg-white/5 border-white/5"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <div className="flex items-center gap-4">
                    {/* Avatar with status ring */}
                    <div className="relative">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                            "bg-gradient-to-br",
                            isAttentionNeeded
                                ? "from-rose-500/30 to-rose-500/10 text-rose-400"
                                : isNewLeadNoPlan
                                    ? "from-violet-500/30 to-violet-500/10 text-violet-400"
                                    : "from-primary/30 to-primary/10 text-primary"
                        )}>
                            {client.full_name[0]}
                        </div>

                        {/* Status indicator */}
                        <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background",
                            client.status === "active"
                                ? "bg-emerald-500"
                                : client.status === "paused"
                                    ? "bg-amber-500"
                                    : isNewLeadNoPlan
                                        ? "bg-violet-500 animate-pulse"
                                        : "bg-slate-500"
                        )} />

                        {/* Urgent indicator */}
                        {isAttentionNeeded && (
                            <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5 animate-pulse">
                                <AlertCircle className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Client Info */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold group-hover:text-primary transition-colors truncate max-w-[180px]">
                                {client.full_name}
                            </h4>
                            {isNewLeadNoPlan && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/20">
                                    No Plan
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate max-w-[100px]">{client.package_name || 'No Plan'}</span>
                            {isExpiringSoon && (
                                <span className="text-rose-400 font-medium">• Expiring soon</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Metrics & Actions */}
                <div className="flex items-center gap-6">
                    {/* Quick Metrics (hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Adherence Score */}
                        <div className="text-center min-w-[70px]">
                            <div className="flex items-center justify-center gap-1">
                                <span className={cn(
                                    "text-sm font-bold tabular-nums",
                                    adherenceScore >= 80 ? "text-emerald-400" : adherenceScore >= 60 ? "text-amber-400" : "text-rose-400"
                                )}>
                                    {adherenceScore}%
                                </span>
                                {adherenceTrend
                                    ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    : <TrendingDown className="w-3 h-3 text-rose-400" />
                                }
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Adherence</div>
                        </div>

                        {/* Last Activity */}
                        <div className="text-center min-w-[70px]">
                            <div className="flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className={cn(
                                    "text-xs font-medium",
                                    daysSinceActivity && daysSinceActivity > 3 ? "text-rose-400" : "text-muted-foreground"
                                )}>
                                    {daysSinceActivity !== null ? `${daysSinceActivity}d ago` : "N/A"}
                                </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">Last Active</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.preventDefault(); }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                            title="Send Message"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                            title="View Profile"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </Link>
    );
}
