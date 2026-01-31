import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Plus, AlertCircle, TrendingUp, TrendingDown, Users, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntelligenceEngine } from "@/components/admin/IntelligenceEngine";
import { api } from "@/lib/api";
import { RevenueCard } from "@/components/admin/RevenueCard";
import { NewClientDialog } from "@/components/admin/NewClientDialog";
import { TeamAdherenceCard } from "@/components/admin/TeamAdherenceCard";
import { ChurnRiskCard } from "@/components/admin/ChurnRiskCard";

export const dynamic = 'force-dynamic';

// --- Sub-Components ---

const KPI = ({ title, value, trend, trendUp, isAlert, icon: Icon }: any) => (
    <GlassCard className={cn("p-6 flex flex-col justify-between h-full min-h-[160px]", isAlert && "shadow-[0_0_30px_-10px_rgba(225,29,72,0.3)] border-rose-500/20")}>
        <div className="flex justify-between items-start">
            <span className="text-blue-200/60 text-xs font-bold tracking-widest uppercase">{title}</span>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border",
                isAlert ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            )}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div>
            <div className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">{value}</div>
            <div className={cn("text-xs font-semibold flex items-center gap-1", trendUp ? 'text-emerald-400' : 'text-rose-400')}>
                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend}
                <span className="text-slate-500 font-normal ml-1">vs last month</span>
            </div>
        </div>
    </GlassCard>
);

const CoachRow = ({ name, inactiveClients, totalClients }: any) => {
    const inactiveRate = totalClients === 0 ? 0 : Math.round((inactiveClients / totalClients) * 100);
    const isCritical = inactiveRate > 20;

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-white/5">
                    {name[0]}
                </div>
                <div>
                    <div className="text-sm font-bold text-white max-w-[120px] truncate" title={name}>{name}</div>
                    <div className="text-xs text-slate-500">{totalClients} Total Clients</div>
                </div>
            </div>
            <div className="text-right">
                <div className={cn("text-sm font-bold", isCritical ? "text-rose-400" : "text-slate-300")}>
                    {inactiveClients} Inactive
                </div>
                <div className="text-xs text-slate-500">{inactiveRate}% Rate</div>
            </div>
        </div>
    )
}

const RevenueChartMockup = () => (
    <div className="w-full h-48 flex items-end gap-3 mt-4 px-2 relative">
        {/* Background Grid */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
            {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-blue-200 w-full h-0 dashed" />)}
        </div>

        {/* Bars */}
        {[
            { label: "Basic", height: "40%", color: "bg-slate-700" },
            { label: "Pro", height: "65%", color: "bg-blue-600" },
            { label: "Elite", height: "85%", color: "bg-violet-600" },
            { label: "VIP", height: "30%", color: "bg-emerald-500" },
        ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer hover:-translate-y-1 transition-transform">
                <div className="w-full relative rounded-t-lg overflow-hidden bg-white/5 h-full flex items-end">
                    <div className={cn("w-full transition-all duration-500 relative group-hover:brightness-110", bar.color)} style={{ height: bar.height }}>
                        <div className="glare absolute top-0 left-0 w-full h-[1px] bg-white/50" />
                    </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{bar.label}</span>
            </div>
        ))}
    </div>
);

async function getData() {
    try {
        const [stats, coaches, clients, intelligenceFeed, churnRisks] = await Promise.all([
            api.getDashboardStats(),
            api.getCoaches(),
            api.getClients(),
            api.getIntelligenceFeed(),
            api.getChurnRiskReport()
        ]);
        return { stats, coaches, clients, intelligenceFeed, churnRisks };
    } catch (e) {
        console.error("Failed to fetch admin data", e);
        return {
            stats: {
                activeClients: 0,
                monthlyRevenue: 0,
                pendingAlerts: 0,
                revenueByPlan: [],
                revenueOverTime: [],
                revenueByYear: [],
                teamAdherence: 100,
                teamAdherenceDetails: {
                    totalScore: 100,
                    reviewRate: 100,
                    onboardingRate: 100,
                    activeRate: 100
                }
            },
            coaches: [],
            clients: [],
            intelligenceFeed: [],
            churnRisks: []
        };
    }
}

export default async function AdminPage() {
    const { stats, coaches, clients, intelligenceFeed, churnRisks } = await getData();

    // Calculate clients per coach
    const coachesWithCounts = coaches.map(coach => {
        const coachClients = clients.filter(c => c.coach_id === coach.id);
        const inactiveCount = Math.floor(coachClients.length * 0.1); // Mock 10% inactivity for now as we lack 'last_active'
        return {
            ...coach,
            totalClients: coachClients.length,
            inactiveClients: inactiveCount
        };
    });

    return (
        <main className="min-h-screen p-8 lg:p-12 pb-24 space-y-8 animate-in fade-in duration-700">

            {/* HEADER */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
                        Good Afternoon, <span className="accent-text">Omar</span>
                    </h1>
                    <p className="text-blue-200/50 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        System Status: <span className="text-emerald-400 font-bold">Online & Synchronized</span>
                    </p>
                </div>

                <NewClientDialog />
            </header>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI title="Total Revenue (Live)" value={`$${stats.monthlyRevenue.toLocaleString()}`} trend="5.4%" trendUp={true} isAlert={false} icon={DollarSign} />
                <KPI title="Active Clients" value={stats.activeClients} trend="12.1%" trendUp={true} isAlert={false} icon={Users} />
                <TeamAdherenceCard
                    details={stats.teamAdherenceDetails || {
                        totalScore: stats.teamAdherence || 100,
                        reviewRate: 100,
                        onboardingRate: 100,
                        activeRate: 100
                    }}
                    trend="0.8%"
                    trendUp={true}
                />
                <KPI title="Churn Risk" value={churnRisks.length} trend="2.1%" trendUp={false} isAlert={churnRisks.length > 0} icon={AlertCircle} />
            </div>

            {/* MAIN DASHBOARD CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* LEFT: Intelligence & Revenue */}
                <div className="lg:col-span-8 flex flex-col gap-8">

                    {/* AI Intelligence Engine */}
                    <IntelligenceEngine initialInsights={intelligenceFeed} />

                    {/* Main Revenue Chart */}
                    {/* Main Revenue Chart */}
                    <RevenueCard stats={stats} />
                </div>

                {/* RIGHT: Risks & Coach Performance */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Churn Risk Monitor */}
                    <ChurnRiskCard risks={churnRisks} />

                    <GlassCard className="p-0 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-violet-400" />
                                Coach Performance
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Who has the most inactive clients?</p>
                        </div>

                        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {coachesWithCounts.map((coach) => (
                                <CoachRow
                                    key={coach.id}
                                    name={coach.name}
                                    inactiveClients={coach.inactiveClients}
                                    totalClients={coach.totalClients}
                                />
                            ))}
                            {coachesWithCounts.length === 0 && (
                                <div className="p-4 text-center text-slate-500 text-sm">No coaches found</div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                            <button className="w-full py-3 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                View Detailed Report
                            </button>
                        </div>
                    </GlassCard>
                </div>

            </div>
        </main>
    );
}
