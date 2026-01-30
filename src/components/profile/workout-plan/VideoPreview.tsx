import React, { useState, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { Play, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const VideoPreview = memo(({
    exerciseName,
    videoLink,
    onHoverChange
}: {
    exerciseName: string,
    videoLink?: string,
    onHoverChange?: (isHovered: boolean) => void
}) => {
    const [showPreview, setShowPreview] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [coords, setCoords] = useState<{ top: number, left: number } | null>(null);
    const openTimeoutRef = useRef<NodeJS.Timeout>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);

    // Extract YouTube ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = videoLink ? getYoutubeId(videoLink) : null;
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
            top: rect.top, // positioned above
            left: rect.left
        });

        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

        onHoverChange?.(true);

        openTimeoutRef.current = setTimeout(() => {
            setShowPreview(true);
        }, 500); // 500ms delay before showing
    };

    const handleMouseLeave = () => {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);

        closeTimeoutRef.current = setTimeout(() => {
            setShowPreview(false);
            setIsPlaying(false);
            onHoverChange?.(false);
        }, 600); // 600ms grace period
    };

    const handlePopupMouseEnter = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };

    const handlePopupMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setShowPreview(false);
            setIsPlaying(false);
            onHoverChange?.(false);
        }, 300);
    };

    return (
        <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className="flex items-center gap-2">
                <span ref={triggerRef} className="cursor-help underline decoration-dotted decoration-slate-600 underline-offset-4 truncate hover:text-blue-400 transition-colors">{exerciseName}</span>
                {coords && createPortal(
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                key="video-preview-popup"
                                initial={{ opacity: 0, scale: 0.95, y: "-96%" }}
                                animate={{ opacity: 1, scale: 1, y: "-100%" }}
                                exit={{ opacity: 0, scale: 0.95, y: "-96%" }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="fixed z-[9999]"
                                style={{
                                    top: coords.top + 4,
                                    left: coords.left,
                                }}
                                onMouseEnter={handlePopupMouseEnter}
                                onMouseLeave={handlePopupMouseLeave}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <div className="w-80 bg-[#121214] border border-white/10 rounded-xl shadow-2xl p-3 cursor-default ring-1 ring-white/5">
                                    <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative group/video">
                                        {isPlaying && videoId ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                                                title={exerciseName}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute inset-0"
                                            />
                                        ) : (
                                            <>
                                                {thumbnailUrl ? (
                                                    <img src={thumbnailUrl} alt={exerciseName} className="w-full h-full object-cover opacity-60 group-hover/video:opacity-100 transition-opacity duration-300" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Play className="w-8 h-8 text-white/50" />
                                                        <span className="text-[10px] text-slate-500">No preview available</span>
                                                    </div>
                                                )}
                                                {videoId && !isPlaying && (
                                                    <button
                                                        onClick={() => setIsPlaying(true)}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-black/40 transition-colors"
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] group-hover/video:scale-110 transition-transform">
                                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                                        </div>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-start justify-between gap-2 px-0.5">
                                        <div>
                                            <p className="text-xs font-bold text-white leading-tight mb-0.5">{exerciseName}</p>
                                            <p className="text-[10px] text-slate-400 leading-tight">
                                                {videoId ? "Click to play demonstration" : "No video available"}
                                            </p>
                                        </div>
                                        {videoId && <Zap className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </div>
    );
});
