"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Filter, ChevronRight, User, ArrowUpDown, X, Phone, FileText, PhoneOff, FileX } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Client } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface CoachClientRosterProps {
    initialClients: Client[];
}

type SortOption = "newest" | "a-z" | "z-a";
type StatusFilter = "all" | "active" | "inactive" | "lead" | "no-call" | "no-plan";

export default function CoachClientRoster({ initialClients }: CoachClientRosterProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("newest");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter and Sort Logic
    const filteredClients = useMemo(() => {
        let result = [...initialClients];

        // 1. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (client) =>
                    client.full_name?.toLowerCase().includes(lowerQuery) ||
                    client.email?.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Status Filter
        if (statusFilter !== "all") {
            result = result.filter((client) => {
                const status = client.status?.toLowerCase() || "";
                if (statusFilter === "active") return status === "active";
                if (statusFilter === "inactive") return status === "inactive" || status === "paused";
                if (statusFilter === "lead") return status === "lead" || status === "new_lead";
                if (statusFilter === "no-call") return !client.onboarding_call_done;
                if (statusFilter === "no-plan") return !client.workout_plan_link;
                return true;
            });
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortOption === "a-z") {
                return (a.full_name || "").localeCompare(b.full_name || "");
            } else if (sortOption === "z-a") {
                return (b.full_name || "").localeCompare(a.full_name || "");
            } else {
                return (b.id || 0) - (a.id || 0);
            }
        });

        return result;
    }, [initialClients, searchQuery, statusFilter, sortOption]);

    const filterOptions: { key: StatusFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "active", label: "Active" },
        { key: "inactive", label: "Inactive" },
        { key: "lead", label: "New Lead" },
        { key: "no-call", label: "No Call Done" },
        { key: "no-plan", label: "No Plan" },
    ];

    return (
        <div className="space-y-8">
            {/* SEARCH & FILTER CONTROLS */}
            <div className="flex flex-col md:flex-row gap-4 relative z-20">
                <GlassCard className="flex-1 p-0 h-14 relative z-10 overflow-hidden">
                    <div className="flex items-center h-full w-full">
                        <div className="pl-4 pr-3 text-slate-400 flex-shrink-0">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search clients by name..."
                            className="flex-1 bg-transparent border-none outline-none text-white h-full placeholder:text-slate-500 min-w-0"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="pr-4 pl-2 text-slate-500 hover:text-white transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </GlassCard>

                <div className="flex gap-2">
                    {/* Filter Toggle */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={cn(
                            "h-14 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 border backdrop-blur-md",
                            isFilterOpen || statusFilter !== 'all'
                                ? "bg-secondary/20 border-secondary/50 text-secondary"
                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        )}
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden md:inline font-medium">Filter</span>
                        {(statusFilter !== 'all' || sortOption !== 'newest') && (
                            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse ml-1" />
                        )}
                    </button>

                    {/* Sort Toggle */}
                    <button
                        onClick={() => setSortOption(prev => prev === 'a-z' ? 'z-a' : prev === 'z-a' ? 'newest' : 'a-z')}
                        className="h-14 w-14 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                        title={`Sort: ${sortOption}`}
                    >
                        <ArrowUpDown className="w-5 h-5" />
                    </button>
                </div>

                {/* EXPANDABLE FILTER PANEL */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-16 right-0 w-full md:w-80 p-4 rounded-2xl bg-[#0F172A]/95 border border-white/10 shadow-xl backdrop-blur-xl z-50 pointer-events-auto"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                        Filter by
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option.key}
                                                onClick={() => setStatusFilter(option.key)}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-sm text-left transition-colors font-medium",
                                                    statusFilter === option.key
                                                        ? "bg-secondary/30 text-secondary"
                                                        : "bg-[#1f2937] text-slate-400 hover:bg-[#374151] hover:text-slate-200"
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                        Sort By
                                    </label>
                                    <div className="grid grid-cols-1 gap-1">
                                        <button
                                            onClick={() => setSortOption('a-z')}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-sm text-left transition-colors flex justify-between items-center group",
                                                sortOption === 'a-z' ? "text-secondary" : "text-slate-400 hover:text-slate-200"
                                            )}
                                        >
                                            <span>Alphabetical (A-Z)</span>
                                            {sortOption === 'a-z' && <div className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                                        </button>
                                        <button
                                            onClick={() => setSortOption('z-a')}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-sm text-left transition-colors flex justify-between items-center group",
                                                sortOption === 'z-a' ? "text-secondary" : "text-slate-400 hover:text-slate-200"
                                            )}
                                        >
                                            <span>Alphabetical (Z-A)</span>
                                            {sortOption === 'z-a' && <div className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                                        </button>
                                        <button
                                            onClick={() => setSortOption('newest')}
                                            className={cn(
                                                "px-3 py-2 rounded-lg text-sm text-left transition-colors flex justify-between items-center group",
                                                sortOption === 'newest' ? "text-secondary" : "text-slate-400 hover:text-slate-200"
                                            )}
                                        >
                                            <span>Newest Added</span>
                                            {sortOption === 'newest' && <div className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CLIENTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => {
                    const hasNoCall = !client.onboarding_call_done;
                    const hasNoPlan = !client.workout_plan_link;

                    return (
                        <Link href={`/clients/${client.id}`} key={client.id}>
                            <GlassCard className="p-0 h-full group hover:border-secondary/30 transition-all duration-300 relative overflow-hidden">
                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 via-transparent to-primary/0 group-hover:from-secondary/10 group-hover:to-primary/10 transition-all duration-500 z-0" />

                                <div className="p-6 flex flex-col h-full relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-secondary/20 group-hover:scale-110 transition-transform">
                                            {client.full_name ? client.full_name[0] : <User className="w-6 h-6" />}
                                        </div>
                                        <div
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                                                client.status === "active"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-900/10"
                                                    : client.status === "inactive" || client.status === "paused"
                                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                        : "bg-slate-700/50 text-slate-400 border-slate-600/50"
                                            )}
                                        >
                                            {client.status || "Unknown"}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-secondary transition-colors">
                                            {client.full_name || "Unnamed Client"}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-3">
                                            {client.package_name || "No Active Package"}
                                        </p>

                                        {/* Badges for No Call / No Plan */}
                                        {(hasNoCall || hasNoPlan) && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {hasNoCall && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <PhoneOff className="w-3 h-3" />
                                                        No Call
                                                    </span>
                                                )}
                                                {hasNoPlan && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                        <FileX className="w-3 h-3" />
                                                        No Plan
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-4">
                                        <span className="group-hover:text-slate-300 transition-colors">View Profile</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-secondary/50 group-hover:text-secondary" />
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    );
                })}

                {filteredClients.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-slate-800 bg-white/5">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-300 mb-1">No clients found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                            className="mt-6 text-sm text-secondary hover:text-secondary/80 transition-colors"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
