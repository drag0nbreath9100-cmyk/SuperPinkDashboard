import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { UserProfile } from "@/components/profile/UserProfile";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const coach = await api.getCoach(user.id);

    if (!coach) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl text-white font-bold">Profile not found</h1>
                <p className="text-slate-400">Could not load profile details for {user.email}</p>
            </div>
        );
    }

    // Determine which clients to fetch based on role
    // For Head Coach, ideally we might want to see ALL system clients or just theirs, 
    // but the component expects a list of clients to calc stats.
    // For now, let's just fetch clients assigned to this coach ID to match the generic "My Clients" stat
    const clients = await api.getCoachClients(user.id);

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-32">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                    My Profile
                </h1>
                <p className="text-slate-400 text-lg">
                    Manage your personal details and view your performance.
                </p>
            </div>

            <UserProfile initialCoach={coach} initialClients={clients || []} />
        </div>
    );
}
