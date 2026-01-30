import { cn } from "@/lib/utils";
import React from "react";

interface ProfileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    isEditing: boolean;
    value: string | undefined;
    placeholder?: string;
}

export function ProfileTextarea({
    isEditing,
    value,
    className,
    placeholder,
    ...props
}: ProfileTextareaProps) {
    if (!isEditing) {
        return (
            <p className={cn("text-muted-foreground whitespace-pre-wrap", className)}>
                {value || <span className="opacity-50 italic">{placeholder || "No description provided."}</span>}
            </p>
        );
    }

    return (
        <textarea
            value={value || ''}
            className={cn(
                "bg-white/5 border-b border-white/20 rounded-none rounded-t-lg p-3 text-white w-full text-sm",
                "focus:outline-none focus:border-secondary focus:bg-white/10 transition-all",
                "placeholder:text-white/20",
                "min-h-[100px]",
                className
            )}
            placeholder={placeholder}
            {...props}
        />
    );
}

