import { PlanType } from "./types";

export interface PlanConfig {
    id: PlanType;
    title: string;
    description: string;
    sessions: { name: string; exerciseCount: number }[];
}

export const PLANS: PlanConfig[] = [
    {
        id: "4D_BALANCED",
        title: "4 Days + Balanced Focus",
        description: "4D/(2L-2U) - 5 exercises per session",
        sessions: [
            { name: "Lower 1", exerciseCount: 5 },
            { name: "Upper 1", exerciseCount: 5 },
            { name: "Lower 2", exerciseCount: 5 },
            { name: "Upper 2", exerciseCount: 5 },
        ]
    },
    {
        id: "3D_LOWER_GLUTE",
        title: "3 Days + Lower / Glute Focus",
        description: "3D/(2L-1U) - 6 exercises per session",
        sessions: [
            { name: "Lower 1", exerciseCount: 6 },
            { name: "Upper 1", exerciseCount: 6 },
            { name: "Lower 2", exerciseCount: 6 },
        ]
    },
    {
        id: "4D_STRONG_LOWER",
        title: "4 Days + Strong Lower Focus",
        description: "4D/(3L-1U) - 5 exercises per session",
        sessions: [
            { name: "Lower 1", exerciseCount: 5 },
            { name: "Upper 1", exerciseCount: 5 },
            { name: "Lower 2", exerciseCount: 5 },
            { name: "Lower 3", exerciseCount: 5 },
        ]
    },
    {
        id: "3D_GENERAL",
        title: "3 Days + General/No Focus",
        description: "3D/(1L-1U-1FB) - 6 exercises per session",
        sessions: [
            { name: "Lower 1", exerciseCount: 6 },
            { name: "Upper 1", exerciseCount: 6 },
            { name: "Full Body", exerciseCount: 6 },
        ]
    },
    {
        id: "2D_FB",
        title: "2 Days",
        description: "2D/(FB) - 8 exercises per session",
        sessions: [
            { name: "Full Body 1", exerciseCount: 8 },
            { name: "Full Body 2", exerciseCount: 8 },
        ]
    }
];

export const MUSCLE_STYLES: Record<string, string> = {
    // Lower Body
    "Glutes": "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
    "Quadriceps": "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    "Quads": "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    "Hamstrings": "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
    "Calves": "bg-gradient-to-r from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30",
    "Adductors": "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30",
    "Abductors": "bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 border-fuchsia-500/30",

    // Upper Body
    "Lats": "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border-cyan-600/30 shadow-[0_0_10px_rgba(8,145,178,0.1)]",
    "Back": "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 border-cyan-600/30 shadow-[0_0_10px_rgba(8,145,178,0.1)]",
    "Chest": "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
    "Pecs": "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
    "Shoulders": "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]",
    "Delts": "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]",
    "Biceps": "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30",
    "Triceps": "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30",

    // Core & Other
    "Abs": "bg-gradient-to-r from-zinc-600/20 to-neutral-600/20 text-zinc-300 border-zinc-500/30",
    "Core": "bg-gradient-to-r from-zinc-600/20 to-neutral-600/20 text-zinc-300 border-zinc-500/30",
};

export const getMuscleBadge = (muscle: string | undefined) => {
    if (!muscle || muscle === "-" || muscle === "") return "bg-white/5 text-slate-500 border-white/5";
    // Check for direct or partial match
    for (const key in MUSCLE_STYLES) {
        if (muscle.toLowerCase().includes(key.toLowerCase())) return MUSCLE_STYLES[key];
    }
    // Default premium fallback
    return "bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 border-slate-600/50";
};

export const REST_OPTIONS = ["30s", "45s", "60s", "90s", "120s", "180s"];
