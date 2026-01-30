import ClientRoster from "./ClientRoster";
import { api } from "@/lib/api";

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
    const clients = await api.getClients();
    const coaches = await api.getCoaches();

    return (
        <main className="min-h-screen p-8 lg:p-12 pb-24 space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">
                        Client <span className="accent-text">Roster</span>
                    </h1>
                    <p className="text-blue-200/50 flex items-center gap-2">
                        Displaying all registered athletes
                    </p>
                </div>
            </header>

            <ClientRoster initialClients={clients} coaches={coaches} />
        </main>
    );
}
