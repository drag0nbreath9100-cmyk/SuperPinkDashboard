import { Edit2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditSaveButtonProps {
    isEditing: boolean;
    isLoading?: boolean;
    onEdit: () => void;
    onSave: () => void;
    label?: string; // Optional label override
    className?: string;
}

export function EditSaveButton({
    isEditing,
    isLoading = false,
    onEdit,
    onSave,
    label,
    className
}: EditSaveButtonProps) {
    return (
        <button
            onClick={() => isEditing ? onSave() : onEdit()}
            disabled={isLoading}
            className={cn(
                "p-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-xs font-bold uppercase shadow-sm hover:scale-105 active:scale-95",
                isEditing
                    ? "bg-secondary text-white hover:bg-secondary/80 shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-white/10"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent",
                className
            )}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                </>
            ) : isEditing ? (
                <>
                    <Check className="w-3 h-3" /> {label || "Save"}
                </>
            ) : (
                <>
                    <Edit2 className="w-3 h-3" /> {label || "Edit"}
                </>
            )}
        </button>
    );
}
