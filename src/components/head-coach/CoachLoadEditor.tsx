"use client";

import { NeonButton } from "@/components/ui/NeonButton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Coach } from "@/lib/api";
import { Settings } from "lucide-react";

interface CoachLoadEditorProps {
    coach: Coach;
    onUpdate: (newLoad: number) => void;
}

export function CoachLoadEditor({ coach, onUpdate }: CoachLoadEditorProps) {
    const [open, setOpen] = useState(false);
    const [maxLoad, setMaxLoad] = useState(coach.max_load || 30);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // TODO: Call actual API to update coach max_load
        onUpdate(maxLoad);
        setIsLoading(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <NeonButton variant="ghost" className="text-sm px-3 py-1.5 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Capacity
                </NeonButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0f172a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Edit Workload Capacity</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Set the maximum number of active clients {coach.name} can manage.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="max-load" className="text-right">
                            Max Clients
                        </Label>
                        <Input
                            id="max-load"
                            type="number"
                            value={maxLoad}
                            onChange={(e) => setMaxLoad(Number(e.target.value))}
                            className="col-span-3 bg-white/5 border-white/10 text-white"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <NeonButton variant="primary" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </NeonButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
