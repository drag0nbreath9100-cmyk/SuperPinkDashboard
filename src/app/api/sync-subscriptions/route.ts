
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Supabase credentials missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Fetch all pricing plans
        const { data: plans, error: plansError } = await supabase
            .from('pricing_plans')
            .select('*');

        if (plansError) throw plansError;

        // 2. Fetch all clients
        const { data: clients, error: clientsError } = await supabase
            .from('client_profiles')
            .select('id, full_name, package_name, subscription_duration_amount, subscription_duration_unit, subscribed_plan_id');

        if (clientsError) throw clientsError;

        let updatedCount = 0;
        const errors: any[] = [];

        // 3. Match and Update
        for (const client of clients) {
            if (!client.package_name || !client.subscription_duration_amount) continue;

            const clientPackage = client.package_name.trim().toLowerCase();

            // Normalize duration: if unit is 'months' or 'month', use amount.
            // Need to handle potential mismatches if units differ, but assuming 'months' for now based on user data.
            const duration = client.subscription_duration_amount;

            const matchedPlan = plans.find(p =>
                p.name.toLowerCase().trim() === clientPackage &&
                p.duration_months === duration
            );

            if (matchedPlan) {
                if (client.subscribed_plan_id !== matchedPlan.id) {
                    const { error: updateError } = await supabase
                        .from('client_profiles')
                        .update({ subscribed_plan_id: matchedPlan.id })
                        .eq('id', client.id);

                    if (updateError) {
                        errors.push({ clientId: client.id, error: updateError.message });
                    } else {
                        updatedCount++;
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            totalClients: clients.length,
            matchedAndUpdateCount: updatedCount,
            errors
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
