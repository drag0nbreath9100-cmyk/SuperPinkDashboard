import { signup } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string; error?: string }>;
}) {
    const params = await searchParams;
    const token = params.token;
    const error = params.error;

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">Invitation Required</h1>
                    <p className="mt-4 text-slate-400">You must have a valid invitation link to sign up.</p>
                </div>
            </div>
        );
    }

    // Validate token server-side before showing form
    const supabase = await createClient();
    const { data: invitation, error: inviteError } = await supabase
        .rpc('get_invitation_by_token', { lookup_token: token })
        .single<{ id: string; email: string; status: string; role: string }>();

    if (inviteError || !invitation || invitation.status !== 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">Invalid Invitation</h1>
                    <p className="mt-4 text-slate-400">This invitation is invalid, expired, or has already been used.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[30%] w-[800px] h-[800px] rounded-full bg-emerald-600/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[30%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="noise-overlay fixed inset-0 pointer-events-none z-0 opacity-20 bg-repeat [background-image:var(--bg-noise)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
                        <span className="font-bold text-white text-3xl">+</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Join the Team</h1>
                        <p className="text-slate-400">Complete your profile to get started</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-4" action={signup}>
                    <input type="hidden" name="token" value={token} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Email (Locked)</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-slate-400 cursor-not-allowed"
                            name="email"
                            type="email"
                            value={invitation.email}
                            readOnly
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="fullName">Full Name</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Omar Taha"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="phoneNumber">WhatsApp Number</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            placeholder="+971 50 123 4567"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="password">Password</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-sm"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
