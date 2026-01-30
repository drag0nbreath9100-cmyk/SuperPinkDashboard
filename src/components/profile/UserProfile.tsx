"use client";

import { useEffect, useState, useRef } from "react";
import { Coach, api, Client } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, Star, Trophy, Mail, Phone, Edit2, Check, Camera, ShieldCheck, Target, Zap, BarChart3, Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function UserProfile({ initialCoach, initialClients }: { initialCoach: Coach, initialClients: Client[] }) {
    const [coach, setCoach] = useState<Coach>(initialCoach);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: coach.bio || '',
        phone_number: coach.phone_number || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Stats Calculation
    const activeClientsCount = initialClients.filter(c => c.status === 'active').length;
    const maxClients = coach.max_clients || 30;
    const loadPercentage = Math.round((activeClientsCount / maxClients) * 100);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsSaving(true);
        const updated = await api.updateCoach(coach.id, {
            bio: formData.bio,
            phone_number: formData.phone_number
        });

        if (updated) {
            setCoach(updated);
            setIsEditing(false);
        }
        setIsSaving(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `coaches/${coach.id}/avatar_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await api.uploadCoachPhoto(fileName, file);
            if (uploadError) throw new Error("Failed to upload image");

            const publicUrl = api.getPublicUrl(fileName);
            if (!publicUrl) throw new Error("Could not get public URL");

            // Update coach record with new image URL
            const updated = await api.updateCoach(coach.id, { image_url: publicUrl });
            if (updated) {
                setCoach(updated);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload profile picture.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative">
                {/* Banner Background */}
                <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden relative border border-white/10">
                    <div className="absolute inset-0 bg-noise opacity-30" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]" />
                </div>

                {/* Profile Card Overlay */}
                <div className="relative px-6 -mt-20 md:-mt-24 pb-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden shrink-0 relative">
                                {coach.image_url ? (
                                    <img src={coach.image_url} alt={coach.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-slate-800">
                                        {coach.name ? coach.name[0] : 'U'}
                                    </div>
                                )}

                                {/* Loading Overlay */}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Upload Button Overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100 z-10"
                                disabled={isUploading}
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Info & Stats */}
                        <div className="flex-1 pt-4 md:pt-24 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{coach.name}</h1>
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium flex items-center gap-1.5">
                                            <Trophy className="w-3 h-3" />
                                            {coach.role ? coach.role.replace('_', ' ').toUpperCase() : 'COACH'}
                                        </span>
                                        {coach.rating && (
                                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium flex items-center gap-1.5">
                                                <Star className="w-3 h-3 fill-yellow-400" />
                                                {coach.rating} Rating
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    disabled={isSaving}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${isEditing
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    {isSaving ? (
                                        <span className="animate-spin">⌛</span>
                                    ) : isEditing ? (
                                        <>
                                            <Check className="w-4 h-4" /> Save Changes
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" /> Edit Profile
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Main Grid Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Stats & Load */}
                                <div className="space-y-6 lg:col-span-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <GlassCard className="p-4 flex flex-col justify-between h-full bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Clients</span>
                                            </div>
                                            <div className="text-3xl font-bold text-white mb-1">{activeClientsCount}</div>
                                            <div className="text-xs text-slate-400 font-medium">Active now</div>
                                        </GlassCard>

                                        <GlassCard className="p-4 flex flex-col justify-between h-full bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</span>
                                            </div>
                                            <div className="flex items-end gap-2 mb-1">
                                                <div className="text-3xl font-bold text-white">{maxClients}</div>
                                                <span className="text-sm text-slate-500 mb-1.5">max</span>
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">Load Limit</div>
                                        </GlassCard>

                                        <GlassCard className={`p-4 flex flex-col justify-between h-full transition-colors ${loadPercentage > 90 ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20' :
                                            'bg-purple-500/5 hover:bg-purple-500/10'
                                            }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 rounded-lg bg-white/5 text-white">
                                                    <BarChart3 className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Utilization</span>
                                            </div>
                                            <div className={`text-3xl font-bold mb-1 ${loadPercentage > 90 ? 'text-rose-400' :
                                                loadPercentage > 75 ? 'text-yellow-400' : 'text-purple-400'
                                                }`}>
                                                {loadPercentage}%
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${loadPercentage > 90 ? 'bg-rose-500' :
                                                        loadPercentage > 75 ? 'bg-yellow-500' : 'bg-purple-500'
                                                        }`}
                                                    style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                                                />
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* Performance Metrics */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <GlassCard className="p-4 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Speed to Plan</span>
                                            </div>
                                            <div className="text-2xl font-bold text-white mb-1">
                                                {(() => {
                                                    const metrics = initialClients.reduce((acc, c) => {
                                                        const created = c.created_at ? new Date(c.created_at).getTime() : 0;
                                                        const plan = c.workout_plan_created_at ? new Date(c.workout_plan_created_at).getTime() : 0;
                                                        if (created && plan && plan > created) {
                                                            acc.total += (plan - created);
                                                            acc.count++;
                                                        }
                                                        return acc;
                                                    }, { total: 0, count: 0 });

                                                    if (metrics.count === 0) return "N/A";
                                                    const hours = Math.round(metrics.total / metrics.count / (1000 * 60 * 60));
                                                    return hours > 24 ? `${Math.round(hours / 24)}d ${hours % 24}h` : `${hours}h`;
                                                })()}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">Avg. Lead → Workout Plan</div>
                                        </GlassCard>

                                        <GlassCard className="p-4 bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                                    <Zap className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Speed to Active</span>
                                            </div>
                                            <div className="text-2xl font-bold text-white mb-1">
                                                {(() => {
                                                    const metrics = initialClients.reduce((acc, c) => {
                                                        const created = c.created_at ? new Date(c.created_at).getTime() : 0;
                                                        const active = c.active_status_at ? new Date(c.active_status_at).getTime() : 0;
                                                        if (created && active && active > created) {
                                                            acc.total += (active - created);
                                                            acc.count++;
                                                        }
                                                        return acc;
                                                    }, { total: 0, count: 0 });

                                                    if (metrics.count === 0) return "N/A";
                                                    const hours = Math.round(metrics.total / metrics.count / (1000 * 60 * 60));
                                                    return hours > 24 ? `${Math.round(hours / 24)}d ${hours % 24}h` : `${hours}h`;
                                                })()}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium">Avg. Lead → Active Client</div>
                                        </GlassCard>
                                    </div>
                                </div>

                                {/* Right Column: Bio & Contact */}
                                <div className="space-y-6">
                                    <GlassCard className="p-6 space-y-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" /> About You
                                            </h3>
                                            {isEditing ? (
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                                                    placeholder="Enter your bio..."
                                                />
                                            ) : (
                                                <p className="text-slate-300 leading-relaxed text-sm">
                                                    {coach.bio || "No bio available."}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-slate-500">Email Address</div>
                                                    <div className="text-sm font-medium text-white truncate">{coach.email}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-slate-500">Phone Number</div>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={formData.phone_number}
                                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                                            placeholder="+1 234..."
                                                        />
                                                    ) : (
                                                        <div className="text-sm font-medium text-white">{coach.phone_number || "Not set"}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
