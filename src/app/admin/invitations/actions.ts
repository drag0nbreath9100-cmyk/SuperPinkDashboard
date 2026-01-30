"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvitation(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const role = formData.get("role") as string || 'coach';

    // Check if admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from('coaches').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from('invitations')
        .insert({ email, role, status: 'pending' })
        .select('token')
        .single();

    if (error) {
        console.error("Invite error:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/team');

    // Construct Invite Link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?token=${data.token}`;

    return { success: true, inviteLink };
}

export async function revokeInvitation(id: string) {
    const supabase = await createClient();

    // Check auth ... (RLS handles most, but good to be explicit/double check if needed)

    const { error } = await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/team');
    return { success: true };
}
