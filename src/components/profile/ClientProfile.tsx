
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { TrendingUp, User, Zap, CreditCard, Edit2, Check, Dumbbell, FileText } from "lucide-react";
import { Client, api } from "@/lib/api";

// Placeholder components for tabs
import { IdentityTab } from "./IdentityTab";
import { StrategyTab } from "./StrategyTab";
import { SubscriptionTab } from "./SubscriptionTab";
import { ProgressTab } from "./ProgressTab";
import { WorkoutPlanTab } from "./WorkoutPlanTab";
import { CheckInsTab } from "./CheckInsTab";
import { OnboardingTab } from "./OnboardingTab";

export function ClientProfile({ clientId, client }: { clientId: string, client: Client }) {
    type TabType = "identity" | "strategy" | "subscription" | "progress" | "workout_plan" | "check_ins" | "onboarding";

    // Default to Identity
    const [activeTab, setActiveTab] = useState<TabType>("identity");
    const [isHeaderEditing, setIsHeaderEditing] = useState(false);
    const [isPlanInteracting, setIsPlanInteracting] = useState(false);
    const [headerData, setHeaderData] = useState({
        full_name: client.full_name,
        status: client.status,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [unreviewedCount, setUnreviewedCount] = useState(0);

    useEffect(() => {
        const fetchUnreviewedCount = async () => {
            const count = await api.getUnreviewedCheckInsCount(clientId);
            setUnreviewedCount(count);
        };
        fetchUnreviewedCount();
    }, [clientId]);

    const handleHeaderSave = async () => {
        setIsLoading(true);
        try {
            await api.updateClient(client.id, {
                full_name: headerData.full_name,
                status: headerData.status,
            });
            setIsHeaderEditing(false);
        } catch (error) {
            console.error("Failed to update client header:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs: { id: TabType; label: string; icon: any; component: any }[] = [
        { id: "identity", label: "Identity", icon: User, component: IdentityTab },
        { id: "onboarding", label: "Onboarding", icon: FileText, component: OnboardingTab },
        { id: "strategy", label: "Strategy", icon: Zap, component: StrategyTab },
        { id: "workout_plan", label: "Workout Plan", icon: Dumbbell, component: WorkoutPlanTab },
        { id: "check_ins", label: "Check-ins", icon: Check, component: CheckInsTab },
        { id: "progress", label: "Progress", icon: TrendingUp, component: ProgressTab },
        { id: "subscription", label: "Subscription", icon: CreditCard, component: SubscriptionTab },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-in slide-in-from-bottom duration-700 relative group">
                {/* Initials Avatar */}
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] ring-2 ring-white/10 shrink-0">
                    <span className="text-xl md:text-3xl font-bold text-white uppercase">{headerData.full_name ? headerData.full_name.substring(0, 2) : 'CL'}</span>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        {isHeaderEditing ? (
                            <input
                                type="text"
                                value={headerData.full_name}
                                onChange={(e) => setHeaderData({ ...headerData, full_name: e.target.value })}
                                className="text-2xl md:text-4xl font-bold text-white bg-transparent border-b border-white/20 px-0 w-full max-w-md focus:outline-none focus:border-secondary transition-all"
                                autoFocus
                            />
                        ) : (
                            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{headerData.full_name || 'Unknown Client'}</h1>
                        )}

                        <div className="relative group/status">
                            {isHeaderEditing ? (
                                <select
                                    value={headerData.status || 'active'}
                                    onChange={(e) => setHeaderData({ ...headerData, status: e.target.value })}
                                    className="appearance-none pl-3 pr-8 py-1 rounded-full border text-xs font-bold bg-slate-900 border-slate-700 text-white focus:outline-none focus:border-secondary cursor-pointer hover:bg-slate-800 transition-colors"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="paused">Paused</option>
                                </select>
                            ) : (
                                <button
                                    onClick={() => setIsHeaderEditing(true)}
                                    className={cn("px-3 py-1 rounded-full border text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:scale-105 transition-transform cursor-pointer",
                                        headerData.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                                    )}
                                    title="Click to edit status"
                                >
                                    {headerData.status || 'Active'}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => isHeaderEditing ? handleHeaderSave() : setIsHeaderEditing(true)}
                            disabled={isLoading}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                            title={isHeaderEditing ? "Save changes" : "Edit Details"}
                        >
                            {isHeaderEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                    </div>

                    <p className="text-slate-400 flex items-center gap-2 text-sm">
                        <span>{client.location || 'Location Not Set'}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="text-blue-400">{client.final_strategy || client.package_name || 'No Plan'}</span>
                    </p>
                </div>

                <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                    <button className="btn-electric bg-transparent border-white/10 !bg-none hover:bg-white/5 shadow-none hover:shadow-none flex-1 md:flex-none text-sm md:text-base">
                        Message
                    </button>
                    <a href={`/clients/${clientId}/check-in`} className="btn-electric flex items-center justify-center flex-1 md:flex-none text-sm md:text-base">
                        Check-in
                    </a>
                </div>
            </div>

            {/* Tabs Layout (Top Navigation) */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap border",
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border-blue-500/50"
                                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.id === 'check_ins' && unreviewedCount > 0 && (
                                <span className={cn(
                                    "ml-1 flex h-2 w-2 relative"
                                )}>
                                    <span className={cn(
                                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                        activeTab === tab.id ? "bg-white" : "bg-red-500"
                                    )}></span>
                                    <span className={cn(
                                        "relative inline-flex rounded-full h-2 w-2",
                                        activeTab === tab.id ? "bg-white" : "bg-red-500"
                                    )}></span>
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="w-full">
                    <GlassCard className="min-h-[500px] p-4 md:p-8 transition-all duration-500" isActive={isPlanInteracting}>
                        {useMemo(() => (
                            <>
                                {activeTab === 'identity' && <IdentityTab clientId={clientId} client={client} />}
                                {activeTab === 'check_ins' && <CheckInsTab clientId={clientId} onReview={() => setUnreviewedCount(c => Math.max(0, c - 1))} />}
                                {activeTab === 'onboarding' && <OnboardingTab clientId={clientId} client={client} onNavigateToWorkout={() => setActiveTab('workout_plan')} />}
                                {activeTab === 'progress' && <ProgressTab clientId={clientId} client={client} />}
                                {activeTab === 'strategy' && <StrategyTab clientId={clientId} client={client} />}
                                {activeTab === 'workout_plan' && <WorkoutPlanTab clientId={clientId} client={client} onInteractionStateChange={setIsPlanInteracting} />}
                                {activeTab === 'subscription' && <SubscriptionTab clientId={clientId} client={client} />}
                            </>
                        ), [activeTab, clientId, client])}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
