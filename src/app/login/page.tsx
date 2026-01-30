import { login } from "@/app/auth/actions";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    const error = params.error;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[30%] w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[30%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px]" />
                <div className="noise-overlay fixed inset-0 pointer-events-none z-0 opacity-20 bg-repeat [background-image:var(--bg-noise)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
                        <span className="font-bold text-white text-3xl">O</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
                        <p className="text-slate-400">Sign in to access your dashboard</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form className="space-y-4" action={login}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">Email</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-sm"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="coach@omarfit.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="password">Password</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-sm"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Sign In
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">Protected by strict access controls.</p>
                </div>
            </div>
        </div>
    );
}
