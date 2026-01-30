"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function NewClientDialog({ onClientAdded }: { onClientAdded?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        coach_id: "",
        plan_category: "", // "Super Pink", "Super Daily", etc.
        plan_duration: "", // "1", "3", "6"
    });

    useEffect(() => {
        if (open) {
            loadPlans();
        }
    }, [open]);

    const loadPlans = async () => {
        const p = await api.getPlans();
        setPlans(p || []);
    };

    // Derived lists
    const uniqueCategories = Array.from(new Set(plans.map(p => p.name)));
    const availableDurations = plans
        .filter(p => p.name === formData.plan_category)
        .sort((a, b) => a.duration_months - b.duration_months);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Find selected plan
            const selectedPlan = plans.find(p =>
                p.name === formData.plan_category &&
                p.duration_months === Number(formData.plan_duration)
            );

            if (!selectedPlan) throw new Error("Invalid plan selected");

            // Create payload
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone_number: formData.phone_number,
                coach_id: formData.coach_id || null, // Optional, can be assigned later
                status: 'active',
                subscribed_plan_id: selectedPlan.id,
                plan_start_date: new Date().toISOString(),
                // Legacy fields if needed for compatibility
                package_name: selectedPlan.name,
                subscription_duration_amount: selectedPlan.duration_months,
                subscription_duration_unit: 'months'
            };

            const { error } = await supabase
                .from('client_profiles')
                .insert([payload]);

            if (error) throw error;

            setOpen(false);
            setFormData({ full_name: "", email: "", phone_number: "", coach_id: "", plan_category: "", plan_duration: "" });
            if (onClientAdded) onClientAdded();

            // Allow time for DB propagation/revalidation if needed
            window.location.reload();

        } catch (error) {
            console.error("Failed to create client:", error);
            alert("Failed to create client. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="btn-electric group">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>New Lead</span>
                </button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900/95 border-white/10 text-white backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h4 className="text-sm font-semibold text-slate-400">Subscription Plan</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Plan Category</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.plan_category}
                                    onChange={e => setFormData({ ...formData, plan_category: e.target.value, plan_duration: "" })}
                                    required
                                >
                                    <option value="" className="bg-slate-900">Select Plan...</option>
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Duration</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.plan_duration}
                                    onChange={e => setFormData({ ...formData, plan_duration: e.target.value })}
                                    required
                                    disabled={!formData.plan_category}
                                >
                                    <option value="" className="bg-slate-900">Select Duration...</option>
                                    {availableDurations.map(p => (
                                        <option key={p.id} value={p.duration_months} className="bg-slate-900">
                                            {p.duration_months} Months (${p.price})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-electric flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create Client
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
