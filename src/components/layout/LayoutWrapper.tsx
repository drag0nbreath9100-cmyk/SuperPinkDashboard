"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');

    return (
        <div className="flex min-h-screen">
            {!isAuthPage && <Sidebar />}
            <div className={cn(
                "flex-1 relative z-10 transition-all duration-300",
                !isAuthPage && "pl-24" // Only apply padding if sidebar is present
            )}>
                {children}
            </div>
        </div>
    );
}
