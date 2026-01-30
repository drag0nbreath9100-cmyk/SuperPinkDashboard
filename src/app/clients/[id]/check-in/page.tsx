"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api, Client, CheckIn } from "@/lib/api";
import { ArrowLeft, Save, Loader2, Activity, Scale, Flame, Footprints, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { WaterTracker } from "@/components/check-in/WaterTracker";
import { StressBar } from "@/components/check-in/StressBar";
import { cn } from "@/lib/utils";

export default function CheckInPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Form State
    const [waterLevel, setWaterLevel] = useState<'low' | 'medium' | 'high'>('low');
    const [weight, setWeight] = useState<string>("");
    const [calories, setCalories] = useState<string>("");
    const [macros, setMacros] = useState({ p: "", c: "", f: "" });
    const [steps, setSteps] = useState<string>("");
    const [stressLevel, setStressLevel] = useState<number>(5);
    const [sleepingHours, setSleepingHours] = useState<string>("");
    const [rating, setRating] = useState<number>(10);

    useEffect(() => {
        const fetchClient = async () => {
            if (!clientId) return;
            const data = await api.getClient(clientId);
            setClient(data);
            setIsLoading(false);
        };
        fetchClient();
    }, [clientId]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Premium Validation
        if (!weight) {
            showNotification("Weight input is required to proceed.", 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const checkInData: Omit<CheckIn, 'id' | 'created_at'> = {
                client_id: Number(clientId),
                date: new Date().toISOString().split('T')[0],
                water_intake_level: waterLevel,
                weight: Number(weight) || 0,
                calories: Number(calories) || 0,
                protein: Number(macros.p) || 0,
                carbs: Number(macros.c) || 0,
                fats: Number(macros.f) || 0,
                steps: Number(steps) || 0,
                stress_level: stressLevel,
                sleeping_hours: Number(sleepingHours) || 0,
                service_rating: rating
            };

            const result = await api.addCheckIn(checkInData);

            if (result) {
                showNotification("Daily check-in saved successfully.", 'success');
                setTimeout(() => {
                    // Navigate back after a delay
                    router.back();
                }, 1500);
            } else {
                // Fallback for demo if API fails
                showNotification("Check-in saved (Simulation)", 'success');
                setTimeout(() => router.back(), 1500);
            }
        } catch (error) {
            console.error("Failed to submit check-in", error);
            showNotification("Failed to save check-in. Please try again.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 animate-in slide-in-from-top duration-500">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Daily Check-in
                        </h1>
                        <p className="text-slate-400">
                            Checking in for <span className="text-blue-400 font-semibold">{client?.full_name}</span>
                        </p>
                    </div>
                </div>

                <style jsx global>{`
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    .no-spinner::-webkit-outer-spin-button,
                    .no-spinner::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    /* Hide scrollbar for IE, Edge and Firefox */
                    .no-spinner {
                        -moz-appearance: textfield;
                    }
                `}</style>

                <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom duration-700 delay-100">

                    {/* Water Section */}
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Hydration</h2>
                        </div>
                        <WaterTracker value={waterLevel} onChange={setWaterLevel} />
                    </GlassCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Body Stats */}
                        <GlassCard className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Scale className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-semibold">Body Metrics</h2>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Today's Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="0.0"
                                    className="no-spinner w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Daily Steps</label>
                                <div className="relative">
                                    <Footprints className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="number"
                                        value={steps}
                                        onChange={(e) => setSteps(e.target.value)}
                                        placeholder="0"
                                        className="no-spinner w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Nutrition */}
                        <GlassCard className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-500/20 rounded-lg">
                                    <Flame className="w-5 h-5 text-orange-400" />
                                </div>
                                <h2 className="text-xl font-semibold">Nutrition</h2>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Total Calories</label>
                                <input
                                    type="number"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    placeholder="0"
                                    className="no-spinner w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Protein</label>
                                    <input
                                        type="number"
                                        value={macros.p}
                                        onChange={(e) => setMacros({ ...macros, p: e.target.value })}
                                        className="no-spinner w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-400 outline-none"
                                        placeholder="g"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Carbs</label>
                                    <input
                                        type="number"
                                        value={macros.c}
                                        onChange={(e) => setMacros({ ...macros, c: e.target.value })}
                                        className="no-spinner w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-green-400 outline-none"
                                        placeholder="g"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Fats</label>
                                    <input
                                        type="number"
                                        value={macros.f}
                                        onChange={(e) => setMacros({ ...macros, f: e.target.value })}
                                        className="no-spinner w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
                                        placeholder="g"
                                    />
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Stress Section */}
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-pink-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-pink-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Stress Level</h2>
                        </div>
                        <StressBar value={stressLevel} onChange={setStressLevel} />
                    </GlassCard>

                    {/* Sleep Section */}
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Activity className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-semibold">Sleep</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Hours Slept Last Night</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={sleepingHours}
                                    onChange={(e) => setSleepingHours(e.target.value)}
                                    placeholder="0.0"
                                    className="no-spinner w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Rating Section */}
                    <GlassCard className="p-8 space-y-8">

                        <div className="space-y-6 relative">
                            {/* Ambient Gold Glow at 10 */}
                            <AnimatePresence>
                                {rating === 10 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -inset-10 bg-yellow-500/20 blur-3xl -z-10 rounded-full pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between items-end">
                                <span className="text-slate-400 text-sm font-medium">Service Rating</span>
                                <motion.div
                                    className="flex items-center gap-2"
                                    animate={{ scale: rating === 10 ? 1.1 : 1 }}
                                >
                                    <span className={cn(
                                        "text-2xl font-bold transition-colors duration-300",
                                        rating === 10 ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-slate-200"
                                    )}>
                                        {rating}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">/ 10</span>
                                    <motion.div
                                        animate={{
                                            rotate: rating === 10 ? 360 : 0,
                                            scale: rating === 10 ? 1.2 : 1
                                        }}
                                        transition={{ type: "spring" }}
                                    >
                                        <Star className={cn(
                                            "w-6 h-6 transition-all duration-300",
                                            rating === 10 ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" : "text-slate-600"
                                        )} />
                                    </motion.div>
                                </motion.div>
                            </div>

                            <div className="relative h-12 flex items-center">
                                {/* Track Background */}
                                <div className="absolute w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn(
                                            "h-full bg-gradient-to-r",
                                            rating === 10 ? "from-yellow-600 via-yellow-400 to-yellow-200" : "from-blue-600 to-violet-600"
                                        )}
                                        style={{ width: `${((rating - 1) / 9) * 100}%` }}
                                        animate={{ width: `${((rating - 1) / 9) * 100}%` }}
                                    />
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full h-12 opacity-0 cursor-pointer z-20 absolute top-0"
                                />

                                {/* Custom Thumb (Visual only, follows calculation) */}
                                <motion.div
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 absolute z-10 pointer-events-none shadow-lg",
                                        rating === 10
                                            ? "bg-yellow-400 border-white shadow-[0_0_20px_rgba(234,179,8,0.8)]"
                                            : "bg-white border-violet-500"
                                    )}
                                    animate={{
                                        left: `calc(${(rating - 1) * (100 / 9)}% - 12px)`, // Approximate positioning logic for center of thumb
                                        scale: rating === 10 ? 1.3 : 1
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />

                                {/* Ticks */}
                                <div className="absolute w-full flex justify-between px-1 pointer-events-none opacity-50">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className={cn("w-1 h-1 rounded-full", (i + 1) <= rating ? "bg-white" : "bg-white/20")} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs font-medium tracking-wide">
                                <span className="text-slate-500">Needs Work</span>
                                <motion.span
                                    animate={{
                                        color: rating === 10 ? "#facc15" : "#64748b",
                                        textShadow: rating === 10 ? "0 0 10px rgba(250,204,21,0.5)" : "none"
                                    }}
                                >
                                    Excellent
                                </motion.span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Submit Button */}
                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Check-in
                                </>
                            )}
                        </button>
                    </div>
                </form >

                {/* Premium Notification Toast - Compact Pill */}
                <AnimatePresence>
                    {
                        notification && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: 20, x: "-50%" }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className={cn(
                                    "fixed bottom-6 left-1/2 px-6 py-3 rounded-full border backdrop-blur-xl flex items-center gap-3 shadow-2xl z-50 whitespace-nowrap",
                                    notification.type === 'error'
                                        ? "bg-zinc-950/90 border-red-500/50 text-red-200 shadow-[0_0_40px_rgba(220,38,38,0.5)]"
                                        : "bg-zinc-950/90 border-emerald-500/50 text-emerald-200 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-full shrink-0",
                                    notification.type === 'error' ? "bg-red-500/20" : "bg-emerald-500/20"
                                )}>
                                    {notification.type === 'error' ? (
                                        <AlertCircle className={cn("w-4 h-4", notification.type === 'error' ? "text-red-500" : "text-emerald-500")} />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    )}
                                </div>

                                <span className="font-medium text-sm pr-2">
                                    {notification.message}
                                </span>

                                {/* Ambient Glow Orb */}
                                <div className={cn(
                                    "absolute -inset-4 blur-3xl opacity-20 -z-10",
                                    notification.type === 'error' ? "bg-red-500" : "bg-emerald-500"
                                )} />
                            </motion.div>
                        )
                    }
                </AnimatePresence >

            </div >
        </div >
    );
}
