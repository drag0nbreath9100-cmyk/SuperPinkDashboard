import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdherenceDetails {
    totalScore: number;
    reviewRate: number;
    onboardingRate: number;
    activeRate: number;
}

interface TeamAdherenceCardProps {
    details: AdherenceDetails;
    trend: string;
    trendUp: boolean;
}

export function TeamAdherenceCard({ details, trend, trendUp }: TeamAdherenceCardProps) {
    const isAlert = details.totalScore < 80;

    // Helper to determine status color based on thresholds
    const getStatusColor = (value: number, thresholdGood: number, thresholdWarn: number) => {
        if (value >= thresholdGood) return "text-emerald-400";
        if (value < thresholdWarn) return "text-rose-400";
        return "text-amber-400";
    };

    const MetricRow = ({ label, value, good, warn }: { label: string, value: number, good: number, warn: number }) => (
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-slate-300">{label}</span>
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className={cn("font-bold font-mono", getStatusColor(value, good, warn))}>
                        {Math.round(value)}%
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {value >= good ? 'Good' : value < warn ? 'Critical' : 'Warning'}
                    </span>
                </div>
                {value >= good ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500/50" />
                ) : (
                    <AlertTriangle className={cn("w-5 h-5", value < warn ? "text-rose-500/50" : "text-amber-500/50")} />
                )}
            </div>
        </div>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="block w-full h-full text-left focus:outline-none group">
                    <GlassCard className={cn(
                        "p-6 flex flex-col justify-between h-full min-h-[160px] relative transition-colors group-hover:bg-white/5 cursor-pointer",
                        isAlert && "shadow-[0_0_30px_-10px_rgba(225,29,72,0.3)] border-rose-500/20 bg-rose-500/5",
                        !isAlert && "hover:border-blue-500/30"
                    )}>
                        <div className="flex justify-between items-start">
                            <span className="text-blue-200/60 text-xs font-bold tracking-widest uppercase">Team Adherence</span>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                                isAlert ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20"
                            )}>
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>

                        <div>
                            <div className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">{details.totalScore}%</div>
                            <div className={cn("text-xs font-semibold flex items-center gap-1", trendUp ? "text-emerald-400" : "text-rose-400")}>
                                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {trend}
                                <span className="text-slate-500 font-normal ml-1">vs last month</span>
                            </div>
                        </div>

                        {isAlert && (
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        )}
                    </GlassCard>
                </button>
            </DialogTrigger>

            <DialogContent className="bg-slate-900/95 border-white/10 text-white backdrop-blur-xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Adherence Breakdown
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-sm uppercase tracking-widest mb-1">Overall Score</span>
                        <span className={cn("text-5xl font-bold", isAlert ? "text-rose-400" : "text-emerald-400")}>
                            {details.totalScore}%
                        </span>
                        <span className="text-xs text-slate-500 mt-2">Weighted Average</span>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-400 px-1">Performance Factors</h4>
                        {/* 1. Review Rate (40% Weight) */}
                        <MetricRow
                            label="Check-in Review Rate"
                            value={details.reviewRate}
                            good={80}
                            warn={50}
                        />

                        {/* 2. Onboarding Speed (30% Weight) */}
                        <MetricRow
                            label="Onboarding Speed (<48h)"
                            value={details.onboardingRate}
                            good={90}
                            warn={70}
                        />

                        {/* 3. Active Client Rate (30% Weight) */}
                        <MetricRow
                            label="Active Client Rate"
                            value={details.activeRate}
                            good={80}
                            warn={60}
                        />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-200/80 leading-relaxed">
                        Tip: Improve your score by reviewing check-ins daily and delivering workout plans within 48 hours of client signup.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
