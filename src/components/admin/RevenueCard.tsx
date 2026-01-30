"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RevenueChart } from "./RevenueChart";

interface RevenueCardProps {
    stats: {
        revenueByPlan: { name: string; value: number }[];
        revenueOverTime: { name: string; value: number }[];
        revenueByYear: { name: string; value: number }[];
        monthlyRevenue: number;
    };
}

export function RevenueCard({ stats }: RevenueCardProps) {
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    const data = viewMode === 'monthly' ? (stats.revenueOverTime || []) : (stats.revenueByYear || []);
    const subtitle = viewMode === 'monthly' ? "Monthly Revenue Trend" : "Yearly Revenue Trend";

    return (
        <GlassCard className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-400" />
                        Revenue Analysis
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${viewMode === 'monthly'
                            ? "bg-blue-600/20 border border-blue-500/20 text-blue-400"
                            : "bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setViewMode('yearly')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${viewMode === 'yearly'
                            ? "bg-blue-600/20 border border-blue-500/20 text-blue-400"
                            : "bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                            }`}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-8 mb-4">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Top Performer</p>
                    <p className="text-2xl font-bold text-white">
                        {stats.revenueByPlan && stats.revenueByPlan.length > 0 ? stats.revenueByPlan[0].name : "N/A"}
                    </p>
                    <p className="text-xs text-emerald-400">
                        {stats.revenueByPlan && stats.revenueByPlan.length > 0 ? `$${stats.revenueByPlan[0].value.toLocaleString()}` : "$0"}
                    </p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Total Value</p>
                    <p className="text-2xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</p>
                </div>
            </div>

            <RevenueChart key={viewMode} data={data} />
        </GlassCard>
    );
}
