import React, { useState, memo } from "react";
import { createPortal } from "react-dom";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise } from "@/lib/api";

export const ExerciseDropdown = memo(({
    isOpen,
    position,
    exercises,
    currentId,
    onSelect,
    onClose,
    innerRef
}: {
    isOpen: boolean,
    position: { top: number, left: number, width: number, placement?: 'top' | 'bottom' } | null,
    exercises: Exercise[],
    currentId: string,
    onSelect: (id: string) => void,
    onClose: () => void,
    innerRef: React.RefObject<HTMLDivElement | null>
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter exercises based on search
    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.main_muscle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen || !position) return null;

    return createPortal(
        <div
            className="fixed z-[9999] inset-0"
            onClick={onClose}
        >
            <div
                ref={innerRef}
                style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    transform: position.placement === 'top' ? 'translateY(-100%)' : 'none'
                }}
                className={cn(
                    "fixed bg-[#121214] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[300px] animate-in fade-in zoom-in-95 duration-200 ease-out ring-1 ring-white/5",
                    position.placement === 'top' ? "mb-1.5 origin-bottom" : "mt-1.5 origin-top"
                )}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-2 border-b border-white/5 sticky top-0 bg-[#121214]/95 backdrop-blur-sm z-10">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            className="w-full bg-white/5 border border-transparent rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:bg-white/10 focus:outline-none placeholder-slate-600 transition-colors"
                            autoFocus={false}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            ref={input => {
                                // Focus without scrolling
                                if (input) {
                                    requestAnimationFrame(() => {
                                        input.focus({ preventScroll: true });
                                    });
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                    {filteredExercises.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-500">No exercises found</div>
                    )}
                    {filteredExercises.map(ex => (
                        <button
                            key={ex.id}
                            className={cn(
                                "w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between hover:bg-white/5 transition-colors group/item border border-transparent",
                                currentId === ex.id && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            )}
                            onClick={() => onSelect(ex.id)}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className={cn(currentId === ex.id ? "text-blue-400 font-medium" : "text-slate-300 group-hover/item:text-white")}>
                                    {ex.name}
                                </span>
                                {(ex.main_muscle || ex.sub_muscle) && (
                                    <span className="text-[10px] text-slate-600 group-hover/item:text-slate-500">
                                        {[ex.main_muscle, ex.sub_muscle].filter(Boolean).filter(m => m !== "-").join(" • ")}
                                    </span>
                                )}
                            </div>
                            {currentId === ex.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
});
