import { cn } from "@/lib/utils";
import React from "react";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    glow?: boolean;
}

export function NeonButton({
    className,
    variant = "primary",
    glow = true,
    children,
    isLoading,
    ...props
}: NeonButtonProps & { isLoading?: boolean }) {
    const variants = {
        primary: `bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] border border-white/10`,
        secondary: `bg-white/5 text-white hover:bg-white/10 border border-white/10`,
        danger: `bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-100 border border-red-500/20 hover:bg-red-900/70`,
        ghost: "text-muted-foreground hover:text-white hover:bg-white/5",
    };

    return (
        <button
            className={cn(
                "relative inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
