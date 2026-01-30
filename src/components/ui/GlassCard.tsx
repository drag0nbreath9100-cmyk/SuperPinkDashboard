import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    noHover?: boolean;
    isActive?: boolean;
}

export function GlassCard({ children, className, noHover = false, isActive = false, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-card",
                noHover && "hover:transform-none hover:shadow-xl",
                isActive && "glass-card-active",
                className
            )}
            {...props}
        >
            {/* Content wrapper to ensure z-index above the pseudo-elements defined in CSS */}
            <div className="relative z-20 h-full">
                {children}
            </div>
        </div>
    );
}
