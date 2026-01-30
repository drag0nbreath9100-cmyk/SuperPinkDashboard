import { AnimatedStatsGrid } from "@/components/coach/AnimatedStatsGrid";
import { EnhancedClientRoster } from "@/components/coach/EnhancedClientRoster";
import { ActivityFeed } from "@/components/coach/ActivityFeed";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { CoachAnalytics } from "@/components/coach/CoachAnalytics";
import { GlassCard } from "@/components/ui/GlassCard";
import { Dumbbell, Activity, Sparkles } from "lucide-react";
import { api, CURRENT_COACH_ID } from "@/lib/api";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getCoachData(coachId: string) {
    try {
        const [coach, stats] = await Promise.all([
            api.getCoach(coachId),
            api.getCoachStats(coachId)
        ]);
        return { coach, stats };
    } catch (error) {
        console.error("Failed to fetch coach data", error);
        return {
            coach: null,
            stats: { activeClients: 0, pendingCheckins: 0, expiringClients: 0 }
        };
    }
}

export default async function CoachPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { coach, stats } = await getCoachData(user.id);
    // Fallback name if profile isn't fully set up logic might be needed, 
    // but api.getCoach returns profile data usually.
    // If api.getCoach fails (e.g. RLS or no row), coach might be null.
    // We should fallback to user metadata or something.

    // api.getCoach and this query both fetch from the coaches table (now the source of truth)
    const { data: profile } = await supabase.from('coaches').select('*').eq('id', user.id).single();
    const coachName = profile?.name?.split(' ')[0] || coach?.name?.split(' ')[0] || "Coach";

    // Get current greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 pb-24 relative animate-in fade-in duration-700">
            {/* Dynamic Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse opacity-50" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] animate-pulse opacity-30" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <Dumbbell className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-mono text-primary tracking-widest uppercase">Coach Dashboard</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {greeting}, <span className="accent-text">{coachName}</span>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            System Status: <span className="text-emerald-400 font-medium">Online & Synchronized</span>
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <GlassCard className="py-2.5 px-4 flex items-center gap-3 !bg-white/5 hover:!bg-white/10 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                                <span className="text-sm font-medium text-white">Active</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-sm text-muted-foreground">Score: <span className="text-white font-bold">92</span></span>
                            </div>
                        </GlassCard>
                    </div>
                </header>

                {/* Stats Grid */}
                <AnimatedStatsGrid coachId={user.id} />

                {/* Analytics Section - Full Width */}
                <CoachAnalytics coachId={user.id} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Client Roster */}
                    <div className="lg:col-span-2">
                        <EnhancedClientRoster coachId={user.id} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Activity Feed */}
                        <ActivityFeed coachId={user.id} />

                        {/* Weekly Insights */}
                        <WeeklyInsights coachId={user.id} />
                    </div>
                </div>
            </div>
        </main>
    );
}
