import { cn } from "@/lib/utils";
import React from "react";

interface ProfileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    isEditing: boolean;
    value: string | number | undefined;
    displayValue?: React.ReactNode;
    transparent?: boolean;
}

export function ProfileInput({
    isEditing,
    value,
    displayValue,
    className,
    transparent = false,
    ...props
}: ProfileInputProps) {
    if (!isEditing) {
        return (
            <span className={cn("text-white truncate", className)}>
                {displayValue !== undefined ? displayValue : (value || <span className="text-muted-foreground opacity-50">N/A</span>)}
            </span>
        );
    }

    // specific styles for "cheap" fix:
    // - Remove full border
    // - Use bottom border focus interaction
    // - Subtle background
    return (
        <div className="relative group w-full">
            <input
                value={value === undefined ? '' : value}
                className={cn(
                    "w-full bg-transparent border-b border-white/20 px-2 py-1 text-inherit transition-all duration-300",
                    "focus:outline-none focus:border-secondary focus:bg-white/5",
                    "placeholder:text-white/20",
                    className
                )}
                {...props}
            />
            {/* Animated accent line could go here if we want extra fancy, but border-b is solid start */}
        </div>
    );
}

