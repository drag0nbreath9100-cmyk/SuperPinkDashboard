"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveCoach(userId: string) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('coaches').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return { error: "Unauthorized" };

    const { error } = await supabase
        .from('coaches')
        .update({ status: 'active' })
        .eq('id', userId);

    if (error) return { error: error.message };

    revalidatePath('/admin/team');
    return { success: true };
}

export async function rejectCoach(userId: string) {
    const supabase = await createClient(); // Could perform soft delete or suspend
    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase.from('coaches').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return { error: "Unauthorized" };

    const { error } = await supabase
        .from('coaches')
        .update({ status: 'suspended' })
        .eq('id', userId);

    if (error) return { error: error.message };

    revalidatePath('/admin/team');
    return { success: true };
}
