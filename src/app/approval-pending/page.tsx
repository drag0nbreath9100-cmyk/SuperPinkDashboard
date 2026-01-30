import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";

export default function ApprovalPendingPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[30%] w-[800px] h-[800px] rounded-full bg-amber-600/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[30%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="noise-overlay fixed inset-0 pointer-events-none z-0 opacity-20 bg-repeat [background-image:var(--bg-noise)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.5)] animate-pulse">
                        <span className="font-bold text-white text-4xl">!</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Approval Pending</h1>
                <p className="text-slate-400 mb-8">
                    Your account has been created successfully but requires administrator approval before you can access the dashboard.
                </p>

                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10 text-sm text-slate-500 mb-8">
                    Please contact your administrator to verify your account status.
                </div>

                <form action={logout}>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );
}
