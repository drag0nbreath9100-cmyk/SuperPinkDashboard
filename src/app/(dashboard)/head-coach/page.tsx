"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldCheck, Activity, Users, ChevronRight } from "lucide-react";
import { HeadCoachStatsGrid } from "@/components/head-coach/HeadCoachStatsGrid";
import { CoachPerformanceList } from "@/components/head-coach/CoachPerformanceList";
import { TeamActivityFeed } from "@/components/head-coach/TeamActivityFeed";
import { TeamInsights } from "@/components/head-coach/TeamInsights";
import Link from "next/link";

export default function HeadCoachDashboard() {
    // Get current greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 pb-24 relative animate-in fade-in duration-700">
            {/* Dynamic Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse opacity-50" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] animate-pulse opacity-30" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-sm font-mono text-indigo-400 tracking-widest uppercase">Head Coach Command</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {greeting}, <span className="accent-text">Coach</span>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            System Status: <span className="text-emerald-400 font-medium">Online & Synchronized</span>
                        </p>
                    </div>

                    {/* Status Badge & Quick Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/head-coach/coaches">
                            <GlassCard className="py-2.5 px-4 flex items-center gap-3 !bg-white/5 hover:!bg-white/10 cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-medium text-white">Manage Coaches</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </GlassCard>
                        </Link>
                        <GlassCard className="py-2.5 px-4 flex items-center gap-3 !bg-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                            <span className="text-sm font-medium text-white">All Systems Active</span>
                        </GlassCard>
                    </div>
                </header>

                {/* Stats Grid */}
                <HeadCoachStatsGrid />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Coach Performance List */}
                    <div className="lg:col-span-2">
                        <CoachPerformanceList />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Team Activity Feed */}
                        <TeamActivityFeed />

                        {/* Team Insights */}
                        <TeamInsights />
                    </div>
                </div>
            </div>
        </main>
    );
}
