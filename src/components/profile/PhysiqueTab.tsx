"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Client, api } from "@/lib/api";
import { Ruler, Weight, Activity as ActivityIcon, Check as CheckIcon, AlertCircle } from "lucide-react";
import { useState } from "react";
import { EditSaveButton } from "./shared/EditSaveButton";
import { ProfileInput } from "./shared/ProfileInput";
import { ProfileTextarea } from "./shared/ProfileTextarea";

export function PhysiqueTab({ clientId, client }: { clientId: string, client?: Client }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        weight_kg: client?.weight_kg || 0,
        height_cm: client?.height_cm || 0,
        calculated_bmi: client?.calculated_bmi || 0,
        body_fat_location: client?.body_fat_location || '',
        injuries_history: client?.injuries_history || '',
        menstrual_cycle_status: client?.menstrual_cycle_status || '',
    });

    if (!client) return <div>Loading...</div>;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.updateClient(client.id, {
                weight_kg: Number(formData.weight_kg),
                height_cm: Number(formData.height_cm),
                calculated_bmi: Number(formData.calculated_bmi),
                body_fat_location: formData.body_fat_location,
                injuries_history: formData.injuries_history,
                menstrual_cycle_status: formData.menstrual_cycle_status,
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update physique:", error);
            alert("Failed to save changes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper text classes to keep inputs looking like their display counterparts
    const bigInputClass = "text-3xl font-bold bg-transparent border-b border-primary/30 focus:border-primary px-0 rounded-none w-24 text-center";

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="space-y-2 p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Weight className="w-4 h-4 text-primary" />
                        <span>Weight</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <ProfileInput
                            isEditing={isEditing}
                            type="number"
                            value={formData.weight_kg}
                            onChange={(e) => handleChange('weight_kg', e.target.value)}
                            className={isEditing ? bigInputClass : "text-3xl font-bold text-white"}
                            placeholder="0"
                        />
                        <span className="text-base font-normal text-muted-foreground">kg</span>
                    </div>
                </GlassCard>

                <GlassCard className="space-y-2 p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Ruler className="w-4 h-4 text-primary" />
                        <span>Height</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <ProfileInput
                            isEditing={isEditing}
                            type="number"
                            value={formData.height_cm}
                            onChange={(e) => handleChange('height_cm', e.target.value)}
                            className={isEditing ? bigInputClass : "text-3xl font-bold text-white"}
                            placeholder="0"
                        />
                        <span className="text-base font-normal text-muted-foreground">cm</span>
                    </div>
                </GlassCard>

                <GlassCard className="space-y-2 p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <ActivityIcon className="w-4 h-4 text-primary" />
                        <span>BMI</span>
                    </div>
                    <ProfileInput
                        isEditing={isEditing}
                        type="number"
                        value={formData.calculated_bmi}
                        onChange={(e) => handleChange('calculated_bmi', e.target.value)}
                        className={isEditing ? bigInputClass : "text-3xl font-bold text-white"}
                        placeholder="0"
                    />
                </GlassCard>

                <GlassCard className="space-y-2 bg-destructive/10 border-destructive/20 p-6">
                    <div className="flex items-center gap-2 text-rose-400 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Fat Storage</span>
                    </div>
                    <ProfileInput
                        isEditing={isEditing}
                        value={formData.body_fat_location}
                        onChange={(e) => handleChange('body_fat_location', e.target.value)}
                        className={isEditing ? "text-xl font-bold bg-transparent border-b border-rose-500/30 text-rose-100 placeholder:text-rose-500/30 px-0 w-full" : "text-xl font-bold text-white"}
                        placeholder="Location"
                    />
                </GlassCard>

                <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Safety Checks</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                                        <CheckIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-white font-medium">Injuries</p>
                                </div>
                                {isEditing ? (
                                    <ProfileTextarea
                                        isEditing={true}
                                        value={formData.injuries_history}
                                        onChange={(e) => handleChange('injuries_history', e.target.value)}
                                        className="mt-2 text-emerald-100 bg-transparent border-b border-emerald-500/30 p-0 rounded-none focus:bg-emerald-500/5 min-h-[60px]"
                                        placeholder="List any injuries..."
                                    />
                                ) : (
                                    <p className="text-sm text-emerald-400 pl-11">{formData.injuries_history || 'Clear (None reported)'}</p>
                                )}
                            </div>

                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <p className="text-white font-medium">Period Status</p>
                                </div>
                                <ProfileInput
                                    isEditing={isEditing}
                                    value={formData.menstrual_cycle_status}
                                    onChange={(e) => handleChange('menstrual_cycle_status', e.target.value)}
                                    className={isEditing ? "mt-2 w-full bg-transparent border-b border-yellow-500/30 text-yellow-100 placeholder:text-yellow-500/30 px-0" : "text-sm text-yellow-400 pl-11"}
                                    placeholder="Status..."
                                />
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}




