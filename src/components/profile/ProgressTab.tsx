"use strict";
"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Client, CheckIn, api } from "@/lib/api";
import { TrendingUp, Scale, Calendar, Moon, Activity, Zap, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

export function ProgressTab({ clientId, client }: { clientId: string, client?: Client }) {
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<'weight' | 'calories' | 'steps' | 'stress' | 'sleep' | 'rating'>('weight');

    const metrics = {
        weight: { label: 'Weight', color: '#8b5cf6', unit: 'kg', icon: Scale, dataKey: 'weight' },
        calories: { label: 'Calories', color: '#f97316', unit: 'kcal', icon: Zap, dataKey: 'calories' },
        steps: { label: 'Steps', color: '#06b6d4', unit: '', icon: Activity, dataKey: 'steps' },
        stress: { label: 'Stress', color: '#ec4899', unit: '/10', icon: Activity, dataKey: 'stress_level' },
        sleep: { label: 'Sleep', color: '#6366f1', unit: 'hrs', icon: Moon, dataKey: 'sleeping_hours' },
        rating: { label: 'Rating', color: '#eab308', unit: '/10', icon: Star, dataKey: 'service_rating' },
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await api.getCheckIns(clientId);
                // Sort by date ascending for the chart
                setCheckIns(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            } catch (e) {
                console.error("Failed to load progress:", e);
            } finally {
                setIsLoading(false);
            }
        };
        if (clientId) loadData();
    }, [clientId]);

    if (isLoading) return <div className="text-white text-center py-10">Loading chart...</div>;

    const currentMetric = metrics[selectedMetric];
    const latest = checkIns[checkIns.length - 1];
    const first = checkIns[0];
    const totalChange = first && latest ? latest.weight - first.weight : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <Scale className="w-5 h-5 text-secondary" />
                        <span>Weight Change</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg</span>
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Total Progress</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <span>Current Weight</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {latest?.weight || client?.weight_kg || 'N/A'} <span className="text-sm font-normal text-muted-foreground">kg</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <span>Last Check-in</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {latest ? new Date(latest.date).toLocaleDateString() : 'N/A'}
                    </div>
                </GlassCard>
            </div>

            {/* Dynamic Chart */}
            <GlassCard className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Progress Trends</h3>
                        <p className="text-sm text-muted-foreground">Track your metrics over time</p>
                    </div>

                    {/* Metric Selector */}
                    <div className="flex flex-wrap gap-2 bg-white/5 p-1 rounded-xl">
                        {(Object.keys(metrics) as Array<keyof typeof metrics>).map((key) => {
                            const Icon = metrics[key].icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedMetric(key)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                        selectedMetric === key
                                            ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {metrics[key].label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    {checkIns.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={checkIns} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#525252"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#525252"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    domain={['auto', 'auto']}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e1e1e',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                    itemStyle={{ color: currentMetric.color }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                                    formatter={(value: number) => [`${value} ${currentMetric.unit}`, currentMetric.label]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={currentMetric.dataKey}
                                    stroke={currentMetric.color}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMetric)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                            <TrendingUp className="w-10 h-10 opacity-20" />
                            <p>No check-in data available yet.</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* History List - Reusing existing simple list style but with check-in data */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Measurement History</h3>
                </div>
                <div className="space-y-1">
                    {checkIns.slice().reverse().map((entry, i) => (
                        <div key={i} className="grid grid-cols-4 p-3 rounded hover:bg-white/5 text-sm border-b border-white/5 last:border-0 items-center">
                            <span className="text-white">{new Date(entry.date).toLocaleDateString()}</span>
                            <span className="text-center text-muted-foreground">{entry.weight} kg</span>
                            <div className="flex justify-center gap-2">
                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                    <Moon className="w-3 h-3" /> {entry.sleeping_hours || '-'}
                                </span>
                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                    <Activity className="w-3 h-3" /> {entry.stress_level}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs font-bold">
                                    ★ {entry.service_rating}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
