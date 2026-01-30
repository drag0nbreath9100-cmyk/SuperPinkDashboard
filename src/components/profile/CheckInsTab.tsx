import React, { useEffect, useState } from "react";
import { CheckIn, api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, Calendar, Moon, Scale, Zap, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function CheckInsTab({ clientId, onReview }: { clientId: string; onReview?: () => void }) {
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCheckIns = async () => {
        const data = await api.getCheckIns(clientId);
        setCheckIns(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCheckIns();
    }, [clientId]);

    const handleMarkReviewed = async (checkInId: number) => {
        const success = await api.markCheckInReviewed(checkInId);
        if (success) {
            // Update local state to reflect change immediately
            setCheckIns(prev => prev.map(c =>
                c.id === checkInId ? { ...c, reviewed: true } : c
            ));
            // Notify parent to update red dot
            if (onReview) onReview();
        }
    };

    if (isLoading) {
        return <div className="text-slate-400 text-center py-10">Loading check-ins...</div>;
    }

    if (checkIns.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No check-ins found for this client.</p>
            </div>
        );
    }

    // Latest check-in for summary
    const latest = checkIns[0];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Check-in History
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Scale className="w-4 h-4" />
                        <span>Latest Weight</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{latest.weight}kg</div>
                </GlassCard>
                <GlassCard className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>Recent Stress</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{latest.stress_level}/10</div>
                </GlassCard>
                <GlassCard className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span>Last Sleep</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{latest.sleeping_hours || '-'} hrs</div>
                </GlassCard>
                <GlassCard className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>Avg Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {(checkIns.reduce((acc, curr) => acc + (curr.service_rating || 0), 0) / checkIns.length).toFixed(1)}/10
                    </div>
                </GlassCard>
            </div>

            <div className="space-y-4">
                {checkIns.map((checkIn, index) => (
                    <motion.div
                        key={checkIn.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="p-0 overflow-hidden group hover:bg-white/5 transition-all duration-300">
                            {/* Header Row: Date & Weight */}
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 bg-white/5 sm:bg-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                        <Calendar className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">
                                            {new Date(checkIn.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">Daily Check-in</p>
                                    </div>
                                </div>

                                <Scale className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-200 font-bold">{checkIn.weight} <span className="text-emerald-500/70 text-sm font-normal">kg</span></span>


                                <div className="ml-auto flex items-center gap-3">
                                    {checkIn.reviewed ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Reviewed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkReviewed(checkIn.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 hover:border-blue-500/40 transition-all"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Mark Reviewed
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="p-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {/* Sleep */}
                                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors">
                                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-medium uppercase tracking-wider">
                                        <Moon className="w-3.5 h-3.5" /> Sleep
                                    </div>
                                    <div className="text-xl font-bold text-white">{checkIn.sleeping_hours || '-'} <span className="text-sm text-slate-500 font-normal">hrs</span></div>
                                </div>

                                {/* Stress */}
                                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-colors">
                                    <div className="flex items-center gap-2 text-pink-300 text-xs font-medium uppercase tracking-wider">
                                        <Activity className="w-3.5 h-3.5" /> Stress
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-xl font-bold text-white">{checkIn.stress_level}</span>
                                        <div className="flex pb-1.5 gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={cn("w-1.5 h-1.5 rounded-full", (i + 1) * 2 <= checkIn.stress_level ? "bg-pink-500" : "bg-white/10")} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Calories */}
                                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-colors">
                                    <div className="flex items-center gap-2 text-orange-300 text-xs font-medium uppercase tracking-wider">
                                        <Zap className="w-3.5 h-3.5" /> Calories
                                    </div>
                                    <div className="text-xl font-bold text-white">{checkIn.calories} <span className="text-sm text-slate-500 font-normal">kcal</span></div>
                                </div>

                                {/* Steps */}
                                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-colors">
                                    <div className="flex items-center gap-2 text-violet-300 text-xs font-medium uppercase tracking-wider">
                                        <Activity className="w-3.5 h-3.5" /> Steps
                                    </div>
                                    <div className="text-xl font-bold text-white">{checkIn.steps.toLocaleString()}</div>
                                </div>

                                {/* Rating */}
                                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                                    <div className="flex items-center gap-2 text-yellow-500 text-xs font-medium uppercase tracking-wider">
                                        <Star className="w-3.5 h-3.5 fill-yellow-500" /> Rating
                                    </div>
                                    <div className="text-xl font-bold text-white">{checkIn.service_rating}<span className="text-sm text-yellow-500/50">/10</span></div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
