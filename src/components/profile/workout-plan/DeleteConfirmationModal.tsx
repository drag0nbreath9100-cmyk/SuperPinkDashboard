"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Plan?",
    description = "This action cannot be undone immediately. You will have a short window to undo.",
    isDeleting = false
}: DeleteConfirmationModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-md">
                            <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0B] border border-white/10 shadow-2xl shadow-red-900/20">
                                {/* Glass overlay */}
                                <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                                {/* Content */}
                                <div className="relative p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                            <Trash2 className="w-6 h-6 text-red-500" />
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white">{title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            {description}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={onClose}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                onConfirm();
                                            }}
                                            disabled={isDeleting}
                                            className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isDeleting ? "Deleting..." : "Delete Plan"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
