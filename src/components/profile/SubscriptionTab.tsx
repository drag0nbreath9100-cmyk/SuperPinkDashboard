"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Calendar, CreditCard, Clock } from "lucide-react";
import { Client, api } from "@/lib/api";
import { useState } from "react";
import { EditSaveButton } from "./shared/EditSaveButton";
import { ProfileInput } from "./shared/ProfileInput";
import { cn } from "@/lib/utils";

export function SubscriptionTab({ clientId, client }: { clientId: string, client?: Client }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!client) return <div>Loading...</div>;

    // Local state should mirror the client shape initially
    // We treat string dates as strings for the input, converting back/forth as needed
    const [formData, setFormData] = useState({
        package_name: client.package_name,
        status: client.status,
        subscription_end_date: client.subscription_end_date ? new Date(client.subscription_end_date).toISOString().split('T')[0] : '', // YYYY-MM-DD
        subscription_start_date: client.subscription_start_date ? new Date(client.subscription_start_date).toISOString().split('T')[0] : '',
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.updateClient(client.id, {
                package_name: formData.package_name,
                status: formData.status as 'active' | 'inactive' | 'pending' | 'archived',
                subscription_end_date: formData.subscription_end_date,
                subscription_start_date: formData.subscription_start_date,
                active_status_at: (client.status !== 'active' && formData.status === 'active') ? new Date().toISOString() : client.active_status_at
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update subscription:", error);
            alert("Failed to save changes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isActive = formData.status === 'active' || !!client.active_subscription; // Fallback logic slightly mixed
    // For display, use formData to show live updates
    const expiryDate = formData.subscription_end_date ? new Date(formData.subscription_end_date) : new Date();
    const startDate = formData.subscription_start_date ? new Date(formData.subscription_start_date) : new Date();

    // Calculate days remaining
    const daysRemaining = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Calculate progress
    const totalDuration = expiryDate.getTime() - startDate.getTime();
    const elapsed = new Date().getTime() - startDate.getTime();
    const progress = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <EditSaveButton
                    isEditing={isEditing}
                    isLoading={isLoading}
                    onEdit={() => setIsEditing(true)}
                    onSave={handleSave}
                />
            </div>

            {/* Current Plan Status */}
            <GlassCard className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20 p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary box-glow shrink-0">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="w-full">
                            {isEditing ? (
                                <ProfileInput
                                    isEditing={true}
                                    value={formData.package_name}
                                    onChange={(e) => handleChange('package_name', e.target.value)}
                                    className="text-xl font-bold bg-black/20 w-full mb-2"
                                    placeholder="Package Name"
                                />
                            ) : (
                                <h3 className="text-xl font-bold text-white">{formData.package_name || 'Standard Coaching Plan'}</h3>
                            )}

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {isEditing ? (
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="bg-black/20 border border-white/10 rounded text-white text-xs p-1"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                ) : (
                                    <>
                                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                                        {formData.status === 'active' ? 'Active Status' : 'Inactive'}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right w-full md:w-auto">
                        <div className="text-sm text-muted-foreground">Renewal Date</div>
                        {isEditing ? (
                            <input
                                type="date"
                                value={formData.subscription_end_date}
                                onChange={(e) => handleChange('subscription_end_date', e.target.value)}
                                className="bg-black/20 text-white border border-white/10 rounded p-1 text-lg font-bold"
                            />
                        ) : (
                            <div className="text-2xl font-bold text-white">{expiryDate.toLocaleDateString()}</div>
                        )}

                        {isActive && daysRemaining > 0 && !isEditing && (
                            <div className="text-xs text-rose-400 font-medium animate-pulse">Expires in {daysRemaining} days</div>
                        )}
                    </div>
                </div>

                {/* Timeline Bar */}
                <div className="mt-8">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        {isEditing ? (
                            <div className="flex flex-col">
                                <span>Start Date</span>
                                <input
                                    type="date"
                                    value={formData.subscription_start_date}
                                    onChange={(e) => handleChange('subscription_start_date', e.target.value)}
                                    className="bg-black/20 text-white border border-white/10 rounded p-1 mt-1"
                                />
                            </div>
                        ) : (
                            <span>Start: {startDate.toLocaleDateString()}</span>
                        )}

                        {!isEditing && <span>End: {expiryDate.toLocaleDateString()}</span>}
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                        <div
                            className="h-full bg-primary box-glow transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {(!formData.status || formData.status === 'inactive' || formData.status === 'pending' || (formData.status === 'active' && daysRemaining <= 0)) && (
                    <NeonButton
                        variant="primary"
                        className="flex-1"
                        isLoading={isLoading}
                        onClick={async () => {
                            setIsLoading(true);
                            const now = new Date();
                            const durationDays = client.subscription_total_days || 30; // Use DB value or default to 30
                            const endDate = new Date(now);
                            endDate.setDate(now.getDate() + durationDays);

                            const newStatus = 'active';
                            const newStart = now.toISOString().split('T')[0];
                            const newEnd = endDate.toISOString().split('T')[0];

                            try {
                                await api.updateClient(client.id, {
                                    status: newStatus,
                                    subscription_start_date: newStart,
                                    subscription_end_date: newEnd,
                                    active_status_at: new Date().toISOString()
                                });
                                // Update local state immediately
                                setFormData(prev => ({
                                    ...prev,
                                    status: newStatus,
                                    subscription_start_date: newStart,
                                    subscription_end_date: newEnd
                                }));
                            } catch (e) {
                                console.error(e);
                                alert("Failed to activate");
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                    >
                        {formData.status === 'active' ? 'Renew Subscription' : 'Activate Membership'}
                    </NeonButton>
                )}

                <NeonButton
                    variant="ghost"
                    className="flex-1"
                    isLoading={isLoading}
                    onClick={async () => {
                        setIsLoading(true);
                        const isPaused = formData.status === 'paused';
                        const newStatus = isPaused ? 'active' : 'paused';

                        try {
                            await api.updateClient(client.id, { status: newStatus });
                            setFormData(prev => ({ ...prev, status: newStatus }));
                        } catch (e) {
                            console.error(e);
                            alert("Failed to update status");
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    {formData.status === 'paused' ? 'Unpause Membership' : 'Pause Membership'}
                </NeonButton>

                <NeonButton
                    variant="danger"
                    className="flex-1"
                    isLoading={isLoading}
                    onClick={async () => {
                        if (!confirm("Are you sure you want to cancel this plan?")) return;
                        setIsLoading(true);
                        try {
                            await api.updateClient(client.id, { status: 'inactive' });
                            setFormData(prev => ({ ...prev, status: 'inactive' }));
                        } catch (e) {
                            console.error(e);
                            alert("Failed to deactivate");
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    Cancel Plan
                </NeonButton>
            </div>

            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">History</h3>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="text-muted-foreground bg-white/5 p-2 rounded">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">Monthly Renewal</div>
                                    <div className="text-xs text-muted-foreground">Jan 6, 2026</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-mono">$150.00</div>
                                <div className="text-xs text-emerald-400">Paid</div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}

