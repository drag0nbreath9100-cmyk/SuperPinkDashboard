"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Check, LogOut, Moon, Palette, Zap } from "lucide-react";
import { PricingManager } from "@/components/admin/PricingManager";

export default function SettingsPage() {
    const { color, setColor, radius, setRadius, glassEnabled, setGlassEnabled, bgAnimated, setBgAnimated, bgStyle, setBgStyle, resetToDefaults } = useTheme();

    const colors = [
        { name: "blue", class: "bg-blue-500", label: "Electric Blue" },
        { name: "violet", class: "bg-violet-500", label: "Cyber Violet" },
        { name: "emerald", class: "bg-emerald-500", label: "Neon Mint" },
        { name: "rose", class: "bg-rose-500", label: "Hot Pink" },
        { name: "amber", class: "bg-amber-500", label: "Solar Gold" },
        { name: "cyan", class: "bg-cyan-500", label: "Future Cyan" },
    ] as const;

    const radii = [
        { value: "0", label: "Sharp" },
        { value: "0.5rem", label: "Modern" },
        { value: "1rem", label: "Standard" },
        { value: "2rem", label: "Round" },
    ] as const;

    return (
        <div className="p-8 min-h-screen space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                        <SettingsIcon className="w-10 h-10 text-blue-500 animate-spin-slow-blur" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            System Configuration
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Customize your interface experience. Changes are applied instantly.
                    </p>
                </div>
                <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all text-sm font-medium flex items-center gap-2 self-start md:self-center"
                >
                    <LogOut className="w-4 h-4 rotate-180" />
                    Reset to Defaults
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Theme Color Card */}
                <div className="glass-card p-6 overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Interface Accent</h2>
                                <p className="text-slate-400 text-sm">Select your primary brand color.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {colors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.name)}
                                    className={cn(
                                        "relative group/btn flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300",
                                        color === c.name
                                            ? "bg-white/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                            : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className={cn("w-8 h-8 rounded-full shadow-lg", c.class, color === c.name && "ring-2 ring-white ring-offset-2 ring-offset-black")} />
                                    <span className={cn("text-xs font-medium transition-colors", color === c.name ? "text-white" : "text-slate-500 group-hover/btn:text-slate-300")}>
                                        {c.label}
                                    </span>
                                    {color === c.name && (
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/5 to-purple-500/5 pointer-events-none" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visual Logic Card */}
                <div className="glass-card p-6 overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Visual Logic</h2>
                                <p className="text-slate-400 text-sm">Fine-tune UI geometry and effects.</p>
                            </div>
                        </div>

                        {/* Radius Setting */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Corner Radius</label>
                            <div className="grid grid-cols-4 gap-2">
                                {radii.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => setRadius(r.value)}
                                        className={cn(
                                            "h-10 border transition-all duration-300 flex items-center justify-center text-sm font-medium",
                                            radius === r.value
                                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                                : "bg-black/40 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                                        )}
                                        style={{ borderRadius: r.value === '2rem' ? '9999px' : r.value }}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-white/5 my-6" />

                        {/* Effects Toggle */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Moon className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <div className="font-medium text-white">Glassmorphism Engine</div>
                                        <div className="text-xs text-slate-500">Enable intensive backdrop blurs.</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setGlassEnabled(!glassEnabled)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors duration-300 relative focus:outline-none",
                                        glassEnabled ? "bg-blue-600" : "bg-slate-700"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                                        glassEnabled ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="font-medium text-white">Neural Animation</div>
                                        <div className="text-xs text-slate-500">Active 3D background system.</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setBgAnimated(!bgAnimated)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors duration-300 relative focus:outline-none",
                                        bgAnimated ? "bg-purple-600" : "bg-slate-700"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                                        bgAnimated ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Palette className="w-5 h-5 text-emerald-400" />
                                    <div>
                                        <div className="font-medium text-white">Background Tint</div>
                                        <div className="text-xs text-slate-500">Adaptive matches theme. Static is classic.</div>
                                    </div>
                                </div>
                                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                    <button
                                        onClick={() => setBgStyle("dynamic")}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                            bgStyle === "dynamic" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        Adaptive
                                    </button>
                                    <button
                                        onClick={() => setBgStyle("static")}
                                        className={cn(
                                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                            bgStyle === "static" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        Classic
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-medium text-slate-400 mb-4">Live Preview</h3>
                    <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 justify-center min-h-[200px] relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-20" />

                        <button className="btn-electric">
                            <span>Primary Action</span>
                            <Zap className="w-4 h-4" />
                        </button>

                        <div className="p-6 rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-lg max-w-sm">
                            <h4 className="font-bold text-lg mb-2">Card Component</h4>
                            <p className="text-muted-foreground text-sm">
                                This card demonstrates how your corner radius and color choices affect standard UI elements.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-medium text-primary">System Online</span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Pricing Manager Section */}
            <div className="w-full">
                <PricingManager />
            </div>

        </div >
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
