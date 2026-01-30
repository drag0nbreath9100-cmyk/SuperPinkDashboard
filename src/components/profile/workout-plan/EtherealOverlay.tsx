import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Exercise } from "@/lib/api";
import { cn } from "@/lib/utils";

export const EtherealOverlay = ({
    isVisible,
    exercises
}: {
    isVisible: boolean,
    exercises: Exercise[]
}) => {
    // 3D Items with specific depth properties
    const [orbitItems, setOrbitItems] = useState<{
        name: string,
        x: number,
        y: number,
        z: number,
        scale: number,
        blur: number,
        delay: string
    }[]>([]);

    // Mouse Interaction
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-500, 500], [10, -10]); // Reverse for tilt
    const rotateY = useTransform(mouseX, [-500, 500], [-10, 10]);

    useEffect(() => {
        if (exercises.length > 0 && orbitItems.length === 0) {
            const shuffled = [...exercises].sort(() => 0.5 - Math.random()).slice(0, 12); // Increased count for density

            const items = shuffled.map((e, i) => {
                // Organic Balanced Anchor - Structure + Randomness
                const angleStep = 360 / shuffled.length;
                const baseAngle = i * angleStep;
                const angleJitter = (Math.random() * 30 - 15);
                const angle = baseAngle + angleJitter;

                const radiusBase = 320;
                const radiusJitter = (Math.random() * 80 - 40);
                const radius = radiusBase + radiusJitter;

                const x = radius * Math.cos(angle * Math.PI / 180);
                const y = radius * Math.sin(angle * Math.PI / 180);

                // Random Depth
                const z = Math.floor(Math.random() * 400) - 200; // -200 to +200
                // Calculate Scale based on Z (simulated perspective)
                const scale = 0.5 + ((z + 200) / 400) * 0.7; // 0.5 to 1.2
                // Blur based on distance from 0
                const blur = Math.abs(z) > 100 ? (Math.abs(z) - 100) / 30 : 0;

                const delay = `${(Math.random() * 5).toFixed(2)}s`;

                return { name: e.name, x, y, z, scale, blur, delay };
            });
            // Sort by Z to render back-to-front (painter's algorithm)
            setOrbitItems(items.sort((a, b) => a.z - b.z));
        }
    }, [exercises]);

    function handleMouseMove(e: React.MouseEvent) {
        // Center 0,0
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="z-axis-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    onMouseMove={handleMouseMove}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-md overflow-hidden perspective-[1000px]"
                >
                    {/* Deep Space Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                        <div className="absolute top-[-20%] left-[-20%] w-[1000px] h-[1000px] bg-blue-900/10 rounded-full blur-[100px] animate-pulse [animation-duration:8s]" />
                        <div className="absolute bottom-[-20%] right-[-20%] w-[1000px] h-[1000px] bg-purple-900/10 rounded-full blur-[100px] animate-pulse [animation-duration:10s]" />
                    </div>

                    {/* 3D Floating Container with Tilt */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none transform-style-3d"
                        style={{ rotateX, rotateY }}
                    >
                        <div className="relative transform-style-3d">
                            {orbitItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="absolute top-1/2 left-1/2 flex items-center justify-center p-0 m-0 w-0 h-0"
                                    style={{
                                        transform: `translate3d(${item.x}px, ${item.y}px, ${item.z}px) translate(-50%, -50%)`,
                                        zIndex: Math.floor(item.z + 500)
                                    }}
                                >
                                    <motion.div
                                        exit={{
                                            x: -item.x,
                                            y: -item.y,
                                            z: -item.z, // Suck into core
                                            scale: 0,
                                            opacity: 0,
                                            transition: { duration: 0.5, ease: "backIn" }
                                        }}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: item.scale }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                    >
                                        {/* "Badge" Style Pill */}
                                        <div
                                            className={cn(
                                                "px-4 py-1.5 rounded-full border backdrop-blur-md shadow-2xl animate-float-slow whitespace-nowrap flex items-center gap-2",
                                                // Randomize styles slightly for variety or stick to premium blue
                                                i % 2 === 0
                                                    ? "bg-blue-500/10 border-blue-400/20 text-blue-100 shadow-blue-900/40"
                                                    : "bg-purple-500/10 border-purple-400/20 text-purple-100 shadow-purple-900/40"
                                            )}
                                            style={{
                                                animationDelay: item.delay,
                                                filter: `blur(${item.blur}px)`
                                            }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shadow-[0_0_8px_currentColor]" />
                                            <span className="text-[10px] font-bold tracking-wider uppercase font-mono h-4 flex items-center">
                                                {item.name}
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Central Core (Static relative to tilt) */}
                    <div className="relative z-20 flex flex-col items-center justify-center gap-8 pointer-events-none">
                        <motion.div
                            className="relative"
                            exit={{
                                scale: [1, 1.2, 0.5],
                                opacity: [1, 1, 0],
                                filter: "blur(20px)",
                                transition: { duration: 0.6 }
                            }}
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.1)] ring-1 ring-white/5">
                                <Sparkles className="w-8 h-8 text-blue-100/80 animate-pulse duration-[2000ms]" />
                            </div>
                            <div className="absolute inset-0 border border-white/5 rounded-full animate-ping [animation-duration:3s]" />
                            <div className="absolute inset-0 border border-white/5 rounded-full animate-ping [animation-duration:3s] [animation-delay:1.5s]" />
                        </motion.div>

                        <motion.div
                            className="text-center space-y-2"
                            exit={{ opacity: 0, y: 10, transition: { duration: 0.3 } }}
                        >
                            <h2 className="text-xl font-light text-white/90 tracking-[0.2em] uppercase font-mono">Synthesizing</h2>
                            <div className="flex justify-center gap-1">
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]" />
                                <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
