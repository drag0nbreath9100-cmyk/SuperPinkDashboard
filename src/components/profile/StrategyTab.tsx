"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Zap, Utensils, Dumbbell, ThumbsUp, ThumbsDown, User, MapPin } from "lucide-react";
import { useState } from "react";
import { Client, api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EditSaveButton } from "./shared/EditSaveButton";
import { ProfileInput } from "./shared/ProfileInput";
import { ProfileTextarea } from "./shared/ProfileTextarea";

export function StrategyTab({ clientId, client }: { clientId: string, client?: Client }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        target_calories: client?.target_calories || 0,
        macros_protein: client?.macros_protein || 0,
        macros_fat: client?.macros_fat || 0,
        macros_carbs: client?.macros_carbs || 0,
        training_frequency_requested: client?.training_frequency_requested || 0,
        training_location: client?.training_location || 'Gym',
        favorite_workouts: client?.favorite_workouts || '',
        hated_workouts: client?.hated_workouts || '',
        final_strategy: client?.final_strategy || '',
        aesthetic_focus: client?.aesthetic_focus || '',
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!client) return <div>Loading...</div>;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await api.updateClient(client.id, {
                target_calories: Number(formData.target_calories),
                macros_protein: Number(formData.macros_protein),
                macros_fat: Number(formData.macros_fat),
                macros_carbs: Number(formData.macros_carbs),
                training_frequency_requested: Number(formData.training_frequency_requested),
                training_location: formData.training_location,
                favorite_workouts: formData.favorite_workouts,
                hated_workouts: formData.hated_workouts,
                final_strategy: formData.final_strategy,
                aesthetic_focus: formData.aesthetic_focus,
            });
            if (result) {
                setIsEditing(false);
            } else {
                alert("Failed to save changes.");
            }
        } catch (e) {
            console.error("Error saving strategy:", e);
            alert("An error occurred while saving.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions - Moved mainly into sections or top right? Let's keep consistency.
                Actually we have Edit/Save per section usually, but StrategyTab had one button.
                Let's put one global button at top or per section?
                The previous implementation had one button inside "Nutrition Protocol".
                Let's move it out or duplicate it.
                User wants "edit every logged detail".
                Let's use a single Edit/Save for the whole tab for simplicity, or per card.
                Given the layout, a top-right button is cleanest for "Entire Strategy Tab".
            */}
            <div className="flex justify-end mb-2">
                <EditSaveButton
                    isEditing={isEditing}
                    isLoading={isLoading}
                    onEdit={() => setIsEditing(true)}
                    onSave={handleSave}
                />
            </div>

            {/* Main Goal / Strategy Header */}
            <GlassCard className="bg-primary/5 border-primary/20 p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/20 text-primary box-glow">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <ProfileInput
                            isEditing={isEditing}
                            value={formData.final_strategy}
                            onChange={(e) => handleChange('final_strategy', e.target.value)}
                            className={isEditing ? "text-xl font-bold bg-black/20 w-full mb-1" : "text-xl font-bold text-white"}
                            placeholder="Strategy Pending"
                        />
                        <div className="flex items-center gap-2 text-primary/80">
                            <span>Focus:</span>
                            <ProfileInput
                                isEditing={isEditing}
                                value={formData.aesthetic_focus}
                                onChange={(e) => handleChange('aesthetic_focus', e.target.value)}
                                className={isEditing ? "bg-black/20 text-primary/80" : ""}
                                placeholder="TBD"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nutrition */}
                <GlassCard className={cn("space-y-4 p-6 transition-all", isEditing ? "border-secondary/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]" : "")}>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                            <Utensils className="w-5 h-5 text-secondary" />
                            <h3 className="text-lg font-semibold text-white">Nutrition Protocol</h3>
                        </div>
                        {/* Removed local button in favor of global one, or keep standard top right */}
                    </div>

                    <div className="space-y-6">
                        <div className="mt-8">
                            <div className="relative">
                                <ProfileInput
                                    isEditing={isEditing}
                                    type="number"
                                    value={formData.target_calories}
                                    onChange={(e) => handleChange('target_calories', e.target.value)}
                                    // Complex display logic handled by ProfileInput if we pass just value, but here displayValue was custom.
                                    // Let's keep the custom display for read-only view.
                                    displayValue={<span className="text-5xl font-bold text-white text-glow block text-center py-4">{formData.target_calories}</span>}
                                    className={isEditing ? "no-spinner text-5xl font-bold text-white text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl py-6 w-full focus:outline-none focus:border-secondary transition-all" : ""}
                                />
                                {isEditing && <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />}
                            </div>
                            <div className="text-sm text-muted-foreground text-center mt-3 font-medium tracking-wide uppercase opacity-60">Daily Calories</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4">
                            {['protein', 'fat', 'carbs'].map((macro) => {
                                const key = `macros_${macro}` as keyof typeof formData;
                                const label = macro === 'fat' ? 'Fats' : macro.charAt(0).toUpperCase() + macro.slice(1);

                                return (
                                    <div key={macro} className="p-4 rounded-xl bg-white/5 backdrop-blur-sm text-center hover:bg-white/10 transition-colors border border-white/5 group relative overflow-hidden">
                                        <ProfileInput
                                            isEditing={isEditing}
                                            type="number"
                                            value={formData[key]}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            displayValue={<div className="font-bold text-white text-lg">{formData[key]}g</div>}
                                            className={isEditing ? "no-spinner font-bold text-white bg-transparent border-none p-0 w-full text-center text-lg focus:outline-none focus:ring-0" : ""}
                                        />
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-semibold group-hover:text-white/80 transition-colors">{label}</div>
                                        {isEditing && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-secondary/50" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>

                {/* Training */}
                <GlassCard className="space-y-4 p-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                        <Dumbbell className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Training Split</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                            <span className="text-white flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Frequency</span>
                            <div className="flex items-center gap-2">
                                <ProfileInput
                                    isEditing={isEditing}
                                    type="number"
                                    value={formData.training_frequency_requested}
                                    onChange={(e) => handleChange('training_frequency_requested', e.target.value)}
                                    className={isEditing ? "w-12 bg-black/20 text-right font-mono font-bold" : "text-emerald-400 font-mono font-bold"}
                                />
                                <span className="text-sm text-muted-foreground">Days / Wk</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                            <span className="text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> Location</span>
                            <ProfileInput
                                isEditing={isEditing}
                                value={formData.training_location}
                                onChange={(e) => handleChange('training_location', e.target.value)}
                                className={isEditing ? "w-32 bg-black/20 text-right" : "text-muted-foreground font-medium"}
                                placeholder="Gym/Home"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <div className="w-full p-3 rounded bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                <ThumbsDown className="w-3 h-3" />
                                <span className="text-xs font-bold">HATES</span>
                            </div>
                            <ProfileTextarea
                                isEditing={isEditing}
                                value={formData.hated_workouts}
                                onChange={(e) => handleChange('hated_workouts', e.target.value)}
                                className={isEditing ? "bg-black/20 text-sm w-full min-h-[60px]" : "text-sm text-white line-clamp-3 bg-transparent p-0 resize-none border-none focus:ring-0"}
                                placeholder="Hated exercises..."
                            />
                        </div>
                        <div className="w-full p-3 rounded bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 text-green-400 mb-2">
                                <ThumbsUp className="w-3 h-3" />
                                <span className="text-xs font-bold">LOVES</span>
                            </div>
                            <ProfileTextarea
                                isEditing={isEditing}
                                value={formData.favorite_workouts}
                                onChange={(e) => handleChange('favorite_workouts', e.target.value)}
                                className={isEditing ? "bg-black/20 text-sm w-full min-h-[60px]" : "text-sm text-white line-clamp-3 bg-transparent p-0 resize-none border-none focus:ring-0"}
                                placeholder="Favorite exercises..."
                            />
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
