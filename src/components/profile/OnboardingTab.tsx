
import React, { useState } from "react";
import { Client, api } from "@/lib/api";
import { PhoneCall, FileText, Video, Save, ShieldCheck, PlayCircle, StickyNote, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTabProps {
    clientId: string;
    client: Client;
    onNavigateToWorkout: () => void;
}

export function OnboardingTab({ clientId, client, onNavigateToWorkout }: OnboardingTabProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        onboarding_call_done: client.onboarding_call_done || false,
        onboarding_call_notes: client.onboarding_call_notes || "",
        medical_papers_received: client.medical_papers_received || false,
        medical_papers_details: client.medical_papers_details || "",
        videos_watched: client.videos_watched || false,
    });

    // Default expanded state
    const [expandedId, setExpandedId] = useState<string>('call');

    // Conditional Phase 4 Logic
    const isPhase1Done = data.onboarding_call_done;
    const isPhase2Done = data.medical_papers_received;
    const isPhase3Done = data.videos_watched;
    const isOnboardingBasicallyDone = isPhase1Done && isPhase2Done && isPhase3Done;
    // Check if workout plan is missing (assuming empty object/null checks)
    const hasWorkoutPlan = client.workout_plan || client.workout_plan_link;
    // Show Phase 4 if previous phases are done OR if a plan already exists
    const showPhase4 = isOnboardingBasicallyDone || !!hasWorkoutPlan;

    const baseSteps = [
        {
            id: 'call',
            title: "Strategy Call",
            subtitle: "Phase 1",
            description: "Initial consultation & goal alignment session.",
            icon: PhoneCall,
            isDone: data.onboarding_call_done,
            notes: data.onboarding_call_notes,
            color: "blue",
            toggle: (val: boolean) => {
                const newData = { ...data, onboarding_call_done: val };
                setData(newData);
                saveChanges(newData);
            },
            updateNotes: (val: string) => setData(prev => ({ ...prev, onboarding_call_notes: val }))
        },
        {
            id: 'medical',
            title: "Medical Clearance",
            subtitle: "Phase 2",
            description: "Review health history & injury documentation.",
            icon: ShieldCheck,
            isDone: data.medical_papers_received,
            notes: data.medical_papers_details,
            color: "violet",
            toggle: (val: boolean) => {
                const newData = { ...data, medical_papers_received: val };
                setData(newData);
                saveChanges(newData);
            },
            updateNotes: (val: string) => setData(prev => ({ ...prev, medical_papers_details: val }))
        },
        {
            id: 'video',
            title: "Education Hub",
            subtitle: "Phase 3",
            description: "Client completion of mandatory onboarding videos.",
            icon: PlayCircle,
            isDone: data.videos_watched,
            notes: null,
            color: "pink",
            toggle: (val: boolean) => {
                const newData = { ...data, videos_watched: val };
                setData(newData);
                saveChanges(newData);
            },
            updateNotes: null
        }
    ];

    const steps = [...baseSteps];

    if (showPhase4) {
        steps.push({
            id: 'workout_design',
            title: "Workout Design",
            subtitle: "Phase 4",
            description: hasWorkoutPlan ? "Workout plan created and assigned." : "Create a personalized workout plan for the client.",
            icon: Dumbbell,
            isDone: !!hasWorkoutPlan, // Done if plan exists
            notes: null,
            color: "emerald",
            toggle: () => onNavigateToWorkout(),
            updateNotes: null
        });
    }

    const completedSteps = steps.filter(s => s.isDone).length;
    const isAllDone = completedSteps === steps.length;

    const saveChanges = async (newData: typeof data) => {
        try {
            await api.updateClient(Number(clientId), {
                onboarding_call_done: newData.onboarding_call_done,
                onboarding_call_notes: newData.onboarding_call_notes,
                medical_papers_received: newData.medical_papers_received,
                medical_papers_details: newData.medical_papers_details,
                videos_watched: newData.videos_watched
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="h-[550px] flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        Onboarding Protocol
                        {isAllDone && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold uppercase tracking-wider"
                            >
                                Ready to Activate
                            </motion.span>
                        )}
                    </h2>
                </div>
            </div>

            {/* Accordion Container */}
            <div className="flex-1 flex gap-5 min-h-0">
                <AnimatePresence mode="popLayout">
                    {steps.map((step, index) => {
                        const isExpanded = expandedId === step.id;
                        const isActive = step.isDone;

                        return (
                            <motion.div
                                key={step.id}
                                layout="position"
                                initial={{ opacity: 0, x: -20, flexGrow: 0 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    flexGrow: isExpanded ? 3 : 0.8
                                }}
                                exit={{ opacity: 0, flexGrow: 0, scale: 0.9 }}
                                whileHover={{ flexGrow: isExpanded ? 3 : 1 }}
                                transition={{
                                    duration: 0.5,
                                    ease: [0.32, 0.72, 0, 1]
                                }}
                                onClick={() => setExpandedId(step.id)}
                                className={cn(
                                    "relative rounded-[2rem] overflow-hidden cursor-pointer transition-colors duration-500 border group min-w-0",
                                    isActive ? "border-emerald-500/40" : "border-white/5",
                                    isExpanded ? "hover:border-white/10" : "hover:border-white/10"
                                )}
                                style={{ flexBasis: 0 }}
                            >
                                {/* Layer 1: Enhanced Default Background (Always visible, behind) */}
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-b",
                                    `from-${step.color}-950/30 to-black/80`
                                )} />

                                {/* Layer 2: Active Emerald Overlay (Fades in smoothly) */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-black/90"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isActive ? 1 : 0 }}
                                    transition={{ duration: 0.6 }}
                                />

                                {/* Noise Texture */}
                                <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                                {/* Content Section - Wrapped in motion layout to sync with parent */}
                                <motion.div
                                    className="relative z-10 p-7 h-full flex flex-col justify-end"
                                >
                                    {/* Top Icons - Absolute to stay pinned */}
                                    <div className="absolute top-7 left-7 right-7 flex justify-between items-start">
                                        <motion.div
                                            layout="position"
                                            className={cn(
                                                "p-3 rounded-2xl border transition-all duration-500 relative z-10",
                                                isActive
                                                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                                                    : "bg-white/5 border-white/5 text-slate-400 group-hover:text-white"
                                            )}>
                                            <step.icon strokeWidth={1.5} className="w-6 h-6" />
                                        </motion.div>

                                        <div className="flex flex-col items-end z-10">
                                            <motion.span layout="position" className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">{step.subtitle}</motion.span>
                                            <motion.div
                                                layout="position"
                                                animate={{ scale: isActive ? 1 : 0.8, opacity: isActive ? 1 : 0.3 }}
                                                className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    isActive ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" : "bg-white"
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Bottom Text & Content */}
                                    <motion.div layout="position" className="mt-16">
                                        <div className="mb-5">
                                            <motion.div
                                                layout="position"
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors duration-300",
                                                    isActive ? "text-emerald-400" : "text-slate-500"
                                                )}
                                            >
                                                {isActive ? "Completed" : "Pending"}
                                            </motion.div>

                                            <motion.h3
                                                layout="position"
                                                className={cn(
                                                    "font-bold text-white transition-all duration-300 ease-out",
                                                    isExpanded ? "text-2xl" : "text-lg"
                                                )}
                                            >
                                                {step.title}
                                            </motion.h3>
                                        </div>

                                        {/* Expanded Details */}
                                        <AnimatePresence mode="popLayout">
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                                    className="space-y-6"
                                                >
                                                    <motion.p layout="position" className="text-sm text-slate-400 leading-relaxed font-light border-l-2 border-white/10 pl-3">
                                                        {step.description}
                                                    </motion.p>

                                                    <motion.div layout="position" className="space-y-4">
                                                        {/* Primary Action Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                step.toggle(!step.isDone);
                                                            }}
                                                            className={cn(
                                                                "w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border shadow-lg",
                                                                isActive
                                                                    ? "bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 hover:scale-[1.02]"
                                                                    : "bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
                                                            )}
                                                        >
                                                            {isActive ? "Step Complete" : "Mark as Done"}
                                                        </button>

                                                        {/* Notes Section */}
                                                        {step.updateNotes && (
                                                            <div className="relative group pt-2" onClick={e => e.stopPropagation()}>
                                                                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    <StickyNote className="w-3 h-3" />
                                                                    Additional Notes
                                                                </div>
                                                                <textarea
                                                                    value={step.notes || ""}
                                                                    onChange={(e) => step.updateNotes!(e.target.value)}
                                                                    onBlur={() => saveChanges(data)}
                                                                    placeholder="Type anything relevant here..."
                                                                    className="w-full bg-black/30 hover:bg-black/40 transition-colors border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none h-24 shadow-inner"
                                                                />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
