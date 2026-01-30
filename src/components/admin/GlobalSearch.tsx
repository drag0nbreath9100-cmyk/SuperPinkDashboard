"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
    return (
        <div className="relative group max-w-2xl mx-auto w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-30 group-hover:opacity-75 blur transition duration-500"></div>
            <div className="relative flex items-center bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-3 shadow-2xl">
                <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search for any client, coach, or subscription ID..."
                    className="flex-1 bg-transparent border-none outline-none text-white px-4 placeholder:text-muted-foreground/50"
                />
                <div className="hidden md:flex gap-2">
                    <span className="text-xs bg-white/10 text-muted-foreground px-2 py-1 rounded border border-white/5">CMD + K</span>
                </div>
            </div>
        </div>
    );
}
