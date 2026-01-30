"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StressBarProps {
    value: number; // 0 to 10
    onChange: (value: number) => void;
}

export function StressBar({ value, onChange }: StressBarProps) {
    const getColor = (val: number) => {
        if (val < 4) return "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
        if (val < 7) return "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]";
        return "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]";
    };

    const getLabel = (val: number) => {
        if (val < 4) return "Low Stress";
        if (val < 7) return "Moderate";
        return "High Stress";
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm font-medium">Stress Level</span>
                <motion.span
                    key={value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                        value < 4 ? "from-emerald-400 to-teal-300" :
                            value < 7 ? "from-amber-400 to-orange-300" :
                                "from-rose-400 to-red-300"
                    )}
                >
                    {value} - {getLabel(value)}
                </motion.span>
            </div>

            <div className="relative h-12 w-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-crosshair group">
                {/* Click area mapping & Grid Lines */}
                <div className="absolute inset-0 flex z-30">
                    {[...Array(11)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 hover:bg-white/5 transition-colors border-r border-white/10 last:border-0"
                            onClick={() => onChange(i)}
                            title={`Set stress to ${i}`}
                        />
                    ))}
                </div>

                {/* The Bar */}
                <motion.div
                    className={cn(
                        "absolute top-0 left-0 bottom-0 z-20 transition-colors duration-500",
                        getColor(value)
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${((value + 1) / 11) * 100}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </motion.div>
            </div>

            <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>Zen (0)</span>
                <span>Crisis (10)</span>
            </div>
        </div>
    );
}
