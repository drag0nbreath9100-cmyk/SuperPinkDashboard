"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { api, HeadCoachFeedback, CURRENT_COACH_ID } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare, Star, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeadCoachFeedbackComponent({ clientId }: { clientId: string | number }) {
    const [feedbacks, setFeedbacks] = useState<HeadCoachFeedback[]>([]);
    const [newFeedback, setNewFeedback] = useState("");
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'head_coach' | 'coach' | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        loadFeedback();

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                const { data: profile } = await supabase
                    .from("coaches")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role);
                }
            }
        };
        getUser();
    }, [clientId]);

    async function loadFeedback() {
        setLoading(true);
        try {
            const data = await api.getHeadCoachFeedback(clientId);
            setFeedbacks(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!newFeedback.trim()) return;

        setSubmitting(true);
        try {
            const saved = await api.addHeadCoachFeedback({
                client_id: Number(clientId),
                coach_id: currentUserId || CURRENT_COACH_ID,
                feedback_text: newFeedback,
                rating: rating > 0 ? rating : undefined
            });

            if (saved) {
                setFeedbacks(prev => [saved, ...prev]);
                setNewFeedback("");
                setRating(0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    }

    // If not authorized to write (regular coach) and no feedback exists, hide the entire section
    if (!loading && feedbacks.length === 0 && userRole !== 'head_coach' && userRole !== 'admin') {
        return null;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                    {userRole === 'admin' ? "Admin Feedback" : "Head Coach Feedback"}
                </h3>
            </div>

            {/* Input Area - Visible only to Head Coach and Admin */}
            {(userRole === 'head_coach' || userRole === 'admin') && (
                <GlassCard className="p-4 bg-white/5 border-indigo-500/20">
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star === rating ? 0 : star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={cn(
                                            "w-5 h-5 transition-colors",
                                            star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                                        )}
                                    />
                                </button>
                            ))}
                            <span className="text-xs text-muted-foreground ml-2 self-center">
                                {rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : "Rate (Optional)"}
                            </span>
                        </div>

                        <textarea
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                            placeholder="Write your feedback on the workout plan..."
                            className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500/50 resize-none"
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !newFeedback.trim()}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Sending..." : "Send Feedback"}
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Feedback List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground animate-pulse">Loading feedback...</div>
                ) : feedbacks.length === 0 ? (
                    (userRole === 'head_coach' || userRole === 'admin') ? (
                        <div className="text-center py-8 text-muted-foreground bg-white/5 rounded-xl border border-white/5 border-dashed">
                            No feedback history yet.
                        </div>
                    ) : null
                ) : (
                    feedbacks.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <User className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-white text-sm">Head Coach</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</p>
                                    </div>
                                    {item.rating && (
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-3 h-3",
                                                        i < item.rating! ? "text-amber-400 fill-amber-400" : "text-slate-700"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {item.feedback_text}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
