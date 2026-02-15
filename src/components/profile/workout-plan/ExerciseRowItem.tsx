import React, { memo } from "react";
import { Reorder } from "framer-motion";
import { GripVertical, ChevronDown, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Exercise } from "@/lib/api";
import { VideoPreview } from "./VideoPreview";
import { getMuscleBadge, REST_OPTIONS } from "./constants";

export const ExerciseRowItem = memo(({
    sessionIdx,
    exIdx,
    rowData,
    exercises,
    isDropdownOpen,
    isHovered,
    justGenerated,
    handleDropdownClick,
    updateExercise,
    onDelete,
    setHoveredRow,
    isEditing
}: {
    sessionIdx: number,
    exIdx: number,
    rowData: any,
    exercises: Exercise[],
    isDropdownOpen: boolean,
    isHovered: boolean,
    justGenerated: boolean,
    handleDropdownClick: (e: React.MouseEvent, sIdx: number, eIdx: number) => void,
    updateExercise: (sIdx: number, eIdx: number, field: string, value: any) => void,
    onDelete: (sIdx: number, eIdx: number) => void,
    setHoveredRow: (state: { sessionIdx: number, exIdx: number } | null) => void,
    isEditing: boolean
}) => {
    const isRowActive = (isDropdownOpen || isHovered) && isEditing;
    const selectedExercise = exercises.find(e => e.id === rowData.exerciseId);

    // If NOT editing, we show a simplified read-only view
    if (!isEditing) {
        return (
            <div className={cn(
                "grid grid-cols-[40px_30px_minmax(200px,2fr)_80px_80px_100px_115px_1.5fr_1fr_40px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0",
                isHovered && "bg-white/[0.04]"
            )}>
                <div className="text-slate-600 font-mono text-xs">{String(exIdx + 1).padStart(2, '0')}</div>

                {/* Spacer for Drag Handle */}
                <div />

                {/* Read Only Name */}
                <div className="text-left flex items-center gap-2">
                    {selectedExercise ? (
                        <VideoPreview
                            exerciseName={selectedExercise.name}
                            videoLink={selectedExercise.video_link}
                            onHoverChange={(hovered) => setHoveredRow(hovered ? { sessionIdx, exIdx } : null)}
                        />
                    ) : (
                        <span className="text-slate-600 italic">No exercise</span>
                    )}
                </div>

                <div className="text-center font-medium text-slate-300 text-sm">{rowData.sets || "-"}</div>
                <div className="text-center font-medium text-slate-300 text-sm">{rowData.reps || "-"}</div>
                <div className="text-center font-medium text-slate-300 text-sm">{rowData.weight || "-"}</div>
                <div className="text-center font-medium text-slate-300 text-sm">{rowData.rest || "-"}</div>

                {/* Muscle Badge (Centered) */}
                <div className="flex justify-center">
                    {rowData.mainMuscle && rowData.mainMuscle !== "-" && (
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm truncate max-w-[120px]", getMuscleBadge(rowData.mainMuscle))}>
                            {rowData.mainMuscle}
                        </span>
                    )}
                    {(!rowData.mainMuscle || rowData.mainMuscle === "-") && (
                        <span className="text-slate-700 text-xs">-</span>
                    )}
                </div>

                {/* Sub-Muscle Column (Centered) */}
                <div className="flex justify-center">
                    {rowData.subMuscle && rowData.subMuscle !== "-" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-slate-400 border border-white/5 truncate max-w-[100px]">
                            {rowData.subMuscle}
                        </span>
                    ) : (
                        <span className="text-slate-800 text-xs">-</span>
                    )}
                </div>

                {/* Spacer for delete button */}
                <div />
            </div>
        )
    }

    return (
        <Reorder.Item
            value={exIdx}
            initial={justGenerated ? { opacity: 0, rotateX: -90, y: 30 } : false}
            animate={justGenerated ? {
                opacity: 1,
                rotateX: 0,
                y: 0,
                filter: ["brightness(1) hue-rotate(0deg)", "brightness(2) hue-rotate(90deg)", "brightness(1) hue-rotate(0deg)"]
            } : false}
            transition={{
                duration: 0.4,
                delay: exIdx * 0.03,
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            className={cn(
                "grid grid-cols-[40px_30px_minmax(200px,2fr)_80px_80px_100px_115px_1.5fr_1fr_40px] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors relative group/row",
                isDropdownOpen && "z-20",
                isRowActive && "bg-white/[0.06] shadow-sm ring-1 ring-white/5"
            )}
        >
            <div className="text-slate-600 font-mono text-xs">{String(exIdx + 1).padStart(2, '0')}</div>

            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing text-slate-700 group-hover:text-slate-500 transition-colors flex justify-center">
                <GripVertical className="w-4 h-4" />
            </div>

            {/* Custom Dropdown Cell */}
            <div className="text-left relative">
                <div
                    className={cn(
                        "relative w-full cursor-pointer bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between hover:border-white/20 transition-all shadow-sm",
                        isDropdownOpen && "border-blue-500/50 ring-1 ring-blue-500/20 bg-blue-500/[0.02]"
                    )}
                    onClick={(e) => handleDropdownClick(e, sessionIdx, exIdx)}
                >
                    {selectedExercise ? (
                        <span className="text-sm text-white font-medium truncate flex-1 block">
                            <VideoPreview
                                exerciseName={selectedExercise.name}
                                videoLink={selectedExercise.video_link}
                                onHoverChange={(hovered) => setHoveredRow(hovered ? { sessionIdx, exIdx } : null)}
                            />
                        </span>
                    ) : (
                        <span className="text-sm text-slate-500 truncate flex-1 block">Select Exercise...</span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                </div>
            </div>

            <div>
                <div className="relative w-full">
                    <input type="text" placeholder="-" className={cn(
                        "relative z-10 w-full bg-transparent text-center border border-transparent hover:bg-white/5 focus:bg-white/5 rounded-xl py-1.5 focus:outline-none focus:border-blue-500/50 transition-all placeholder-slate-700 font-medium text-white",
                    )}
                        value={rowData.sets || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(sessionIdx, exIdx, 'sets', e.target.value)} />
                </div>
            </div>
            <div>
                <input type="text" placeholder="-" className={cn(
                    "w-full bg-transparent text-center border border-transparent hover:bg-white/5 focus:bg-white/5 rounded-xl py-1.5 focus:outline-none focus:border-blue-500/50 transition-all placeholder-slate-700 font-medium text-white",
                )}
                    value={rowData.reps || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(sessionIdx, exIdx, 'reps', e.target.value)} />
            </div>
            <div>
                <input type="text" placeholder="-" className={cn(
                    "w-full bg-transparent text-center border border-transparent hover:bg-white/5 focus:bg-white/5 rounded-lg py-1.5 focus:outline-none focus:border-blue-500/50 transition-all placeholder-slate-700 font-medium text-white",
                )}
                    value={rowData.weight || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(sessionIdx, exIdx, 'weight', e.target.value)} />
            </div>
            <div className="relative group/rest">
                <input
                    list={`rest-options-${sessionIdx}-${exIdx}`}
                    type="text"
                    className={cn(
                        "appearance-none w-full bg-transparent text-center border border-transparent hover:bg-white/5 focus:bg-white/5 rounded-xl py-1.5 px-0 focus:outline-none focus:border-blue-500/50 transition-all placeholder-slate-700 font-medium text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0",
                    )}
                    value={rowData.rest || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(sessionIdx, exIdx, 'rest', e.target.value)}
                />
                <datalist id={`rest-options-${sessionIdx}-${exIdx}`}>
                    {REST_OPTIONS.map(opt => <option key={opt} value={opt} />)}
                </datalist>
            </div>

            {/* Muscle Badge (Centered) */}
            <div className="flex justify-center">
                {rowData.mainMuscle && rowData.mainMuscle !== "-" && (
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm truncate max-w-[120px]", getMuscleBadge(rowData.mainMuscle))}>
                        {rowData.mainMuscle}
                    </span>
                )}
                {(!rowData.mainMuscle || rowData.mainMuscle === "-") && (
                    <span className="text-slate-700 text-xs">-</span>
                )}
            </div>

            {/* Sub-Muscle Column (Centered) */}
            <div className="flex justify-center">
                {rowData.subMuscle && rowData.subMuscle !== "-" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-slate-400 border border-white/5 truncate max-w-[100px]">
                        {rowData.subMuscle}
                    </span>
                ) : (
                    <span className="text-slate-800 text-xs">-</span>
                )}
            </div>

            <div className="text-right pr-2">
                <button
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    onClick={() => onDelete(sessionIdx, exIdx)}
                    title="Remove Exercise"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </Reorder.Item>
    );
});
