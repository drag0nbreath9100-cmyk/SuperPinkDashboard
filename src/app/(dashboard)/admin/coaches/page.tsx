import { GlassCard } from "@/components/ui/GlassCard";
import { Users, Search, Filter, Mail, Star, Trophy, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, Coach } from "@/lib/api";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CoachesPage() {
    const coaches = await api.getCoaches();
    // Fetch clients to calculate loading per coach
    const clients = await api.getClients();

    const coachesWithStats = coaches.map(coach => {
        const coachClients = clients.filter(c => c.coach_id === coach.id);
        const inactiveCount = coachClients.filter(c => c.status === 'inactive').length; // Mock, relies on status
        return {
            ...coach,
            activeClients: coachClients.length - inactiveCount, // Simple calc
            totalClients: coachClients.length,
            load: Math.round((coachClients.length / 30) * 100) // Assuming 30 is max capacity
        };
    });

    return (
        <main className="min-h-screen p-8 lg:p-12 pb-24 space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
                        Coaching <span className="accent-text">Roster</span>
                    </h1>
                    <p className="text-blue-200/50 flex items-center gap-2">
                        Performance metrics & active loads
                    </p>
                </div>
            </header>

            {/* COACHES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coachesWithStats.map((coach) => (
                    <Link key={coach.id} href={`/admin/coaches/${coach.id}`} className="block h-full">
                        <GlassCard className="p-0 overflow-hidden group hover:border-blue-500/30 transition-all duration-300 h-full">
                            {/* Header Image Area */}
                            <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                                <div className="absolute inset-0 bg-noise opacity-20" />
                                <div className="absolute -bottom-10 left-6">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-[#0F172A] flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                        {coach.image_url && !coach.image_url.includes('pravatar') ? (
                                            <img src={coach.image_url} alt={coach.name} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            coach.name[0]
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span className="px-2 py-1 rounded-md bg-black/40 text-xs font-bold text-white backdrop-blur-md flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        {coach.rating}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-12 p-6">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{coach.name}</h3>
                                <p className="text-sm text-blue-400 font-medium mb-4 flex items-center gap-2">
                                    <Trophy className="w-3 h-3" />
                                    {coach.role}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-xs text-slate-500 mb-1">Active Clients</div>
                                        <div className="text-lg font-bold text-white">{coach.activeClients}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-xs text-slate-500 mb-1">Current Load</div>
                                        <div className={cn("text-lg font-bold",
                                            coach.load > 90 ? "text-rose-400" :
                                                coach.load > 70 ? "text-yellow-400" : "text-emerald-400"
                                        )}>
                                            {coach.load}%
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-white/5 pt-4">
                                    <Mail className="w-3 h-3" />
                                    {coach.email}
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </main>
    );
}
