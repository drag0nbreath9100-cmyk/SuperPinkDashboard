"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Search, Loader2 } from "lucide-react";

export function MasterList() {
    const coaches = [
        { id: 1, name: "Sarah", activeClients: 24, retention: "92%", status: "online" },
        { id: 2, name: "Ahmed", activeClients: 18, retention: "88%", status: "offline" },
        { id: 3, name: "Mike", activeClients: 31, retention: "95%", status: "online" },
    ];

    return (
        <GlassCard className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Coaching Staff</h3>
                <NeonButton variant="ghost" className="text-xs">View All</NeonButton>
            </div>

            <div className="space-y-4">
                {coaches.map((coach) => (
                    <div key={coach.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                                    {coach.name[0]}
                                </div>
                                {coach.status === "online" && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                                )}
                            </div>
                            <div>
                                <div className="text-white font-medium group-hover:text-primary transition-colors">{coach.name}</div>
                                <div className="text-xs text-muted-foreground">{coach.activeClients} Active Clients</div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-mono text-emerald-400">{coach.retention}</div>
                            <div className="text-xs text-muted-foreground">Retention</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Recent Activity</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Sarah assigned to <span className="text-white">New Lead</span></span>
                        <span className="text-xs">2m</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Ahmed updated <span className="text-white">Kenzy's</span> plan</span>
                        <span className="text-xs">15m</span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
