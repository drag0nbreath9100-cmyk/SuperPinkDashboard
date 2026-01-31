"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return redirect("/login?error=Could not authenticate");
    }

    // Determine redirection based on role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from("coaches")
            .select("role")
            .eq("id", user.id)
            .single();

        const role = profile?.role || 'coach';
        if (role === 'admin') redirect('/admin');
        if (role === 'head_coach') redirect('/head-coach');
        redirect('/coach');
    }

    redirect("/coach"); // Fallback
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    // 1. Collect Data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const token = formData.get("token") as string;

    if (!token) return redirect("/signup?error=Invitation token is missing");

    // 2. Validate Token using RPC function (secure check)
    const { data: invitation, error: inviteError } = await supabase
        .rpc('get_invitation_by_token', { lookup_token: token })
        .single<{ id: string; email: string; status: string; role: string }>();

    if (inviteError || !invitation) {
        return redirect(`/signup?token=${token}&error=Invalid invitation`);
    }

    if (invitation.status !== 'pending') {
        return redirect(`/signup?token=${token}&error=Invitation has already been used or expired`);
    }

    if (invitation.email !== email) {
        return redirect(`/signup?token=${token}&error=Email does not match the invitation`);
    }

    // 3. Create User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                // We'll insert phone number into profile, but can also store here
            }
        }
    });

    if (authError) {
        return redirect(`/signup?token=${token}&error=${encodeURIComponent(authError.message)}`);
    }

    if (!authData.user) {
        return redirect(`/signup?token=${token}&error=Failed to create user`);
    }

    // 4. Update Coach Profile (Phone Number & Role from Invite)
    // Note: The trigger created public.coaches row on insert, but we need to update it with more info (phone, correct role)
    // The trigger sets role='coach'. If invite says 'head_coach', we must update it.

    const { error: profileError } = await supabase
        .from('coaches')
        .update({
            name: fullName,
            phone_number: phoneNumber,
            role: invitation.role // Set role from invitation
        })
        .eq('id', authData.user.id);

    if (profileError) {
        console.error("Coach profile update error:", profileError);
        // Continue anyway, manageable manual fix later if needed
    }

    // 5. Mark Invitation as Used
    await supabase
        .from('invitations')
        .update({ status: 'used' })
        .eq('id', invitation.id);

    // 6. Redirect
    redirect("/coach"); // Or login? signUp autologs in? 
    // Supabase signUp with email/pass auto logs in ONLY if email confirmation is disabled. 
    // If enabled, they can't login yet. 
    // Assuming email confirmation might be OFF for this closed beta app, or we need to handle "Check email".
    // For now, let's assume auto-login or redirect to login.
}
