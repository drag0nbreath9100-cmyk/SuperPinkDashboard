"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { AlertTriangle, Clock, Activity, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChurnRisk, api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CoachChurnRiskCardProps {
    coachId?: string;
}

export function CoachChurnRiskCard({ coachId }: CoachChurnRiskCardProps) {
    const [risks, setRisks] = useState<ChurnRisk[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!coachId) return;

        async function loadRisks() {
            try {
                const data = await api.getCoachChurnRiskReport(coachId!);
                setRisks(data);
            } catch (error) {
                console.error("Failed to load churn risks", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadRisks();
    }, [coachId]);

    // Sort by risk level (High priority)
    const sortedRisks = [...risks].sort((a, b) => {
        if (a.risk_level === 'high' && b.risk_level !== 'high') return -1;
        if (a.risk_level !== 'high' && b.risk_level === 'high') return 1;
        return 0;
    });

    if (isLoading) {
        return (
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-rose-500/10 to-transparent">
                    <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse">
                            <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                            <div className="h-3 w-24 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-rose-500/10 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/10">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                        </div>
                        <h3 className="font-bold text-white">Clients at Risk</h3>
                    </div>
                    {risks.length > 0 && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/20">
                            {risks.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Risk List */}
            <div className="overflow-y-auto max-h-[280px] custom-scrollbar">
                {sortedRisks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 opacity-30 mb-2" />
                        <span className="text-sm">All clients look healthy!</span>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {sortedRisks.map((risk) => (
                            <Link href={`/clients/${risk.client_id}`} key={risk.client_id}>
                                <div className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-rose-500/30 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-white group-hover:text-rose-200 transition-colors text-sm">
                                            {risk.client_name}
                                        </h4>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                                            risk.risk_level === 'high' ? "bg-rose-500 text-rose-500" : "bg-amber-500 text-amber-500"
                                        )} />
                                    </div>

                                    {/* Risk Factors */}
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {risk.risk_factors.slice(0, 2).map((factor, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            >
                                                {factor}
                                            </span>
                                        ))}
                                        {risk.risk_factors.length > 2 && (
                                            <span className="text-[9px] text-muted-foreground">
                                                +{risk.risk_factors.length - 2} more
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{risk.details.last_checkin || 'Never'}</span>
                                        </div>
                                        {risk.details.avg_rating !== undefined && (
                                            <div className="flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                <span className={cn(
                                                    risk.details.avg_rating <= 7 ? "text-rose-400 font-bold" : ""
                                                )}>
                                                    {risk.details.avg_rating}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
