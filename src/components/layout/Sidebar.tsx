"use client";

import { LayoutGrid, Users, Activity, Menu, LogOut, ChevronRight, User, ShieldCheck, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/auth/actions";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { createPortal } from "react-dom";
import { useRef } from "react";

export function Sidebar() {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<'admin' | 'head_coach' | 'coach' | null>(null);
    const [userName, setUserName] = useState<string>("Coach");
    const [statsOpen, setStatsOpen] = useState(false);
    const [coachStats, setCoachStats] = useState<{ activeClients: number; pendingCheckins: number } | null>(null);
    const [mounted, setMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("coaches")
                    .select("role, name")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role);
                    setUserName(profile.name || "Coach");

                    // Fetch stats for the hover card
                    const stats = await api.getCoachStats(user.id);
                    setCoachStats(stats);
                }
            }
        };
        getUser();
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Initial default stats if loading (to ensure hover works)
    const displayStats = coachStats || { activeClients: 0, pendingCheckins: 0 };

    // Calculate position for portal
    const getPortalPosition = () => {
        if (!profileRef.current) return { left: 0, bottom: 0 };
        const rect = profileRef.current.getBoundingClientRect();
        return {
            left: rect.right + 16, // 16px gap
            bottom: window.innerHeight - rect.bottom // align bottom
        };
    };

    const portalPos = getPortalPosition();

    // If on login page, don't show sidebar
    if (pathname === '/login') return null;

    const isCoachView = pathname?.startsWith('/coach');
    const isHeadCoachView = pathname?.startsWith('/head-coach');

    const adminNavItems = [
        { icon: LayoutGrid, label: "Headquarters", href: "/admin" },
        { icon: Users, label: "Coaching Roster", href: "/admin/coaches" },
        { icon: User, label: "All Clients", href: "/admin/clients" },
        { icon: Activity, label: "Live Operations", href: "/admin/live" },
    ];

    const coachNavItems = [
        { icon: LayoutGrid, label: "Dashboard", href: "/coach" },
        { icon: User, label: "My Clients", href: "/coach/clients" },
    ];

    const headCoachNavItems = [
        { icon: ShieldCheck, label: "Command Center", href: "/head-coach" },
        { icon: Users, label: "Coach Roster", href: "/head-coach/coaches" },
        { icon: User, label: "Client Oversight", href: "/head-coach/clients" },
    ];

    // Check if we're on a shared client page - use role to determine sidebar
    const isOnClientPage = pathname?.startsWith('/clients/');

    // Determine nav items based on role when on shared pages, otherwise use path context
    const navItems = isOnClientPage
        ? (userRole === 'head_coach' ? headCoachNavItems : (userRole === 'coach' ? coachNavItems : adminNavItems))
        : (isHeadCoachView ? headCoachNavItems : (isCoachView ? coachNavItems : adminNavItems));

    // Shared sidebar content for both desktop and mobile
    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <>
            {/* Logo Section */}
            <div className="flex items-center gap-4 px-6 mb-12">
                <div className="w-10 h-10 min-w-[2.5rem] rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                    <span className="font-bold text-primary-foreground text-lg">O</span>
                </div>
                <div className={cn(
                    "transition-opacity duration-300 whitespace-nowrap overflow-hidden",
                    (isMobile || isHovered) ? "opacity-100" : "opacity-0 w-0"
                )}>
                    <h2 className="text-xl font-bold tracking-tight text-white">Omar<span className="text-primary">Fit</span></h2>
                    <p className="text-[10px] text-primary/50 uppercase tracking-widest">Intelligence</p>
                </div>
                {/* Mobile close button */}
                {isMobile && (
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="ml-auto p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 w-full px-4">
                {navItems.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            onClick={() => isMobile && setIsMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden",
                                isActive ? "bg-primary/10 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_15px_hsl(var(--primary)/0.8)]" />
                            )}

                            <div className={cn("min-w-[1.5rem] flex items-center justify-center transition-colors", isActive ? "text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]" : "group-hover:text-primary")}>
                                <item.icon className="w-6 h-6" />
                            </div>

                            <span className={cn(
                                "font-medium whitespace-nowrap transition-all duration-300 origin-left",
                                (isMobile || isHovered) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            )}>
                                {item.label}
                            </span>

                            {/* Hover Glow Effect */}
                            {(isMobile || isHovered) && isActive && (
                                <div className="absolute right-4 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary))]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto px-4 flex flex-col gap-2">
                <form action={logout}>
                    <button
                        type="submit"
                        className={cn(
                            "w-full flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden text-slate-500 hover:text-red-400 hover:bg-red-500/10",
                            !(isMobile || isHovered) && "justify-center"
                        )}
                    >
                        <div className="min-w-[1.5rem] flex items-center justify-center">
                            <LogOut className="w-6 h-6" />
                        </div>
                        <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            (isMobile || isHovered) ? "opacity-100" : "opacity-0 w-0"
                        )}>Sign Out</span>
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t border-white/5 mx-2">
                    <div
                        ref={!isMobile ? profileRef : undefined}
                        className="relative group/profile"
                        onMouseEnter={() => !isMobile && setStatsOpen(true)}
                        onMouseLeave={() => !isMobile && setStatsOpen(false)}
                    >
                        <Link
                            href="/profile"
                            onClick={() => isMobile && setIsMobileOpen(false)}
                            className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer relative z-10"
                        >
                            <div className="w-10 h-10 min-w-[2.5rem] rounded-full border border-primary/30 bg-slate-900 overflow-hidden shadow-[0_0_15px_hsl(var(--primary)/0.3)] flex items-center justify-center relative">
                                <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600" />
                            </div>
                            <div className={cn(
                                "transition-all duration-300 overflow-hidden",
                                (isMobile || isHovered) ? "opacity-100 w-auto" : "opacity-0 w-0"
                            )}>
                                <div className="text-sm font-bold text-white group-hover/profile:text-primary transition-colors">{userName}</div>
                                <div className="text-xs text-blue-300/50 capitalize">{userRole?.replace('_', ' ') || "Loading..."}</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl bg-[#020617]/90 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-colors shadow-lg"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Sidebar Overlay & Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        />

                        {/* Mobile Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 h-full w-72 border-r border-white/5 bg-[#020617]/95 backdrop-blur-xl z-50 flex flex-col py-8 overflow-hidden md:hidden"
                        >
                            <SidebarContent isMobile={true} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-full border-r border-white/5 bg-[#020617]/90 backdrop-blur-xl z-40 transition-all duration-300 ease-out flex-col py-8 overflow-hidden backface-hidden transform-gpu will-change-[width,box-shadow]",
                    "hidden md:flex", // Hide on mobile, show on desktop
                    isHovered ? "w-72 shadow-2xl shadow-blue-900/20" : "w-24"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <SidebarContent isMobile={false} />
            </aside>

            {/* Desktop Analytics Popover via Portal (only on desktop) */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isHovered && statsOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            style={{
                                position: 'fixed',
                                left: portalPos.left,
                                bottom: portalPos.bottom - 20,
                                zIndex: 9999
                            }}
                            className="hidden md:block w-72 bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] p-0 overflow-hidden pointer-events-none"
                        >
                            {/* Decorative top gradient line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                            {/* Content Container */}
                            <div className="p-5 relative z-10 space-y-5">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_hsl(var(--emerald-500))]" />
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Performance</span>
                                    </div>
                                    <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-slate-400 font-medium">Today</span>
                                </div>

                                {/* Main Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Clients</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-white tracking-tight">{displayStats.activeClients}</span>
                                            <span className="text-xs text-slate-500">/ 30</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Retention</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-emerald-400 tracking-tight">94%</span>
                                            <span className="text-[10px] text-emerald-500/50">▲ 2%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar Section */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="w-3 h-3 text-orange-400" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Check-ins</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">{displayStats.pendingCheckins}</span>
                                    </div>
                                    <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.3)] transition-all duration-500"
                                            style={{ width: `${Math.min((displayStats.pendingCheckins / 10) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Footer Snippet */}
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500 italic">"Consistency is key"</span>
                                    <div className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline">
                                        View Profile <ChevronRight className="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Background glow effects */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
