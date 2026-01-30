"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WaterTrackerProps {
    value: 'low' | 'medium' | 'high';
    onChange: (value: 'low' | 'medium' | 'high') => void;
}

export function WaterTracker({ value, onChange }: WaterTrackerProps) {
    const getLevelPercent = (val: string) => {
        switch (val) {
            case 'high': return 85;
            case 'medium': return 50;
            case 'low': return 20;
            default: return 5;
        }
    };

    const currentPercent = getLevelPercent(value);

    // Exact reusable sine wave path that starts and ends at the exact same height and slope
    // M 0 50 Q 25 20 50 50 T 100 50 V 100 H 0 Z
    // This draws a wave at the top, and fills down to bottom (100).
    // Viewbox 0 0 100 100

    const levels = [
        { id: 'high', label: '2L+', percent: 85 },
        { id: 'medium', label: '1L - 2L', percent: 50 },
        { id: 'low', label: '< 1L', percent: 20 },
    ];

    return (
        <div className="flex items-center justify-center gap-20 py-8">
            <style jsx>{`
                @keyframes wave-animation {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .wave-layer {
                    position: absolute;
                    top: -20px; /* Adjust based on wave height */
                    left: 0;
                    width: 200%;
                    height: 100%;
                    display: flex;
                    pointer-events: none;
                }
                .wave-fast {
                    animation: wave-animation 4s linear infinite;
                    z-index: 10;
                    opacity: 1;
                }
                .wave-slow {
                    animation: wave-animation 7s linear infinite;
                    z-index: 5;
                    opacity: 0.6;
                    left: -20px; /* slight offset */
                }
            `}</style>

            {/* The Glass */}
            <div className="relative w-36 h-52 perspective-[1000px]">
                {/* Glass Reflection Highlight */}
                <div className="absolute top-2 left-2 right-2 h-[80%] bg-gradient-to-b from-white/20 to-transparent rounded-full z-30 pointer-events-none blur-[1px]" />

                {/* Visual Glass Body */}
                <div
                    className="absolute inset-0 z-10 bg-gradient-to-br from-white/10 to-white/5 border-x border-b border-white/20 rounded-b-[2rem] shadow-[0_10px_40px_rgba(59,130,246,0.15)] backdrop-blur-[2px]"
                    style={{
                        clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)'
                    }}
                >
                    {/* Water Container */}
                    <div className="absolute inset-0 overflow-hidden rounded-b-[2rem]">
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-500"
                            initial={{ height: `${currentPercent}%` }}
                            animate={{ height: `${currentPercent}%` }}
                            transition={{ type: "spring", stiffness: 40, damping: 15 }}
                        >
                            {/* 
                                Wave Layer Container 
                                We place SVGs inside. We animate this container sliding left.
                            */}

                            {/* Back Wave (Slower, darker/lighter) */}
                            <div className="wave-layer wave-slow fill-blue-700">
                                <svg className="w-1/2 h-12" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    <path d="M0,25 C30,45 70,5 100,25 L100,50 L0,50 Z" />
                                </svg>
                                <svg className="w-1/2 h-12" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    <path d="M0,25 C30,45 70,5 100,25 L100,50 L0,50 Z" />
                                </svg>
                            </div>

                            {/* Front Wave (Faster, Main color) */}
                            <div className="wave-layer wave-fast fill-blue-400">
                                <svg className="w-1/2 h-12" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    <path d="M0,25 C30,5 70,45 100,25 L100,50 L0,50 Z" />
                                </svg>
                                <svg className="w-1/2 h-12" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    <path d="M0,25 C30,5 70,45 100,25 L100,50 L0,50 Z" />
                                </svg>
                            </div>

                            {/* Bubbles - Only visible within the water */}
                            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute bg-white/20 rounded-full"
                                        style={{
                                            width: Math.random() * 4 + 2,
                                            height: Math.random() * 4 + 2,
                                            left: `${Math.random() * 80 + 10}%`,
                                            bottom: '-10%'
                                        }}
                                        animate={{
                                            y: -200,
                                            opacity: [0, 1, 0]
                                        }}
                                        transition={{
                                            duration: Math.random() * 3 + 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                            ease: "linear"
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Rim */}
                <div className="absolute -top-[2px] left-[1px] right-[1px] h-3 rounded-[100%] border border-white/30 bg-white/5 z-20 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
            </div>

            {/* Neon Vertical Bar Controls */}
            <div className="h-48 flex items-center">
                <div className="relative h-full w-14 flex flex-col items-center justify-between py-1">

                    {/* Background Bar */}
                    <div className="absolute top-2 bottom-2 w-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                        {/* Fill Bar */}
                        <motion.div
                            className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                            initial={false}
                            animate={{ height: `${currentPercent > 20 ? (currentPercent === 50 ? 50 : 100) : 15}%` }}
                            transition={{ type: "spring", stiffness: 60, damping: 15 }}
                            style={{ position: 'absolute', bottom: 0 }}
                        />
                    </div>

                    {/* Level Nodes */}
                    {levels.map((level) => {
                        const isReached = (value === 'high') ||
                            (value === 'medium' && level.id !== 'high') ||
                            (value === 'low' && level.id === 'low');

                        const isSelected = value === level.id;

                        return (
                            <div key={level.id} className="relative w-full flex justify-center group">
                                <motion.button
                                    onClick={() => onChange(level.id as any)}
                                    className="relative z-10 outline-none"
                                >
                                    <motion.div
                                        className={cn(
                                            "w-4 h-4 rounded-full border-2 transition-all duration-300",
                                            isReached
                                                ? "bg-cyan-400 border-white shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                                                : "bg-slate-900 border-slate-600 hover:border-slate-400"
                                        )}
                                        animate={{ scale: isSelected ? 1.3 : 1 }}
                                    />
                                </motion.button>

                                <div className={cn(
                                    "absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 rounded-md bg-zinc-900 border border-white/10 text-xs font-semibold transition-all duration-300 pointer-events-none",
                                    isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                                )}>
                                    <span className={isSelected ? "text-cyan-400" : "text-slate-400"}>{level.label}</span>
                                    <div className="absolute top-1/2 right-full -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-zinc-900" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
