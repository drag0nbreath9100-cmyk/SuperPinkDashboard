"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Dumbbell, Zap, ChevronDown, Sparkles, Loader2, Bug, ExternalLink, FileSpreadsheet, Maximize2, Pencil, Check, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, Client, Exercise, CURRENT_COACH_ID } from "@/lib/api";
import { Reorder, motion, AnimatePresence } from "framer-motion";

import { PLANS } from "./workout-plan/constants";
import { PlanType } from "./workout-plan/types";
import { EtherealOverlay } from "./workout-plan/EtherealOverlay";
import { ExerciseDropdown } from "./workout-plan/ExerciseDropdown";
import { ExerciseRowItem } from "./workout-plan/ExerciseRowItem";
import { SheetSavingOverlay } from "./workout-plan/SheetSavingOverlay";
import { HeadCoachFeedbackComponent } from "./HeadCoachFeedback";
import { DeleteConfirmationModal } from "./workout-plan/DeleteConfirmationModal";

const extractSheetId = (url: string) => {
    const match = url.match(/\/d\/(.+?)(\/|$)|id=(.+?)(\&|$)/);
    return match ? (match[1] || match[3]) : null;
};

export function WorkoutPlanTab({
    clientId,
    client,
    onInteractionStateChange
}: {
    clientId: string,
    client: Client,
    onInteractionStateChange?: (isActive: boolean) => void
}) {
    const [selectedPlan, setSelectedPlan] = useState<string>("4D_BALANCED");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exerciseType, setExerciseType] = useState<'gym' | 'home'>('gym'); // New state for exercise type
    const [planData, setPlanData] = useState<Record<number, Record<number, any>>>({});
    const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({ 0: true });

    // Logging state
    const [debugLog, setDebugLog] = useState<string[]>([]);

    // Order state for drag and drop: sessionIdx -> array of exercise Indices in order
    const [sessionOrders, setSessionOrders] = useState<Record<number, number[]>>({});

    // Hover state for rows (to persist background when portal is open)
    const [hoveredRow, setHoveredRow] = useState<{ sessionIdx: number, exIdx: number } | null>(null);

    // Custom Dropdown State
    const [openDropdown, setOpenDropdown] = useState<{ sessionIdx: number, exIdx: number } | null>(null);
    const [dropdownPos, setDropdownPos] = useState<{ top: number, left: number, width: number, placement?: 'top' | 'bottom' } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Edit Mode State
    const [saveStatus, setSaveStatus] = useState("Saving to Sheet"); // Dynamic status
    const [sheetLink, setSheetLink] = useState<string | null>(null);
    const [iframeLoading, setIframeLoading] = useState(false); // New loading state for iframe
    const [justGenerated, setJustGenerated] = useState(false); // Trigger input glow
    const [showDebug, setShowDebug] = useState(false);
    const [debugJson, setDebugJson] = useState("");
    const [sheetExpanded, setSheetExpanded] = useState(true); // Sheet view collapse state
    const [sheetFullscreen, setSheetFullscreen] = useState(false); // Fullscreen mode

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Check if client already has a plan
    const [hasPlan, setHasPlan] = useState(!!(client.workout_plan || client.workout_plan_link));
    const [dataLoaded, setDataLoaded] = useState(false); // To prevent re-loading

    useEffect(() => {
        setHasPlan(!!(client.workout_plan || client.workout_plan_link));
    }, [client]);

    // Generic Plan Loader helper
    const loadPlanFromData = useCallback((rows: any[], targetPlanId?: string) => {
        if (!rows || rows.length === 0) return;

        // Try to determine plan from first row or heuristics
        const planName = rows[0].PlanName;
        let finalPlanId = targetPlanId;

        if (!finalPlanId) {
            // Find matching plan ID
            const matchedPlan = PLANS.find(p => p.description.startsWith(planName) || p.title.includes(planName));
            finalPlanId = matchedPlan ? matchedPlan.id : "4D_BALANCED"; // Fallback
        }

        setSelectedPlan(finalPlanId);

        // Populate Plan Data using targetPlanId
        const targetPlan = PLANS.find(p => p.id === finalPlanId);
        if (targetPlan) {
            const newPlanData: Record<number, Record<number, any>> = {};
            const normalize = (str: string) => str?.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

            // Helper to exact matched logic
            const findMatch = (targetName: string) => {
                const nTarget = normalize(targetName);
                let match = exercises.find(e => normalize(e.name) === nTarget);
                if (match) return match;
                const aliases: Record<string, string> = { 'bar': 'barbell', 'db': 'dumbbell', 'bb': 'barbell', 'rdl': 'romanian deadlift' };
                let expandedTarget = targetName.toLowerCase();
                Object.keys(aliases).forEach(alias => {
                    expandedTarget = expandedTarget.replace(new RegExp(`\\b${alias}\\b`, 'g'), aliases[alias]);
                });
                return exercises.find(e => normalize(e.name) === normalize(expandedTarget)) || null;
            };

            rows.forEach((row: any) => {
                const dayName = row.day?.replace(/_/g, ' ');
                const sessionIdx = targetPlan.sessions.findIndex(s => s.name.toLowerCase() === dayName?.toLowerCase());
                if (sessionIdx !== -1) {
                    if (!newPlanData[sessionIdx]) newPlanData[sessionIdx] = {};
                    const exIdx = (row.order || 1) - 1;
                    const exerciseName = row.Execrscices;
                    const matchedExercise = findMatch(exerciseName);
                    // Populate even if not matched logic (or match)
                    newPlanData[sessionIdx][exIdx] = {
                        exerciseId: matchedExercise?.id || "",
                        sets: row.sets || "",
                        reps: row.Reps || "",
                        rest: row.Rest || "",
                        weight: "",
                        mainMuscle: matchedExercise?.main_muscle || row.Muscle || "-",
                        subMuscle: matchedExercise?.sub_muscle || row["Sec-Muscle"] || "-"
                    };
                }
            });

            setPlanData(newPlanData);

            // Set expanded appropriately
            const initialExpanded: Record<number, boolean> = {};
            targetPlan.sessions.forEach((_, idx) => initialExpanded[idx] = (idx === 0));
            setExpandedSessions(initialExpanded);

            // Sync sessionOrders with loaded data
            const newOrders: Record<number, number[]> = {};
            Object.keys(newPlanData).forEach(sessionKey => {
                const sIdx = Number(sessionKey);
                // Get all exercise indices for this session, sorted
                const indices = Object.keys(newPlanData[sIdx]).map(Number).sort((a, b) => a - b);
                newOrders[sIdx] = indices;
            });
            setSessionOrders(newOrders);

            console.log("Loaded persisted plan:", finalPlanId, newPlanData, newOrders);
        }
    }, [exercises]);

    // Check for persisted plan and load it
    useEffect(() => {
        if (dataLoaded || exercises.length === 0) return;

        if (client.workout_plan && client.workout_plan.WorkoutPlan) {
            const rows = client.workout_plan.WorkoutPlan;
            if (rows.length > 0) {
                loadPlanFromData(rows);
                setSheetLink(client.workout_plan_link || null);
            }
            setDataLoaded(true);
        }
    }, [client.workout_plan, client.workout_plan_link, exercises, dataLoaded, loadPlanFromData]);

    // Notify parent when interaction state changes (dropdown open or row hovered)
    useEffect(() => {
        const isActive = !!openDropdown || !!hoveredRow;
        onInteractionStateChange?.(isActive);
    }, [openDropdown, hoveredRow, onInteractionStateChange]);

    useEffect(() => {
        const fetchExercises = async () => {
            const data = await api.getExercises(exerciseType);
            setExercises(data || []);
        };
        fetchExercises();
    }, [exerciseType]);

    const handlePlanSelect = (planId: PlanType) => {
        if (planId === selectedPlan) return;

        setSelectedPlan(planId);
        setPlanData({});
        const plan = PLANS.find(p => p.id === planId);
        if (plan) {
            const initialExpanded: Record<number, boolean> = {};
            const initialOrders: Record<number, number[]> = {};
            plan.sessions.forEach((session, idx) => {
                initialExpanded[idx] = true;
                initialOrders[idx] = Array.from({ length: session.exerciseCount }).map((_, i) => i);
            });
            setExpandedSessions(initialExpanded);
            setSessionOrders(initialOrders);
        }
    };

    const toggleSession = (idx: number) => {
        setExpandedSessions(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleDropdownClick = useCallback((e: React.MouseEvent, sessionIdx: number, exIdx: number) => {
        e.stopPropagation();

        const isOpen = openDropdown?.sessionIdx === sessionIdx && openDropdown?.exIdx === exIdx;

        if (isOpen) {
            setDropdownPos(null);
            setOpenDropdown(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 300;
            const openUpwards = spaceBelow < dropdownHeight && rect.top > spaceBelow;

            setDropdownPos({
                top: openUpwards ? rect.top : rect.bottom,
                left: rect.left,
                width: 350,
                placement: openUpwards ? 'top' : 'bottom'
            });
            setOpenDropdown({ sessionIdx, exIdx });
        }
    }, [openDropdown]);

    // Add Reorder state handling
    const handleReorder = useCallback((sessionIdx: number, newOrder: number[]) => {
        setSessionOrders(prev => ({
            ...prev,
            [sessionIdx]: newOrder
        }));
    }, []);

    const updateExercise = useCallback((sessionIdx: number, exerciseIndex: number, field: string, value: any) => {
        setPlanData(prev => {
            const currentSession = prev[sessionIdx] || {};
            const currentRow = currentSession[exerciseIndex] || {};
            const newData = { ...currentRow, [field]: value };

            // If updating exerciseId, populate default values
            if (field === 'exerciseId') {
                const selectedExercise = exercises.find(e => e.id === value);
                if (selectedExercise) {
                    newData.reps = selectedExercise.default_reps || selectedExercise.reps || "12-15";
                    newData.sets = selectedExercise.default_sets?.toString() || selectedExercise.sets?.toString() || "3";
                    newData.rest = selectedExercise.default_rest || selectedExercise.rest || "60s";
                    newData.weight = selectedExercise.default_weight || "";
                    newData.mainMuscle = selectedExercise.main_muscle || "-";
                    newData.subMuscle = selectedExercise.sub_muscle || "-";
                }
            }

            return {
                ...prev,
                [sessionIdx]: {
                    ...currentSession,
                    [exerciseIndex]: newData
                }
            };
        });
        if (field === 'exerciseId') setOpenDropdown(null);
    }, [exercises]);

    const handleDeleteExercise = useCallback((sessionIdx: number, exIdx: number) => {
        setSessionOrders(prev => {
            let currentOrder = prev[sessionIdx];

            // If order doesn't exist yet, initialize from default plan structure
            if (!currentOrder) {
                const plan = PLANS.find(p => p.id === selectedPlan);
                if (plan && plan.sessions[sessionIdx]) {
                    currentOrder = Array.from({ length: plan.sessions[sessionIdx].exerciseCount }).map((_, i) => i);
                } else {
                    currentOrder = [];
                }
            }

            return {
                ...prev,
                [sessionIdx]: currentOrder.filter(idx => idx !== exIdx)
            };
        });

        // Optional: Clean up data, though not strictly necessary if we just hide it via order
        setPlanData(prev => {
            const newData = { ...prev };
            if (newData[sessionIdx]) {
                delete newData[sessionIdx][exIdx];
            }
            return newData;
        });
    }, [selectedPlan]);

    const handleAddRow = useCallback((sessionIdx: number) => {
        setSessionOrders(prev => {
            let currentOrder = prev[sessionIdx];

            // If order doesn't exist yet, initialize from default plan structure
            if (!currentOrder) {
                const plan = PLANS.find(p => p.id === selectedPlan);
                if (plan && plan.sessions[sessionIdx]) {
                    currentOrder = Array.from({ length: plan.sessions[sessionIdx].exerciseCount }).map((_, i) => i);
                } else {
                    currentOrder = [];
                }
            }

            // Find max index to ensure uniqueness
            const maxIdx = currentOrder.length > 0 ? Math.max(...currentOrder) : -1;
            // Also check planData keys for that session to be safe, though orders should track it
            const existingKeys = Object.keys(planData[sessionIdx] || {}).map(Number);
            const maxDataIdx = existingKeys.length > 0 ? Math.max(...existingKeys) : -1;

            const newIdx = Math.max(maxIdx, maxDataIdx) + 1;

            return {
                ...prev,
                [sessionIdx]: [...currentOrder, newIdx]
            };
        });
    }, [planData, selectedPlan]);

    const currentPlan = PLANS.find(p => p.id === selectedPlan);

    const handleSavePlan = async (isUpdate: boolean = false) => {
        if (!currentPlan) return;

        const workoutPlan: any[] = [];

        currentPlan.sessions.forEach((session, sessionIdx) => {
            const dayName = session.name.replace(/\s+/g, '_');
            const planName = currentPlan.description.split(' - ')[0];
            const currentOrder = sessionOrders[sessionIdx] || Array.from({ length: session.exerciseCount }).map((_, i) => i);

            currentOrder.forEach((exIdx, orderIdx) => {
                const rowData = planData[sessionIdx]?.[exIdx] || {};
                const selectedExercise = exercises.find(e => e.id === rowData.exerciseId);

                workoutPlan.push({
                    "PlanName": planName,
                    "day": dayName,
                    "order": orderIdx + 1, // Visual order (1-based)
                    "Execrscices": selectedExercise?.name || "",
                    "sets": rowData.sets || "",
                    "Reps": rowData.reps || "",
                    "Rest": rowData.rest || "",
                    "Muscle": selectedExercise?.main_muscle || "-",
                    "Sec-Muscle": selectedExercise?.sub_muscle || "-",
                    "Warmup-Sets": selectedExercise?.warmup_sets || "",
                    "Video": selectedExercise?.video_link || "",
                    "Hints": selectedExercise?.note || "",
                    "English_Hints": selectedExercise?.english_note || ""
                });
            });
        });

        const missingFields: string[] = [];
        workoutPlan.forEach((ex, i) => {
            if (!ex.Execrscices || !ex.sets || !ex.Reps || !ex.Rest) {
                missingFields.push(`Row ${i + 1}: ${!ex.Execrscices ? 'Exercise Name' : ''} ${!ex.sets ? 'Sets' : ''} ${!ex.Reps ? 'Reps' : ''} ${!ex.Rest ? 'Rest' : ''}`);
            }
        });

        if (missingFields.length > 0) {
            alert(`Please fill in all fields before saving:\n${missingFields.slice(0, 5).join('\n')}${missingFields.length > 5 ? '\n...' : ''}`);
            return;
        }

        const currentSheetLink = sheetLink || client.workout_plan_link;

        // Calculate Day Summary
        const daySummary = currentPlan.sessions.map((session, sessionIdx) => {
            const currentOrder = sessionOrders[sessionIdx] || [];
            return {
                "Day": session.name,
                "Exercises": currentOrder.length
            };
        });

        const finalPayload: any = {
            "ClientInfo": client,
            "WorkoutPlan": workoutPlan,
            "DaySummary": daySummary,
            "order": 6 // Requested fixed order field for the payload
        };

        if (isUpdate && currentSheetLink) {
            finalPayload["DriveInfo"] = {
                "Link": currentSheetLink,
                "FileId": extractSheetId(currentSheetLink)
            };
        }

        setExpandedSessions({}); // Collapse all days immediately
        setIsSaving(true);
        setSaveStatus("Connecting...");
        setSheetLink(null); // Reset previous link

        try {
            console.log("Saving Plan Payload:", finalPayload);

            // Timeout to change message if it takes a while
            const messageTimer = setTimeout(() => setSaveStatus("Generating Spreadsheet..."), 3000);

            // Determine webhook URL based on update status
            const webhookUrl = isUpdate
                ? "https://itsDrvgon-n8n-free.hf.space/webhook-test/workout-plan-editor"
                : "https://itsDrvgon-n8n-free.hf.space/webhook/workout-plan-generator";

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload)
            });

            clearTimeout(messageTimer);

            if (response.ok) {
                setSaveStatus("Finalizing...");
                let data = await response.json();
                console.log("Webhook Response:", data);

                // Handle Array response (n8n often returns arrays)
                if (Array.isArray(data)) {
                    data = data.length > 0 ? data[0] : {};
                }

                // Try multiple common variations
                const link = data.SheetLink || data.sheetLink || data.link || data.url || data.Sheet_Link || data.sheet_link || data.Sheet_URL || data.sheet_url;

                if (link) {
                    setSheetLink(link);
                    setIframeLoading(true);

                    // Save to Database
                    try {
                        const now = new Date();
                        const durationDays = client.subscription_total_days || 30;
                        const endDate = new Date(now);
                        endDate.setDate(now.getDate() + durationDays);

                        // Determine if we should activate the client (new_lead -> active)
                        const shouldActivate = client.status === 'new_lead' || client.status === 'pending' || !client.status;

                        await api.updateClient(Number(client.id), {
                            workout_plan: finalPayload,
                            workout_plan_link: link,
                            workout_plan_created_at: client.workout_plan_created_at || now.toISOString(),
                            // Set subscription dates from workout plan completion
                            subscription_start_date: now.toISOString().split('T')[0],
                            subscription_end_date: endDate.toISOString().split('T')[0],
                            // Auto-transition to active if new_lead/pending
                            ...(shouldActivate && {
                                status: 'active' as const,
                                active_status_at: now.toISOString()
                            })
                        });
                        setHasPlan(true); // Update state to show Edit button / hide Save button
                    } catch (dbError) {
                        console.error("Failed to save to DB:", dbError);
                        // We don't block the user if DB save fails but Sheet succeeded, effectively treating Sheet as valid save
                    }

                    // We do NOT set isSaving(false) here, we wait for iframe onLoad

                    // Safety fallback: ensure overlay closes even if iframe onLoad hangs
                    setTimeout(() => {
                        setIsSaving(false);
                        setIframeLoading(false);
                    }, 8000);
                } else {
                    console.error("Missing SheetLink in response:", data);
                    const keys = typeof data === 'object' ? Object.keys(data).join(", ") : "Not an object";
                    alert(`Plan saved, but could not find 'SheetLink' in response.\nKeys received: ${keys}`);
                    setIsSaving(false);
                }
            } else {
                alert("Failed to save plan: Server responded with error.");
                setIsSaving(false);
            }
        } catch (error) {
            console.error("Error saving plan:", error);
            alert("Error saving plan. Please check connection.");
            setIsSaving(false);
        }
    };

    const confirmDeletePlan = async () => {
        setIsDeleting(true);

        // 1. Backup current data for Undo
        const backupPlan = client.workout_plan;
        const backupLink = client.workout_plan_link;
        const backupDate = client.workout_plan_created_at;

        // 2. Optimistic Update
        setHasPlan(false);
        setSheetLink(null);
        setPlanData({});
        setIsDeleteModalOpen(false); // Close modal immediately for snappy feel

        // 3. API Update to Delete
        try {
            await api.updateClient(Number(client.id), {
                workout_plan: null,
                workout_plan_link: null,
                workout_plan_created_at: null
            });

            setIsDeleting(false);

            // 4. Show Fancy Glass Toast with Undo
            toast("Plan deleted", {
                description: "The workout plan has been removed.",
                action: {
                    label: "Undo",
                    onClick: async () => {
                        // Restoration Logic
                        setHasPlan(true);
                        setSheetLink(backupLink || null);

                        if (backupPlan && backupPlan.WorkoutPlan) {
                            loadPlanFromData(backupPlan.WorkoutPlan);
                        }

                        await api.updateClient(Number(client.id), {
                            workout_plan: backupPlan,
                            workout_plan_link: backupLink,
                            workout_plan_created_at: backupDate
                        });
                        toast.success("Plan restored successfully");
                    }
                },
                style: {
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: '16px',
                    padding: '16px',
                },
                className: "glass-toast",
                icon: <Trash2 className="w-5 h-5 text-red-400" />
            });

        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete plan");
            // Revert optimistic update on failure
            setHasPlan(true);
            setIsDeleting(false);
        }
    };

    const processGenerativePlan = (data: any) => {
        const logs: string[] = [];
        const log = (msg: string) => logs.push(msg);
        const rows = Array.isArray(data) ? data : [data];

        setPlanData({});

        setTimeout(() => {
            log(`Processing ${rows.length} items...`);
            const newPlanData: Record<number, Record<number, any>> = {};
            const normalize = (str: string) => str?.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

            const findMatch = (targetName: string) => {
                const nTarget = normalize(targetName);
                let match = exercises.find(e => normalize(e.name) === nTarget);
                if (match) return match;

                const aliases: Record<string, string> = {
                    'bar': 'barbell',
                    'db': 'dumbbell',
                    'bb': 'barbell',
                    'rdl': 'romanian deadlift'
                };

                let expandedTarget = targetName.toLowerCase();
                Object.keys(aliases).forEach(alias => {
                    const regex = new RegExp(`\\b${alias}\\b`, 'g');
                    expandedTarget = expandedTarget.replace(regex, aliases[alias]);
                });
                const nExpandedTarget = normalize(expandedTarget);

                match = exercises.find(e => normalize(e.name) === nExpandedTarget);
                if (match) return match;

                return null;
            };

            if (rows.length > 0) {
                rows.forEach((item: any, i) => {
                    const row = item.json || item;
                    if (!row) {
                        log(`Row ${i}: Invalid row structure`);
                        return;
                    }

                    const dayName = row.day?.replace(/_/g, ' ');
                    const sessionIdx = currentPlan?.sessions.findIndex(s => s.name.toLowerCase() === dayName?.toLowerCase());

                    if (sessionIdx === undefined || sessionIdx === -1) {
                        log(`Row ${i}: Session '${dayName}' not found in plan '${selectedPlan}'`);
                        return;
                    }

                    const exerciseName = row.Execrscices;
                    if (!exerciseName) {
                        log(`Row ${i}: No exercise name found`);
                        return;
                    }

                    const matchedExercise = findMatch(exerciseName);

                    if (matchedExercise) {
                        log(`Row ${i}: Matched '${exerciseName}' -> '${matchedExercise.name}'`);
                        if (!newPlanData[sessionIdx]) newPlanData[sessionIdx] = {};
                        const exIdx = (row.order || 1) - 1;

                        newPlanData[sessionIdx][exIdx] = {
                            exerciseId: matchedExercise.id,
                            sets: row.sets?.toString() || matchedExercise.default_sets?.toString() || "3",
                            reps: row.Reps || matchedExercise.default_reps || "12-15",
                            rest: row.Rest || matchedExercise.default_rest || "60s",
                            weight: "",
                            mainMuscle: matchedExercise.main_muscle || "-",
                            subMuscle: matchedExercise.sub_muscle || "-"
                        };
                    } else {
                        log(`Row ${i}: No match for '${exerciseName}'`);
                    }
                });

                setPlanData(prev => {
                    const merged = { ...prev };
                    Object.keys(newPlanData).forEach(sKey => {
                        const sIdx = Number(sKey);
                        if (!merged[sIdx]) merged[sIdx] = {};
                        Object.keys(newPlanData[sIdx]).forEach(eKey => {
                            const eIdx = Number(eKey);
                            merged[sIdx][eIdx] = newPlanData[sIdx][eIdx];
                        });
                    });

                    return merged;
                });

                // Update sessionOrders for the new items
                setSessionOrders(prevOrders => {
                    const newOrders = { ...prevOrders };
                    Object.keys(newPlanData).forEach(sKey => {
                        const sIdx = Number(sKey);
                        const newIndices = Object.keys(newPlanData[sIdx]).map(Number);
                        const currentIndices = newOrders[sIdx] || [];
                        // add only unique new indices
                        const combined = Array.from(new Set([...currentIndices, ...newIndices])).sort((a, b) => a - b);
                        newOrders[sIdx] = combined;
                    });
                    return newOrders;
                });

                setExpandedSessions(prev => {
                    const allExpanded: Record<number, boolean> = {};
                    currentPlan?.sessions.forEach((_, idx) => allExpanded[idx] = true);
                    return allExpanded;
                });

                setJustGenerated(true);
                setTimeout(() => setJustGenerated(false), 3000);
                setDebugLog(logs);
            } else {
                alert("No valid rows data found.");
            }
        }, 100);
    };

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        setJustGenerated(false);
        setExpandedSessions({});

        const payload = {
            "Client Name": client.full_name,
            "Client Goal": client.main_goal_text,
            "Training Days": client.training_frequency_requested,
            "Aesthetic Focus": client.aesthetic_focus,
            "Injuries": client.injuries_history,
            "Client Hated workouts": client.hated_workouts,
            "Strategy": client.final_strategy
        };

        try {
            const response = await fetch("/api/ai-generator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                processGenerativePlan(data);
            } else {
                const errText = await response.text();
                console.error("AI Error:", errText);
                alert(`Failed to generate AI plan. Status: ${response.status}. Error: ${errText}`);
            }
        } catch (error) {
            console.error("Error generating AI plan:", error);
            alert("Error generating AI plan.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleManualDebug = () => {
        try {
            const data = JSON.parse(debugJson);
            processGenerativePlan(data);
        } catch (e: any) {
            console.error("Debug Error:", e);
            alert(`Error: ${e.message}`);
        }
    };

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [templateDesc, setTemplateDesc] = useState("");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    // Load Template State
    const [isLoadTemplateModalOpen, setIsLoadTemplateModalOpen] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    // Fetch templates when opening load modal
    useEffect(() => {
        if (isLoadTemplateModalOpen) {
            const fetchTemplates = async () => {
                setIsLoadingTemplates(true);
                const data = await api.getWorkoutTemplates();
                setTemplates(data || []);
                setIsLoadingTemplates(false);
            };
            fetchTemplates();
        }
    }, [isLoadTemplateModalOpen]);

    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            toast.error("Please enter a template name");
            return;
        }

        setIsSavingTemplate(true);
        // Collapse all sessions for better UI during save/load
        setExpandedSessions({});

        try {
            // Construct the plan data similar to how we save to sheet but cleaner
            const workoutPlan: any[] = [];
            currentPlan?.sessions.forEach((session, sessionIdx) => {
                const dayName = session.name.replace(/\s+/g, '_');
                const currentOrder = sessionOrders[sessionIdx] || Array.from({ length: session.exerciseCount }).map((_, i) => i);

                currentOrder.forEach((exIdx, orderIdx) => {
                    const rowData = planData[sessionIdx]?.[exIdx] || {};
                    const selectedExercise = exercises.find(e => e.id === rowData.exerciseId);

                    if (selectedExercise) {
                        workoutPlan.push({
                            "PlanName": currentPlan.description.split(' - ')[0],
                            "day": dayName,
                            "order": orderIdx + 1,
                            "Execrscices": selectedExercise.name,
                            "sets": rowData.sets,
                            "Reps": rowData.reps,
                            "Rest": rowData.rest,
                            "Muscle": selectedExercise.main_muscle,
                            "Sec-Muscle": selectedExercise.sub_muscle,
                            "Video": selectedExercise.video_link,
                            "Hints": selectedExercise.note,
                            "English_Hints": selectedExercise.english_note
                        });
                    }
                });
            });

            const templatePayload = {
                name: templateName,
                description: templateDesc,
                plan_data: { WorkoutPlan: workoutPlan },
                coach_id: CURRENT_COACH_ID
            };

            const result = await api.createWorkoutTemplate(templatePayload);

            if (result) {
                toast.success("Template saved successfully");
                setIsTemplateModalOpen(false);
                setTemplateName("");
                setTemplateDesc("");
            } else {
                toast.error("Failed to save template");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error saving template");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleLoadTemplate = (template: any) => {
        if (!template.plan_data?.WorkoutPlan) {
            toast.error("Invalid template data");
            return;
        }

        loadPlanFromData(template.plan_data.WorkoutPlan);
        toast.success(`Loaded template: ${template.name}`);
        setIsLoadTemplateModalOpen(false);

        // Collapse sessions for a clean start
        setExpandedSessions({});
    };



    return (
        <div className="h-full space-y-8 animate-in fade-in duration-500 pb-20 relative min-h-screen">
            <EtherealOverlay isVisible={isGenerating} exercises={exercises} />
            <SheetSavingOverlay isVisible={isSaving} exercises={exercises} status={saveStatus} />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeletePlan}
                isDeleting={isDeleting}
            />

            {/* Template Save Modal - Simple Inline Implementation for speed */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-white">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold">Save as Template</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Template Name</label>
                                <input
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="e.g. Hypertrophy Phase 1"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
                                <textarea
                                    value={templateDesc}
                                    onChange={(e) => setTemplateDesc(e.target.value)}
                                    placeholder="Brief description of the plan..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsTemplateModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                disabled={isSavingTemplate}
                                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load Template Modal */}
            {isLoadTemplateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-white">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                                Load Template
                            </h3>
                            <button
                                onClick={() => setIsLoadTemplateModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronDown className="w-5 h-5 rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {isLoadingTemplates ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    No templates found. Save a plan as a template to see it here.
                                </div>
                            ) : (
                                templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="group bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer flex justify-between items-center"
                                        onClick={() => handleLoadTemplate(template)}
                                    >
                                        <div>
                                            <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                {template.name}
                                            </h4>
                                            {template.description && (
                                                <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                                                    {template.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-2">
                                                Created: {new Date(template.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            Load →
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-white/10">
                            <button
                                onClick={() => setIsLoadTemplateModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key="main-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100, transition: { duration: 0.5 } }} // Drop down effect
                    className="space-y-8"
                >
                    {/* Head Coach Feedback Section */}
                    <div className="mb-8">
                        <HeadCoachFeedbackComponent clientId={clientId} />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Dumbbell className="w-6 h-6 text-blue-400" />
                                <span className="bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
                                    Workout Plan Generator
                                </span>
                            </h2>
                            <p className="text-slate-400">Select a template to generate a weekly schedule.</p>
                        </div>

                        {/* Exercise Type Toggle */}
                        <div className="flex items-center gap-4">
                            {/* Save Template Button - Only Show if Plan Exists or Generating */}
                            {(Object.keys(planData).length > 0 || hasPlan) && (
                                <button
                                    onClick={() => {
                                        setExpandedSessions({});
                                        setIsTemplateModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    Save as Template
                                </button>
                            )}

                            {/* Load Template Button */}
                            <button
                                onClick={() => setIsLoadTemplateModalOpen(true)}
                                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Load Template
                            </button>

                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto">
                                <button
                                    onClick={() => setExerciseType('gym')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        exerciseType === 'gym'
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Dumbbell className="w-4 h-4" />
                                    Gym
                                </button>
                                <button
                                    onClick={() => setExerciseType('home')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        exerciseType === 'home'
                                            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Maximize2 className="w-4 h-4" />
                                    Home
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Plan Selection Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {PLANS.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => handlePlanSelect(plan.id)}
                                className={cn(
                                    "relative flex flex-col items-start p-4 rounded-xl border transition-all duration-300 h-full text-left group overflow-hidden will-change-transform backface-visibility-hidden",
                                    "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20",
                                    selectedPlan === plan.id && !(client.recommended_plan && plan.description.includes(client.recommended_plan)) &&
                                    "bg-blue-600/10 border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.3)] scale-[1.02]",
                                    client.recommended_plan && plan.description.includes(client.recommended_plan) && [
                                        "scale-[1.05] z-10",
                                        selectedPlan !== plan.id && "bg-[#1A0B2E]/80 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:border-purple-500/60",
                                        selectedPlan === plan.id && "bg-[#251040] border-purple-400 ring-1 ring-purple-300/50 shadow-[0_0_60px_rgba(168,85,247,0.5)]"
                                    ]
                                )}
                            >
                                {client.recommended_plan && plan.description.includes(client.recommended_plan) && (
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                        <div className={cn(
                                            "absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-purple-500/10 to-transparent animate-spin-slow-reverse",
                                            selectedPlan === plan.id ? "opacity-100" : "opacity-30"
                                        )} />
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 animate-shimmer-fast" style={{ backgroundSize: '200% 100%' }} />
                                    </div>
                                )}

                                {client.recommended_plan && plan.description.includes(client.recommended_plan) && (
                                    <>
                                        <div className="absolute -top-1 -right-1 w-20 h-20 bg-purple-600/20 blur-2xl rounded-full pointer-events-none" />
                                        <div className="absolute top-2.5 right-2.5 px-2 py-[2px] rounded-full bg-purple-600 text-white text-[9px] uppercase font-bold tracking-wider shadow-lg shadow-purple-900/50 z-20 flex items-center gap-1 leading-none">
                                            <Sparkles className="w-3 h-3 fill-white/50" />
                                            Recommended
                                        </div>
                                    </>
                                )}

                                {selectedPlan === plan.id && (
                                    <div className="absolute top-0 right-0 p-2 z-10">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]",
                                            client.recommended_plan && plan.description.includes(client.recommended_plan)
                                                ? "bg-purple-200 shadow-purple-200 mr-28 mt-1"
                                                : "bg-blue-400 shadow-blue-500"
                                        )} style={client.recommended_plan && plan.description.includes(client.recommended_plan) ? { display: 'none' } : {}} />
                                    </div>
                                )}

                                <div className="relative z-10 w-full">
                                    <h3 className={cn(
                                        "font-bold text-sm mb-1 transition-colors",
                                        selectedPlan === plan.id
                                            ? (client.recommended_plan && plan.description.includes(client.recommended_plan) ? "text-purple-300" : "text-blue-400")
                                            : "text-white group-hover:text-blue-200"
                                    )}>
                                        {plan.title.split('+')[0].trim()}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                        {plan.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {currentPlan && (
                        <div className="relative space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                {currentPlan.title}
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-normal">
                                    {currentPlan.sessions.length} Sessions
                                </span>
                            </h3>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAiGenerate}
                                    disabled={isGenerating}
                                    className="relative group px-5 py-2.5 rounded-xl font-medium text-white bg-black border border-white/10 overflow-hidden shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed will-change-transform"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 animate-bg-pan translate-z-0" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer translate-z-0" />
                                    <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all duration-500" />
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500 translate-z-0" />

                                    <span className="relative flex items-center gap-2 z-10">
                                        {isGenerating ? (
                                            <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 text-purple-300" />
                                        )}
                                        <span className="bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all font-semibold tracking-wide text-sm">
                                            {isGenerating ? "GENERATING..." : "AI GENERATOR"}
                                        </span>
                                    </span>
                                </button>
                                <div className="flex-1" /> {/* Spacer */}
                                {!hasPlan && (
                                    <button
                                        onClick={() => handleSavePlan(false)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Zap className="w-4 h-4 fill-current" />
                                        Save Plan
                                    </button>
                                )}
                                {hasPlan && (
                                    <button
                                        onClick={() => {
                                            if (isEditing) {
                                                handleSavePlan(true);
                                                setIsEditing(false);
                                            } else {
                                                setIsEditing(true);
                                            }
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                                            isEditing
                                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
                                                : "bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="relative">
                                            <div className={cn("absolute inset-0 bg-amber-500 blur-sm opacity-0 transition-opacity", isEditing && "opacity-50")} />
                                            {isEditing ? <Check className="w-4 h-4 relative z-10" /> : <Pencil className="w-4 h-4 relative z-10" />}
                                        </div>
                                        <span className="relative z-10">{isEditing ? "Done Editing" : "Edit Plan"}</span>
                                    </button>
                                )}
                                {hasPlan && (
                                    <button
                                        onClick={() => {
                                            setExpandedSessions({});
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors border border-red-500/20"
                                        title="Delete Plan"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDebug(!showDebug)}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
                                >
                                    <Bug className="w-4 h-4" />
                                </button>
                            </div>

                            {showDebug && (
                                <div className="bg-[#121214] border border-white/10 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-sm font-medium text-slate-300">Manual JSON Debug</h4>
                                    <textarea
                                        className="w-full h-32 bg-black/50 border border-white/10 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500/50"
                                        placeholder="Paste JSON response here..."
                                        value={debugJson}
                                        onChange={(e) => setDebugJson(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleManualDebug}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                                        >
                                            Simulate Generation
                                        </button>
                                    </div>
                                    {debugLog.length > 0 && (
                                        <div className="bg-black/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                            <h5 className="text-[10px] uppercase text-slate-500 font-bold mb-2">Processing Logs</h5>
                                            <div className="space-y-1">
                                                {debugLog.map((log, i) => (
                                                    <div key={i} className="text-[10px] font-mono text-slate-400 border-b border-white/5 pb-1 last:border-0">
                                                        {log}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                {currentPlan.sessions.map((session, sessionIdx) => {
                                    const isExpanded = expandedSessions[sessionIdx];
                                    return (
                                        <motion.div
                                            key={session.name}
                                            layout
                                            initial={false}
                                            className={cn(
                                                "relative group/card bg-[#0A0A0B] border border-white/5 rounded-xl overflow-hidden shadow-xl shadow-black/20 transition-all duration-300",
                                                "hover:border-white/10 hover:shadow-2xl hover:scale-[1.002]",
                                                justGenerated && "ring-1 ring-blue-500/20"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-1000",
                                                    justGenerated && "opacity-100"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 blur-xl animate-aurora-mix mix-blend-screen" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-emerald-400/5 blur-2xl animate-pulse" />
                                            </div>

                                            <button
                                                onClick={() => toggleSession(sessionIdx)}
                                                className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-white/5 group-hover:border-blue-500/30 transition-colors shadow-inner">
                                                        {sessionIdx + 1}
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-bold text-white text-lg group-hover:text-blue-200 transition-colors">{session.name}</h4>
                                                        <p className="text-xs text-slate-500">{session.exerciseCount} Exercises</p>
                                                    </div>
                                                </div>
                                                <div className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "rotate-0")}>
                                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                                </div>
                                            </button>

                                            <div className={cn(
                                                "grid transition-all duration-300 ease-in-out bg-gradient-to-b from-white/[0.02] to-transparent",
                                                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            )}>
                                                <div className="overflow-hidden">
                                                    <div className="p-4 pt-0">
                                                        <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative">
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

                                                            <div className="grid grid-cols-[40px_30px_minmax(200px,2fr)_80px_80px_100px_115px_1.5fr_1fr_40px] gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.01] text-xs text-slate-500 uppercase tracking-wider font-medium text-center items-center relative z-10">
                                                                <div>#</div>
                                                                <div></div>
                                                                <div className="text-left">Exercise</div>
                                                                <div>Sets</div>
                                                                <div>Reps</div>
                                                                <div>Weight</div>
                                                                <div className="text-center">Rest</div>
                                                                <div>Muscle</div>
                                                                <div>Sub-Muscle</div>
                                                                <div></div>
                                                            </div>

                                                            <Reorder.Group
                                                                axis="y"
                                                                values={sessionOrders[sessionIdx] || Array.from({ length: session.exerciseCount }).map((_, i) => i)}
                                                                onReorder={(newOrder) => handleReorder(sessionIdx, newOrder)}
                                                                className="relative z-10 divide-y divide-white/5"
                                                            >
                                                                {(sessionOrders[sessionIdx] || Array.from({ length: session.exerciseCount }).map((_, i) => i)).map((exIdx) => {
                                                                    const rowData = planData[sessionIdx]?.[exIdx] || {};
                                                                    const isDropdownOpen = openDropdown?.sessionIdx === sessionIdx && openDropdown?.exIdx === exIdx;
                                                                    const isHovered = hoveredRow?.sessionIdx === sessionIdx && hoveredRow?.exIdx === exIdx;

                                                                    return (
                                                                        <ExerciseRowItem
                                                                            key={exIdx}
                                                                            sessionIdx={sessionIdx}
                                                                            exIdx={exIdx}
                                                                            rowData={rowData}
                                                                            exercises={exercises}
                                                                            isDropdownOpen={isDropdownOpen}
                                                                            isHovered={isHovered}
                                                                            justGenerated={justGenerated}
                                                                            handleDropdownClick={handleDropdownClick}
                                                                            updateExercise={updateExercise}
                                                                            onDelete={handleDeleteExercise}
                                                                            setHoveredRow={setHoveredRow}
                                                                            isEditing={!hasPlan || isEditing}
                                                                        />
                                                                    );
                                                                })}
                                                            </Reorder.Group>

                                                            {/* Add Exercise Button */}
                                                            {(!hasPlan || isEditing) && (
                                                                <button
                                                                    onClick={() => handleAddRow(sessionIdx)}
                                                                    className="w-full py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5 text-sm font-medium group/add"
                                                                >
                                                                    <div className="w-5 h-5 rounded-full border border-slate-600 group-hover/add:border-blue-400 flex items-center justify-center transition-colors">
                                                                        <span className="text-sm leading-none mb-0.5 group-hover/add:text-blue-400">+</span>
                                                                    </div>
                                                                    Add Exercise
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {sheetLink && !iframeLoading && !isSaving && !sheetFullscreen && (
                                <motion.div
                                    key="sheet-view"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="relative group/sheet bg-[#0A0A0B] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/30 mt-8"
                                >
                                    {/* Premium Header - Collapsible */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => !sheetFullscreen && setSheetExpanded(!sheetExpanded)}
                                        onKeyDown={(e) => e.key === 'Enter' && !sheetFullscreen && setSheetExpanded(!sheetExpanded)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 bg-gradient-to-r from-white/[0.02] to-transparent hover:from-white/[0.04] transition-all group",
                                            !sheetFullscreen && "cursor-pointer"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors shadow-inner">
                                                <FileSpreadsheet className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-white text-lg group-hover:text-emerald-200 transition-colors">Generated Workout Plan</h4>
                                                <p className="text-xs text-slate-500">
                                                    Google Sheets {!sheetFullscreen && `• Click to ${sheetExpanded ? 'collapse' : 'expand'}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={sheetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Open in Sheets
                                            </a>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSheetFullscreen(!sheetFullscreen);
                                                    if (!sheetFullscreen) {
                                                        setSheetExpanded(true);
                                                    }
                                                }}
                                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                                                title={sheetFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.body.style.overflow = '';
                                                    document.body.style.position = '';
                                                    document.body.style.top = '';
                                                    document.body.style.width = '';
                                                    setSheetLink(null);
                                                    setSheetExpanded(true);
                                                    setSheetFullscreen(false);
                                                }}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>

                                    {/* Collapsible Sheet Content */}
                                    <div className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        (sheetExpanded || sheetFullscreen) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <div className="overflow-hidden">
                                            <div
                                                className={cn(
                                                    "relative w-full bg-[#0A0A0B]",
                                                    sheetFullscreen ? "h-[calc(100vh-8rem)]" : "h-[75vh]"
                                                )}
                                                style={{
                                                    overflowAnchor: 'none',
                                                    contain: 'strict',
                                                    willChange: 'transform',
                                                    transform: 'translateZ(0)',
                                                    backfaceVisibility: 'hidden',
                                                    isolation: 'isolate',
                                                }}
                                                onMouseEnter={() => {
                                                    // Completely lock scrolling on the body and html
                                                    const scrollY = window.scrollY;
                                                    document.body.style.overflow = 'hidden';
                                                    document.body.style.position = 'fixed';
                                                    document.body.style.top = `-${scrollY}px`;
                                                    document.body.style.width = '100%';
                                                    document.body.dataset.scrollLockY = String(scrollY);
                                                }}
                                                onMouseLeave={() => {
                                                    // Restore scroll
                                                    const scrollY = document.body.dataset.scrollLockY;
                                                    document.body.style.overflow = '';
                                                    document.body.style.position = '';
                                                    document.body.style.top = '';
                                                    document.body.style.width = '';
                                                    if (scrollY) {
                                                        window.scrollTo(0, parseInt(scrollY, 10));
                                                    }
                                                    delete document.body.dataset.scrollLockY;
                                                }}
                                            >
                                                <iframe
                                                    src={sheetLink}
                                                    loading="lazy"
                                                    className="bg-[#0A0A0B] border-0 origin-top-left"
                                                    style={{
                                                        width: '125%',
                                                        height: '125%',
                                                        transform: 'scale(0.8) translateZ(0)',
                                                        filter: "invert(0.88) hue-rotate(180deg) contrast(1.2) saturate(1.2)",
                                                        willChange: 'transform',
                                                        isolation: 'isolate',
                                                        backfaceVisibility: 'hidden',
                                                        contain: 'strict',
                                                    }}
                                                    title="Workout Plan Sheet"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Hidden iframe for preloading */}
                            {sheetLink && iframeLoading && (
                                <iframe
                                    src={sheetLink}
                                    loading="lazy"
                                    onLoad={() => {
                                        setIframeLoading(false);
                                        setTimeout(() => setIsSaving(false), 300);
                                    }}
                                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                                    style={{
                                        contain: 'strict',
                                        isolation: 'isolate',
                                    }}
                                    title="Preload Sheet"
                                />
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {
                openDropdown && (
                    <ExerciseDropdown
                        isOpen={true}
                        position={dropdownPos}
                        exercises={exercises}
                        currentId={planData[openDropdown.sessionIdx]?.[openDropdown.exIdx]?.exerciseId || ""}
                        onSelect={(id) => updateExercise(openDropdown.sessionIdx, openDropdown.exIdx, 'exerciseId', id)}
                        onClose={() => { setOpenDropdown(null); setDropdownPos(null); }}
                        innerRef={dropdownRef}
                    />
                )
            }

            {/* Fullscreen Portal - Renders at document.body level */}
            {
                sheetLink && !iframeLoading && !isSaving && sheetFullscreen && typeof document !== 'undefined' && ReactDOM.createPortal(
                    <div className="fixed inset-0 z-[99999] bg-[#0A0A0B] flex flex-col">
                        {/* Fullscreen Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-white/5">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Generated Workout Plan</h4>
                                    <p className="text-xs text-slate-500">Google Sheets • Fullscreen Mode</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={sheetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Open in Sheets
                                </a>
                                <button
                                    onClick={() => setSheetFullscreen(false)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                    Exit Fullscreen
                                </button>
                            </div>
                        </div>

                        {/* Fullscreen Sheet */}
                        <div
                            className="flex-1 w-full overflow-hidden"
                            style={{
                                contain: 'strict',
                                isolation: 'isolate',
                                willChange: 'transform',
                                transform: 'translateZ(0)',
                            }}
                        >
                            <iframe
                                src={sheetLink}
                                loading="lazy"
                                className="bg-[#0A0A0B] border-0 origin-top-left"
                                style={{
                                    width: '125%',
                                    height: '125%',
                                    transform: 'scale(0.8) translateZ(0)',
                                    filter: "invert(0.88) hue-rotate(180deg) contrast(0.9) saturate(1.2)",
                                    willChange: 'transform',
                                    isolation: 'isolate',
                                    backfaceVisibility: 'hidden',
                                    contain: 'strict',
                                }}
                                title="Workout Plan Sheet - Fullscreen"
                            />
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
}
