"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { CheckSquare, MessageSquare, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface DailyFocusProps {
    coachId?: string;
}

export function DailyFocus({ coachId }: DailyFocusProps) {
    const [stats, setStats] = useState({ activeClients: 0, pendingCheckins: 0, expiringClients: 0 });

    useEffect(() => {
        if (!coachId) return;

        async function loadStats() {
            try {
                const data = await api.getCoachStats(coachId!);
                setStats(data);
            } catch (error) {
                console.error("Failed to load coach stats", error);
            }
        }
        loadStats();
    }, [coachId]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <GlassCard className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary box-glow">
                        <CheckSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">{stats.pendingCheckins}</h3>
                        <p className="text-sm text-primary/80">Pending Check-ins</p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="bg-secondary/5 border-secondary/20 hover:bg-secondary/10 transition-colors p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/20 text-secondary box-glow">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">0</h3>
                        <p className="text-sm text-secondary/80">Unread Messages</p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 transition-colors p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-rose-500/20 text-rose-500 box-glow animate-pulse">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">{stats.expiringClients}</h3>
                        <p className="text-sm text-rose-400">Expiring Clients</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
