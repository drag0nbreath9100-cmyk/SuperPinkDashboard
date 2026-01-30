import { api } from "@/lib/api";
import { CoachDetailView } from "@/components/admin/coaches/CoachDetailView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function CoachPage({ params }: PageProps) {
    const { id } = await params;

    const [coach, clients] = await Promise.all([
        api.getCoach(id),
        api.getCoachClients(id)
    ]);

    if (!coach) {
        notFound();
    }

    return (
        <main className="min-h-screen p-4 md:p-8 space-y-8 pb-32">
            <Link
                href="/admin/coaches"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Roster
            </Link>

            <CoachDetailView initialCoach={coach} initialClients={clients} />
        </main>
    );
}
