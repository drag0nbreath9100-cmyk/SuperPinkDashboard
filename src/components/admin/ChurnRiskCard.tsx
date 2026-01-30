
import React from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertTriangle, TrendingDown, Clock, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChurnRisk } from "@/lib/api";

interface ChurnRiskCardProps {
    risks: ChurnRisk[];
}

export const ChurnRiskCard: React.FC<ChurnRiskCardProps> = ({ risks }) => {
    // Sort by risk level (High priority)
    const sortedRisks = [...risks].sort((a, b) => {
        if (a.risk_level === 'high' && b.risk_level !== 'high') return -1;
        if (a.risk_level !== 'high' && b.risk_level === 'high') return 1;
        return 0; // Maintain order otherwise
    });

    return (
        <GlassCard className="p-0 overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-rose-500/10 to-transparent">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        Churn Risk Monitor
                    </h3>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/20">
                        {risks.length} Clients At Risk
                    </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Clients showing signs of dropout or dissatisfaction.</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {sortedRisks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                        <span className="text-sm">All clients look healthy!</span>
                    </div>
                ) : (
                    sortedRisks.map((risk) => (
                        <div
                            key={risk.client_id}
                            className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-rose-200 transition-colors">
                                        {risk.client_name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {risk.risk_factors.map((factor, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                            >
                                                {factor}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]",
                                    risk.risk_level === 'high' ? "bg-rose-500 text-rose-500" : "bg-orange-500 text-orange-500"
                                )} />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-400 border-t border-white/5 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>Last Active: <span className="text-slate-200">{risk.details.last_checkin || 'Never'}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Activity className="w-3 h-3 text-slate-500" />
                                    <span>Avg Rating: <span className={cn((risk.details.avg_rating ?? 10) <= 7 ? "text-rose-400 font-bold" : "text-slate-200")}>{risk.details.avg_rating ?? "N/A"}</span></span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                <button className="w-full py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors">
                    Take Action on High Risk
                </button>
            </div>
        </GlassCard>
    );
};


