"use client";

import { useTransition, useState, useEffect } from "react";
import { Copy, Plus, X, Shield, Mail, CheckCircle2, AlertCircle, Check, Ban } from "lucide-react";
import { createInvitation } from "@/app/admin/invitations/actions";
import { approveCoach, rejectCoach } from "@/app/admin/team/actions";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Profile = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
};

export default function TeamManagementPage() {
    const [isPending, startTransition] = useTransition();
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("coach");

    // State for lists
    const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
    const [activeUsers, setActiveUsers] = useState<Profile[]>([]);
    const supabase = createClient();

    // Fetch users (Realtime would be better, but simple fetch for now)
    const fetchUsers = async () => {
        const { data } = await supabase.from('coaches').select('*').order('created_at', { ascending: false });
        if (data) {
            setPendingUsers(data.filter((p: Profile) => p.status === 'pending'));
            setActiveUsers(data.filter((p: Profile) => p.status === 'active'));
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInvite = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createInvitation(formData);
            if (result.error) {
                toast.error(result.error);
            } else if (result.inviteLink) {
                setInviteLink(result.inviteLink);
                toast.success("Invitation link generated!");
            }
        });
    };

    const handleApprove = async (userId: string) => {
        const result = await approveCoach(userId);
        if (result.success) {
            toast.success("Coach approved!");
            fetchUsers();
        } else {
            toast.error(result.error);
        }
    };

    const handleReject = async (userId: string) => {
        if (!confirm("Are you sure you want to suspend this user?")) return;
        const result = await rejectCoach(userId);
        if (result.success) {
            toast.success("Coach suspended.");
            fetchUsers();
        } else {
            toast.error(result.error);
        }
    };

    const copyLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            toast.success("Link copied to clipboard");
        }
    };

    const reset = () => {
        setInviteLink(null);
        setEmail("");
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Team Management</h1>
                    <p className="text-slate-400">Manage your coaching staff and invitations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Invite Card */}
                <div className="bg-[#0f172a]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl h-fit">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Invite New Member</h2>
                            <p className="text-slate-400 text-sm">Generate a secure signup link.</p>
                        </div>
                    </div>

                    {!inviteLink ? (
                        <form action={handleInvite} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="coach@omarfit.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-2 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 ml-1">Role</label>
                                <select
                                    name="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full mt-2 px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    <option value="coach">Coach</option>
                                    <option value="head_coach">Head Coach</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                {isPending ? "Generating..." : "Generate Invite Link"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-emerald-100">Invitation Ready</h3>
                                <p className="text-xs text-emerald-200/60">Send this link to the new coach.</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={inviteLink}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 font-mono text-sm focus:outline-none"
                                />
                                <button
                                    onClick={copyLink}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={reset}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Send Another Invite
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Pending Approvals */}
                    {pendingUsers.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl animate-in slide-in-from-right-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Pending Approval</h2>
                                    <p className="text-amber-200/60 text-sm">{pendingUsers.length} coach(es) waiting for confirmation.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {pendingUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                        <div>
                                            <div className="font-medium text-white">{user.name || "Unknown Name"}</div>
                                            <div className="text-xs text-slate-400">{user.email}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-amber-500 mt-1 font-bold">{user.role.replace('_', ' ')}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(user.id)}
                                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                                title="Suspend"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Team */}
                    <div className="bg-[#0f172a]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Active Team</h2>
                                <p className="text-slate-400 text-sm">View and manage current roles.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {activeUsers.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-sm">No active team members yet.</div>
                            ) : (
                                activeUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-white/5 hover:bg-slate-900/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                {user.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white text-sm">{user.name}</div>
                                                <div className="text-xs text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 capitalize">
                                            {user.role.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
