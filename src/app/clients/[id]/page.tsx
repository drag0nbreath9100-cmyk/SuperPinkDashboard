import { ClientProfile } from "@/components/profile/ClientProfile";
import { api } from "@/lib/api";

export const dynamic = 'force-dynamic';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await api.getClient(id);

    if (!client) {
        return (
            <main className="min-h-screen bg-[#020617] p-12 flex items-center justify-center">
                <div className="text-slate-400">Client not found or Supabase not configured.</div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12 pb-24">
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <ClientProfile clientId={id} client={client} />
            </div>
        </main>
    );
}
