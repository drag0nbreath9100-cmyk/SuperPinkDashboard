import { LucideIcon } from "lucide-react";
import { ProfileInput } from "./ProfileInput";
import { cn } from "@/lib/utils";

interface InfoRowProps {
    icon: LucideIcon;
    label?: string; // Optional label prefix (e.g. "Age:")
    value: string | number | undefined;
    isEditing: boolean;
    onChange: (val: string) => void;
    type?: string; // input type
    placeholder?: string;
    className?: string;
}

export function InfoRow({
    icon: Icon,
    label,
    value,
    isEditing,
    onChange,
    type = "text",
    placeholder,
    className
}: InfoRowProps) {
    return (
        <div className={cn("flex items-center gap-3 text-muted-foreground", className)}>
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 flex gap-2 items-center overflow-hidden">
                {label && <span className="shrink-0">{label}</span>}
                <ProfileInput
                    isEditing={isEditing}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type={type}
                    placeholder={placeholder}
                    className="flex-1 min-w-0" // prevent flex overflow
                />
            </div>
        </div>
    );
}
