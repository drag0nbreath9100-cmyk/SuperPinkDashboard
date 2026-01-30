"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, AlertTriangle, MessageCircle, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { api, IntelligenceItem } from "@/lib/api";

interface IntelligenceEngineProps {
    initialInsights: IntelligenceItem[];
}

export function IntelligenceEngine({ initialInsights = [] }: IntelligenceEngineProps) {
    const [insights, setInsights] = useState<IntelligenceItem[]>(initialInsights);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Filter insights based on expansion state
    const visibleInsights = isExpanded ? insights : insights.slice(0, 5);

    // Update local state if props change (unlikely in this server component pattern but good practice)
    useEffect(() => {
        setInsights(initialInsights);
    }, [initialInsights]);

    const handleAction = async (id: number) => {
        setProcessingId(id);

        // Optimistic UI update
        const originalInsights = [...insights];
        setInsights(prev => prev.filter(i => i.id !== id));

        try {
            const success = await api.resolveIntelligenceItem(id);
            if (!success) {
                // Revert if failed
                setInsights(originalInsights);
            }
        } catch (error) {
            console.error("Failed to dismiss insight", error);
            setInsights(originalInsights);
        } finally {
            setProcessingId(null);
        }
    };

    if (!insights || insights.length === 0) {
        return (
            <GlassCard className="p-6 flex items-center justify-center min-h-[150px] animate-in fade-in">
                <div className="text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                    <p className="text-sm">All systems optimized. No critical actions needed.</p>
                </div>
            </GlassCard>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <h3 className="text-sm font-bold text-blue-200 uppercase tracking-widest">
                    AI Intelligence Feed
                </h3>
            </div>

            <div className="space-y-3">
                {visibleInsights.map((item) => (
                    <GlassCard
                        key={item.id}
                        className={cn(
                            "group p-0 transition-all duration-500 hover:bg-white/5",
                            item.type === 'critical' ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5'
                        )}
                    >
                        <div className="p-3 flex items-center justify-between gap-4 w-full">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border", // Smaller icon container
                                    item.type === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                        item.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                )}>
                                    {item.type === 'critical' && <AlertTriangle className="w-3 h-3" />}
                                    {item.type === 'warning' && <MessageCircle className="w-3 h-3" />}
                                    {item.type === 'info' && <Sparkles className="w-3 h-3" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-300 leading-tight truncate">
                                        {/* Use coach_name, referencing 'System' if it's the system */}
                                        {item.coach_name ? <span className="font-bold text-white">{item.coach_name}</span> : <span className="font-bold text-blue-300">System</span>} <span className="opacity-80">{item.message}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAction(item.id)}
                                disabled={processingId === item.id}
                                className={cn(
                                    "shrink-0 h-7 px-3 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 translate-y-[2px]", // Fixed height h-7, reduced rounding
                                    item.type === 'critical'
                                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {processingId === item.id ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    <>
                                        {item.action}
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {insights.length > 5 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-blue-300 hover:text-white transition-colors border-t border-white/5 pt-4"
                >
                    {isExpanded ? (
                        <>Show Less</>
                    ) : (
                        <>View More ({insights.length - 5} hidden)</>
                    )}
                </button>
            )}
        </div>
    );
}
