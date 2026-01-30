"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    CheckSquare,
    MessageSquare,
    FileText,
    Phone,
    Zap,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    badge?: number;
    color: "primary" | "violet" | "emerald" | "amber";
    onClick?: () => void;
}

const colorStyles = {
    primary: {
        bg: "bg-primary/10 hover:bg-primary/20",
        border: "border-primary/20 hover:border-primary/40",
        text: "text-primary",
        glow: "group-hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]"
    },
    violet: {
        bg: "bg-violet-500/10 hover:bg-violet-500/20",
        border: "border-violet-500/20 hover:border-violet-500/40",
        text: "text-violet-400",
        glow: "group-hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]"
    },
    emerald: {
        bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
        border: "border-emerald-500/20 hover:border-emerald-500/40",
        text: "text-emerald-400",
        glow: "group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
    },
    amber: {
        bg: "bg-amber-500/10 hover:bg-amber-500/20",
        border: "border-amber-500/20 hover:border-amber-500/40",
        text: "text-amber-400",
        glow: "group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
    }
};

function QuickAction({ icon: Icon, label, description, badge, color, onClick }: QuickActionProps) {
    const styles = colorStyles[color];

    return (
        <button
            onClick={onClick}
            className={cn(
                "group w-full p-4 rounded-xl border transition-all duration-300",
                "flex items-center gap-4 text-left",
                styles.bg,
                styles.border,
                styles.glow
            )}
        >
            <div className={cn(
                "p-3 rounded-xl transition-transform group-hover:scale-110",
                "bg-white/5",
                styles.text
            )}>
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{label}</span>
                    {badge !== undefined && badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{description}</p>
            </div>

            <ArrowRight className={cn(
                "w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all",
                styles.text
            )} />
        </button>
    );
}

interface QuickActionsPanelProps {
    pendingCheckins?: number;
}

export function QuickActionsPanel({ pendingCheckins = 0 }: QuickActionsPanelProps) {
    return (
        <GlassCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                        <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-white">Quick Actions</h3>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
                <QuickAction
                    icon={CheckSquare}
                    label="Review Check-ins"
                    description="Review pending client submissions"
                    badge={pendingCheckins}
                    color="primary"
                />
                <QuickAction
                    icon={MessageSquare}
                    label="Message Clients"
                    description="Send bulk or individual messages"
                    color="violet"
                />
                <QuickAction
                    icon={FileText}
                    label="Weekly Report"
                    description="Generate performance summary"
                    color="emerald"
                />
                <QuickAction
                    icon={Phone}
                    label="Schedule Call"
                    description="Book a client consultation"
                    color="amber"
                />
            </div>
        </GlassCard>
    );
}
