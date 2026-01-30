"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, Client } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CoachClientListProps {
    coachId?: string;
}

export function CoachClientList({ coachId }: CoachClientListProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!coachId) return;

        async function loadClients() {
            setLoading(true);
            try {
                // Using the specific coach ID for this view
                const data = await api.getCoachClients(coachId!);
                setClients(data);
            } catch (error) {
                console.error("Failed to load coach clients", error);
            } finally {
                setLoading(false);
            }
        }
        loadClients();
    }, [coachId]);

    if (loading) {
        return (
            <GlassCard className="h-full flex items-center justify-center p-12">
                <div className="text-muted-foreground animate-pulse">Loading roster...</div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="h-full p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">My Roster</h3>
                <span className="text-sm text-muted-foreground">{clients.length} Active Clients</span>
            </div>

            <div className="space-y-3">
                {clients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No clients assigned yet.</div>
                ) : (
                    clients.map((client) => {
                        // Determine status logic helper (could be moved to util)
                        const isAttentionNeeded = !client.active_subscription || (client.subscription_end_date && new Date(client.subscription_end_date) < new Date());
                        const checkinStatus: string = "Done"; // Placeholder as we don't have checkin table yet

                        return (
                            <Link href={`/clients/${client.id}`} key={client.id}>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-transparent flex items-center justify-center text-secondary font-bold text-lg">
                                                {client.full_name[0]}
                                            </div>
                                            {isAttentionNeeded && (
                                                <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-1 box-glow animate-pulse">
                                                    <AlertCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-white font-semibold group-hover:text-primary transition-colors">{client.full_name}</h4>
                                            <div className="text-xs text-muted-foreground">{client.package_name || 'No Plan'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <div className={cn("text-xs font-bold", checkinStatus === "Pending" ? "text-rose-400" : "text-emerald-400")}>
                                                {checkinStatus === "Pending" ? "Check-in Due" : "On Track"}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">Status</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </GlassCard>
    );
}
