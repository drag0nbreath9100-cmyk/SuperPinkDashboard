"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard } from "lucide-react";

export function FinancialDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <DollarSign className="w-24 h-24 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white mt-2">$42,390</h3>
                    <div className="flex items-center gap-2 mt-2 text-emerald-400 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>+15.3% vs last month</span>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-24 h-24 text-secondary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Active Members</p>
                    <h3 className="text-3xl font-bold text-white mt-2">1,284</h3>
                    <div className="flex items-center gap-2 mt-2 text-emerald-400 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>+8.1% vs last month</span>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <CreditCard className="w-24 h-24 text-rose-500" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Expiring Soon</p>
                    <h3 className="text-3xl font-bold text-white mt-2">14</h3>
                    <div className="flex items-center gap-2 mt-2 text-rose-400 text-sm animate-pulse">
                        <TrendingDown className="w-4 h-4" />
                        <span>Requires Action</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
