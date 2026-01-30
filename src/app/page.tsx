import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Users, TrendingUp, Activity, ShieldCheck, AlertTriangle, Zap, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export const dynamic = 'force-dynamic';

async function getSafeData() {
  try {
    const [stats, alerts] = await Promise.all([
      api.getDashboardStats(),
      api.getAlerts()
    ]);
    return { stats, alerts };
  } catch (e) {
    console.error("Failed to fetch dashboard data:", e);
    return {
      stats: { activeClients: 0, monthlyRevenue: 0, pendingAlerts: 0 },
      alerts: []
    };
  }
}

export default async function Home() {
  const { stats, alerts } = await getSafeData();
  // const stats = { activeClients: 1284, monthlyRevenue: 42390, pendingAlerts: 7 };
  // const alerts: any[] = [];

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">

        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-2 text-glow">
            Central Command
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Operational dashboard initialized. Welcome to the void.
          </p>
          <div className="flex gap-4 pt-4">
            <NeonButton variant="primary">Access Headquarters</NeonButton>
            <NeonButton variant="ghost">View Documentation</NeonButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary box-glow">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Live</span>
            </div>
            <div className="pt-4">
              <p className="text-muted-foreground text-sm">Active Clients</p>
              <h3 className="text-3xl font-bold text-white">{stats.activeClients}</h3>
            </div>
          </GlassCard>

          <GlassCard className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary box-glow">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+8%</span>
            </div>
            <div className="pt-4">
              <p className="text-muted-foreground text-sm">Monthly Revenue</p>
              <h3 className="text-3xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</h3>
            </div>
          </GlassCard>

          <GlassCard className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-destructive/10 rounded-lg text-destructive box-glow">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-rose-400 bg-rose-400/10 px-2 py-1 rounded">Action Req</span>
            </div>
            <div className="pt-4">
              <p className="text-muted-foreground text-sm">Pending Alerts</p>
              <h3 className="text-3xl font-bold text-white">{stats.pendingAlerts}</h3>
            </div>
          </GlassCard>
        </div>

        {/* AI & Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Alerts Feed */}
          <GlassCard className="min-h-[300px] flex flex-col p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">AI Assistant Feed</h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">LIVE</span>
            </div>
            <div className="p-6 space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No active alerts. Systems normal.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors group">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {alert.type === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Activity className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-white leading-relaxed">{alert.message}</p>
                        <div className="flex items-center gap-2">
                          {alert.coaches && (
                            <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-full w-fit">
                              <img src={alert.coaches.image_url} alt={alert.coaches.name} className="w-4 h-4 rounded-full" />
                              <span className="text-xs text-muted-foreground">{alert.coaches.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-2">
                          <button className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all font-medium">
                            {alert.action_label} &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* System Status */}
          <GlassCard className="min-h-[300px] flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white">System Status: Online</h3>
            <p className="text-muted-foreground max-w-sm">
              All systems operational. Database connection secure. Client privacy protocols active.
            </p>
            <div className="pt-4 w-full max-w-xs">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 box-glow animate-pulse" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>CPU Usage</span>
                <span>75%</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </main>
  );
}

