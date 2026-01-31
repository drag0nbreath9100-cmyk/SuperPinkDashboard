"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Moon, Heart, Smile, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client, api } from "@/lib/api";
import { useState } from "react";
import { EditSaveButton } from "./shared/EditSaveButton";
import { ProfileInput } from "./shared/ProfileInput";
import { ProfileTextarea } from "./shared/ProfileTextarea";

export function LifestyleTab({ clientId, client }: { clientId: string, client?: Client }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Safety check just in case, though parent handles it
    if (!client) return <div>Loading...</div>;

    const [formData, setFormData] = useState({
        stress_level: client.stress_level || 0,
        sleep_hours_nightly: client.sleep_hours_nightly,
        family_support: client.family_support,
        psych_struggles: client.psych_struggles,
        main_goal_text: client.main_goal_text,
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.updateClient(client.id, {
                stress_level: Number(formData.stress_level),
                sleep_hours_nightly: formData.sleep_hours_nightly,
                family_support: formData.family_support,
                psych_struggles: formData.psych_struggles,
                main_goal_text: formData.main_goal_text,
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update lifestyle:", error);
            alert("Failed to save changes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Use formData for current display values when editing, otherwise client or formData (since updated)
    const stressLevel = Number(formData.stress_level) || 0;

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-end mb-2">
                <EditSaveButton
                    isEditing={isEditing}
                    isLoading={isLoading}
                    onEdit={() => setIsEditing(true)}
                    onSave={handleSave}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stress Card with Conditional Logic */}
                <div className={cn(
                    "p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden group",
                    stressLevel >= 8
                        ? "bg-rose-950/30 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.3)]" // Red Glow
                        : "bg-white/5 border-white/5"
                )}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={cn("text-lg font-bold flex items-center gap-2", stressLevel >= 8 ? "text-rose-400" : "text-white")}>
                            <Zap className="w-5 h-5" /> Stress Load
                        </h3>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <ProfileInput
                                    isEditing={true}
                                    type="number"
                                    min={0} max={10}
                                    value={formData.stress_level}
                                    onChange={(e) => handleChange('stress_level', e.target.value)}
                                    className="w-16 bg-black/40 text-right font-bold text-xl"
                                />
                                <span className={cn("text-xl font-bold", stressLevel >= 8 ? "text-rose-500" : "text-emerald-400")}>/10</span>
                            </div>
                        ) : (
                            <span className={cn("text-2xl font-bold", stressLevel >= 8 ? "text-rose-500" : "text-emerald-400")}>
                                {stressLevel}/10
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-2">
                        <div
                            className={cn("h-full rounded-full transition-all duration-500", stressLevel >= 8 ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" : "bg-emerald-500")}
                            style={{ width: `${Math.min(100, stressLevel * 10)}%` }}
                        />
                    </div>

                    {stressLevel >= 8 && (
                        <p className="text-xs text-rose-300 font-medium mt-2 flex items-center gap-1 animate-pulse">
                            ⚠️ Critical Levels Detected
                        </p>
                    )}
                </div>

                {/* Sleep Card (Normal) */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Moon className="w-5 h-5 text-blue-400" /> Sleep Quality
                        </h3>
                        <div className="text-2xl font-bold text-blue-400 flex items-baseline gap-1">
                            <ProfileInput
                                isEditing={isEditing}
                                value={formData.sleep_hours_nightly}
                                onChange={(e) => handleChange('sleep_hours_nightly', e.target.value)}
                                className={isEditing ? "w-24 bg-white/5 border border-white/10 rounded px-2 text-xl font-bold" : ""}
                            />
                            <span className="text-sm font-normal text-slate-500">hrs</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Deep sleep phase requires improvement.</p>
                </div>

                <GlassCard className="text-center space-y-3 p-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Heart className="w-6 h-6" />
                    </div>
                    <div>
                        <ProfileInput
                            isEditing={isEditing}
                            value={formData.family_support}
                            onChange={(e) => handleChange('family_support', e.target.value)}
                            className={isEditing ? "w-full bg-white/5 border border-white/10 rounded px-2 text-xl font-bold text-center" : "text-2xl font-bold text-white"}
                            placeholder="Unknown"
                        />
                        <div className="text-sm text-muted-foreground mt-1">Family Support</div>
                    </div>
                </GlassCard>

                {/* Psychology Section */}
                <GlassCard className="md:col-span-2 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Psychological Profile</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h4 className="text-white font-medium mb-1">Adherence Struggles</h4>
                            {isEditing ? (
                                <ProfileTextarea
                                    isEditing={true}
                                    value={formData.psych_struggles}
                                    onChange={(e) => handleChange('psych_struggles', e.target.value)}
                                    className="bg-black/20 text-sm p-2"
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {formData.psych_struggles || 'No specific struggles reported.'}
                                </p>
                            )}
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h4 className="text-white font-medium mb-1">Main Goal</h4>
                            {isEditing ? (
                                <ProfileTextarea
                                    isEditing={true}
                                    value={formData.main_goal_text}
                                    onChange={(e) => handleChange('main_goal_text', e.target.value)}
                                    className="bg-black/20 text-sm p-2"
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {formData.main_goal_text || 'No main goal description provided.'}
                                </p>
                            )}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

