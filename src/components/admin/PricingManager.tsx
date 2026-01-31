"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { api } from "@/lib/api";
import { Edit2, Save, X, Tag, Calendar, Plus, Clock, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
    id: number;
    name: string;
    price: number;
    description: string;
    features: string[];
    duration_months?: number;
    discount_percent?: number;
    offer_name?: string;
    offer_start_date?: string;
    offer_end_date?: string;
}

interface GroupedPlan {
    name: string;
    plans: Plan[];
}

export function PricingManager() {
    const [groupedPlans, setGroupedPlans] = useState<GroupedPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Track selected duration for each group: { "Standard": planId }
    const [selectedPlanIds, setSelectedPlanIds] = useState<Record<string, number>>({});

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Plan>>({});
    // Default to grid view as it is now condensed
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [topPerformingPlan, setTopPerformingPlan] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const [plansData, stats] = await Promise.all([
            api.getPlans(),
            api.getDashboardStats()
        ]);

        // Group plans by name
        const groups: Record<string, Plan[]> = {};
        plansData.forEach(p => {
            if (!groups[p.name]) groups[p.name] = [];
            groups[p.name].push(p);
        });

        const groupedArray = Object.keys(groups).map(name => {
            const plans = groups[name].sort((a, b) => (a.duration_months || 0) - (b.duration_months || 0));
            return { name, plans };
        });

        // Initialize selections to the first plan in each group (shortest duration usually)
        const initialSelections: Record<string, number> = {};
        groupedArray.forEach(g => {
            if (g.plans.length > 0) initialSelections[g.name] = g.plans[0].id;
        });

        setGroupedPlans(groupedArray);
        setSelectedPlanIds(initialSelections);

        // Improve top performer detection logic
        if (stats.revenueByPlan && stats.revenueByPlan.length > 0) {
            const top = stats.revenueByPlan.reduce((max, current) => (current.value > max.value ? current : max), stats.revenueByPlan[0]);
            setTopPerformingPlan(top.name);
        }

        setIsLoading(false);
    };

    const handleEdit = (plan: Plan) => {
        setEditingId(plan.id);
        setEditForm({
            price: plan.price,
            discount_percent: plan.discount_percent || 0,
            offer_name: plan.offer_name || '',
            offer_start_date: plan.offer_start_date ? new Date(plan.offer_start_date).toISOString().split('T')[0] : '',
            offer_end_date: plan.offer_end_date ? new Date(plan.offer_end_date).toISOString().split('T')[0] : '',
        });
    };

    const handleSave = async (id: number) => {
        const discount = Number(editForm.discount_percent);

        if (discount > 0) {
            if (!editForm.offer_name) {
                alert("Please name the offer.");
                return;
            }
            if (!editForm.offer_start_date || !editForm.offer_end_date) {
                alert("Please schedule the offer.");
                return;
            }
        }

        const updates = {
            price: Number(editForm.price),
            discount_percent: discount,
            offer_name: editForm.offer_name || undefined,
            offer_start_date: editForm.offer_start_date ? new Date(editForm.offer_start_date).toISOString() : undefined,
            offer_end_date: editForm.offer_end_date ? new Date(editForm.offer_end_date).toISOString() : undefined,
        };

        const success = await api.updatePricingPlan(id, updates);
        if (success) {
            setGroupedPlans(prev => prev.map(group => ({
                ...group,
                plans: group.plans.map(p => p.id === id ? { ...p, ...updates } : p)
            })));
            setEditingId(null);
        } else {
            alert("Failed to save.");
        }
    };

    if (isLoading) return <div className="text-slate-400 p-4">Loading pricing module...</div>;

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Pricing & Offers</h2>
                        <p className="text-slate-400 text-sm">Manage base prices and schedule limited-time promotions.</p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {groupedPlans.map((group) => {
                    const isTopPerformer = topPerformingPlan === group.name;
                    // Get currently currently selected sub-plan ID
                    const activePlanId = selectedPlanIds[group.name];
                    // Find the plan object
                    const activePlan = group.plans.find(p => p.id === activePlanId) || group.plans[0];

                    if (!activePlan) return null;

                    const isEditing = editingId === activePlan.id;
                    const now = new Date();
                    const start = activePlan.offer_start_date ? new Date(activePlan.offer_start_date) : null;
                    const end = activePlan.offer_end_date ? new Date(activePlan.offer_end_date) : null;

                    const isActiveOffer = !isEditing &&
                        activePlan.discount_percent !== undefined &&
                        activePlan.discount_percent > 0 &&
                        (!start || start <= now) &&
                        (!end || end >= now);

                    const discountValue = activePlan.price * ((activePlan.discount_percent || 0) / 100);
                    const finalPrice = activePlan.price - discountValue;

                    return (
                        <GlassCard
                            key={group.name}
                            className={cn("p-6 relative overflow-hidden transition-all group hover:border-white/10 flex flex-col justify-between min-h-[300px]",
                                isTopPerformer ? "border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : ""
                            )}
                        >
                            {/* Top Badge */}
                            <div className="absolute top-0 right-0 z-10 flex flex-col items-end">
                                {isTopPerformer && (
                                    <div className="bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1 mb-1">
                                        <TrendingUp className="w-3 h-3" /> BEST SELLER
                                    </div>
                                )}
                                {isActiveOffer && (
                                    <div className="bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> ACTIVE OFFER
                                    </div>
                                )}
                            </div>

                            {/* Header Section */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{group.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {group.plans.map(p => {
                                        const isPlanActiveOffer = !!(p.discount_percent && p.discount_percent > 0
                                            && (!p.offer_start_date || new Date(p.offer_start_date) <= new Date())
                                            && (!p.offer_end_date || new Date(p.offer_end_date) >= new Date()));

                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedPlanIds(prev => ({ ...prev, [group.name]: p.id }));
                                                    setEditingId(null);
                                                }}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5",
                                                    selectedPlanIds[group.name] === p.id
                                                        ? "bg-white text-black border-white"
                                                        : "bg-black/20 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                                                )}
                                            >
                                                {(p.duration_months || 1) === 1 ? 'Monthly' : `${p.duration_months} Months`}
                                                {isPlanActiveOffer && (
                                                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">%</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="flex-1 flex flex-col justify-start pt-0 pb-4">
                                {isEditing ? (
                                    <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10 animate-in fade-in zoom-in-95">
                                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Editing {(activePlan.duration_months || 1) === 1 ? 'Monthly' : `${activePlan.duration_months} Months`}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSave(activePlan.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"><Save className="w-4 h-4" /></button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30"><X className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Price ($)</label>
                                                <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-emerald-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Discount (%)</label>
                                                <input type="number" value={editForm.discount_percent} onChange={e => setEditForm({ ...editForm, discount_percent: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-emerald-500 outline-none" />
                                            </div>
                                        </div>

                                        {(editForm.discount_percent || 0) > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                                <div>
                                                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Offer Name</label>
                                                    <input type="text" value={editForm.offer_name || ''} onChange={e => setEditForm({ ...editForm, offer_name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-emerald-500 outline-none" placeholder="e.g. Summer Sale" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Start Date</label>
                                                        <input type="date" value={editForm.offer_start_date || ''} onChange={e => setEditForm({ ...editForm, offer_start_date: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white" style={{ colorScheme: 'dark' }} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">End Date</label>
                                                        <input type="date" value={editForm.offer_end_date || ''} onChange={e => setEditForm({ ...editForm, offer_end_date: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white" style={{ colorScheme: 'dark' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div>
                                            {isActiveOffer ? (
                                                <div className="animate-in fade-in slide-in-from-left-2">
                                                    <div className="text-sm text-slate-400 line-through font-medium mb-1">${activePlan.price}</div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-5xl font-bold text-white tracking-tight">${finalPrice.toFixed(0)}</div>
                                                        <div className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                                            -{activePlan.discount_percent}%
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                                        <Tag className="w-3 h-3" />
                                                        {activePlan.offer_name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="animate-in fade-in slide-in-from-left-2 group">
                                                    <div className="text-5xl font-bold text-white tracking-tight">${activePlan.price}</div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="text-sm text-slate-500 font-medium">Standard Price</div>
                                                        <button
                                                            onClick={() => {
                                                                handleEdit(activePlan);
                                                                setEditForm(prev => ({ ...prev, discount_percent: 10 }));
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold hover:bg-purple-500/30 flex items-center gap-1"
                                                        >
                                                            <Plus className="w-3 h-3" /> Add Offer
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleEdit(activePlan)}
                                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer/Info */}
                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-slate-600" />
                                    <span>{activePlan.description || "Includes standard features"}</span>
                                </div>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            {groupedPlans.length === 0 && !isLoading && (
                <div className="text-center py-12 text-slate-500 text-sm">No pricing plans found.</div>
            )}
        </div>
    );
}
