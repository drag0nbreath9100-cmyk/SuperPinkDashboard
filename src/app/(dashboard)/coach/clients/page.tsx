import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Filter, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CoachClientsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch only clients assigned to the current coach (using actual user ID)
    const clients = await api.getCoachClients(user.id);

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 pb-24 space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tighter">
                        My <span className="text-secondary">Roster</span>
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Managing {clients.length} active athletes
                    </p>
                </div>
            </header>

            {/* SEARCH & FILTER (Visual) */}
            <div className="flex gap-4">
                <GlassCard className="flex-1 p-3 flex items-center gap-3 bg-white/5">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search my clients..."
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
                    />
                </GlassCard>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                    <Filter className="w-5 h-5" />
                    <span className="hidden md:inline">Filter</span>
                </button>
            </div>

            {/* CLIENTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <Link href={`/clients/${client.id}`} key={client.id}>
                        <GlassCard className="p-6 group hover:border-secondary/30 transition-all duration-300 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-transparent flex items-center justify-center text-secondary font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                    {client.full_name ? client.full_name[0] : <User className="w-6 h-6" />}
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                                    client.status === 'active'
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-slate-700/50 text-slate-400 border-slate-600/50"
                                )}>
                                    {client.status || 'Unknown'}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-secondary transition-colors">
                                {client.full_name || 'Unnamed Client'}
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">
                                {client.package_name || 'No Active Package'}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-4">
                                <span>View Progress</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-secondary" />
                            </div>
                        </GlassCard>
                    </Link>
                ))}

                {clients.length === 0 && (
                    <div className="col-span-full py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                            <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No clients assigned</h3>
                        <p className="text-muted-foreground">
                            You haven't been assigned any clients yet.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
