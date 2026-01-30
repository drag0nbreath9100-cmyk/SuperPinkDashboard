"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CURRENT_COACH_ID } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

export function NotificationListener() {
    useEffect(() => {
        // Subscribe to real-time changes in the 'notifications' table
        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${CURRENT_COACH_ID}`
                },
                (payload) => {
                    console.log("[NotificationListener] Payload received:", payload);
                    const newNotification = payload.new as { message: string, type: string };

                    // distinct styling for check-ins
                    if (newNotification.type === 'check_in') {
                        toast(newNotification.message, {
                            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
                            style: {
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: '#fff',
                                backdropFilter: 'blur(8px)'
                            }
                        });

                        // Play a subtle sound
                        // const audio = new Audio('/sounds/notification.mp3'); 
                    } else {
                        toast(newNotification.message);
                    }
                }
            )
            .subscribe((status) => {
                console.log("[NotificationListener] Subscription status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return null; // This component handles side effects only
}
