"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowLeft, Star, Mail, Phone, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, Coach } from "@/lib/api";
import { CoachLoadEditor } from "@/components/head-coach/CoachLoadEditor";
import { AnimatedStatsGrid } from "@/components/coach/AnimatedStatsGrid";
import { EnhancedClientRoster } from "@/components/coach/EnhancedClientRoster";
import { ActivityFeed } from "@/components/coach/ActivityFeed";

export default function HeadCoachCoachDetailPage() {
    const params = useParams();
    const coachId = params?.id as string;
    const [coach, setCoach] = useState<Coach | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (coachId) {
            loadCoachData();
        }
    }, [coachId]);

    async function loadCoachData() {
        setIsLoading(true);
        try {
            const currentCoach = await api.getCoach(coachId);
            setCoach(currentCoach);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;
    if (!coach) return <div className="min-h-screen flex items-center justify-center text-white">Coach not found</div>;

    const maxLoad = coach.max_load || 30;
    const currentLoad = coach.current_load || 0; // Or fetch dynamically if needed
    const loadPercentage = Math.round((currentLoad / maxLoad) * 100);

    return (
        <main className="min-h-screen p-8 lg:p-16 space-y-8 relative overflow-hidden bg-[#020617]">
            {/* Background Ambience */}
            <div className="fixed top-0 right-0 w-[50%] h-full bg-indigo-900/5 pointer-events-none" />
            <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation */}
            <div className="relative z-20 mb-8">
                <Link href="/head-coach/coaches" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Roster
                </Link>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Profile & Key Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <GlassCard className="p-8 flex flex-col items-center text-center relative overflow-hidden border-indigo-500/20 bg-indigo-950/10">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent opacity-50" />

                        <div className="relative w-40 h-40 mb-6">
                            <div className="absolute inset-0 bg-indigo-500 blur-[40px] opacity-40 rounded-full" />
                            <div className="w-40 h-40 rounded-full p-1.5 bg-gradient-to-br from-indigo-400 via-purple-500 to-indigo-900 overflow-hidden relative z-10 box-glow">
                                <img
                                    src={coach.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${coach.name}`}
                                    alt={coach.name}
                                    className="w-full h-full rounded-full object-cover bg-black"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 z-20 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-white font-bold text-sm">{coach.rating}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">{coach.name}</h1>
                        <p className="text-indigo-300 font-medium tracking-wide uppercase text-xs bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-6">
                            {coach.specialization || "Performance Specialist"}
                        </p>

                        <div className="w-full grid grid-cols-2 gap-2 py-6 border-t border-white/5 border-b mb-6">
                            <div className="text-center border-r border-white/5">
                                <div className="text-2xl font-bold text-white mb-1">{maxLoad}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacity</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold mb-1 ${loadPercentage > 90 ? 'text-red-400' : 'text-emerald-400'}`}>{loadPercentage}%</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Load</div>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <CoachLoadEditor coach={coach} onUpdate={(val) => {
                                setCoach(prev => prev ? { ...prev, max_load: val } : null)
                            }} />

                            <div className="flex flex-col gap-3 w-full pt-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5">
                                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                                    <span className="truncate">{coach.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5">
                                    <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                                    <span>+1 (555) 000-0000</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Activity Feed in Sidebar */}
                    <div className="space-y-4">
                        <ActivityFeed coachId={coachId} />
                    </div>
                </div>

                {/* RIGHT COLUMN: Client List & Stats (Replica of Coach View) */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-indigo-400" />
                        Coach Dashboard View
                    </h2>

                    {/* Reused Stats Grid (Impersonated) */}
                    <AnimatedStatsGrid coachId={coachId} />

                    {/* Reused Client Roster (Impersonated) */}
                    <EnhancedClientRoster coachId={coachId} />
                </div>
            </div>
        </main>
    );
}
