import CoachClientRoster from "./CoachClientRoster";
import { api } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CoachClientsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch only clients assigned to the current coach (using actual user ID)
    const clients = await api.getCoachClients(user.id);

    return (
        <main className="min-h-screen p-4 md:p-8 lg:p-12 pb-24 space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
                        Client <span className="accent-text">Roster</span>
                    </h1>
                    <p className="text-blue-200/50 flex items-center gap-2">
                        Managing {clients.length} active athletes
                    </p>
                </div>
            </header>

            <CoachClientRoster initialClients={clients} />
        </main>
    );
}
