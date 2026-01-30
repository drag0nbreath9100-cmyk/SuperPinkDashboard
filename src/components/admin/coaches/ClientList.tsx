'use client';

import { useState } from 'react';
import { Client } from '@/lib/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { Search, Filter, User, Calendar, Activity, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientListProps {
    clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

    const filteredClients = clients
        .filter(client => {
            const matchesSearch = client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all'
                ? true
                : client.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
            // Default newest first if no date available, otherwise checking created_at or id
            // Assuming higher ID is newer if no date field for sorting
            return (b.id - a.id);
        });

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'inactive': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
            case 'new_lead': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'active', 'inactive', 'new_lead'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${statusFilter === status
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {filteredClients.map((client) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            layout
                        >
                            <GlassCard className="p-4 hover:border-blue-500/30 transition-all group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-lg font-bold text-white shadow-lg shrink-0">
                                        {client.full_name[0]}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                                {client.full_name}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(client.status)}`}>
                                                {client.status?.replace('_', ' ') || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Activity className="w-3 h-3 text-emerald-400" />
                                                {client.package_name || 'No Plan'}
                                            </span>
                                            {client.subscription_end_date && (
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3 text-blue-400" />
                                                    Ends {new Date(client.subscription_end_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center gap-8 mr-6">
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total Stress</div>
                                            <div className="text-sm font-bold text-white">{client.stress_level || 0}/10</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Starting Weight</div>
                                            <div className="text-sm font-bold text-white">{client.initial_weight || '-'} kg</div>
                                        </div>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredClients.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No clients found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    )
}
