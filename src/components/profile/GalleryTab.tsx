"use strict";
"client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Client, api } from "@/lib/api";
import { Camera, Image as ImageIcon, Maximize2, Download, Plus, X, ArrowRightLeft, Calendar, FileText, Save, Edit2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function GalleryTab({ clientId, client }: { clientId: string, client?: Client }) {
    const [photos, setPhotos] = useState<{ id?: number; photo_url: string; date: string; type?: string; notes?: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Upload State
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploadDetails, setUploadDetails] = useState({ date: new Date().toISOString().split('T')[0], type: 'check-in', notes: '' });

    // View State
    const [expandedPhotoId, setExpandedPhotoId] = useState<number | null>(null);

    // Comparison State
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]); // Store IDs
    const [sliderPosition, setSliderPosition] = useState(50);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Editing State (Lightbox)
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [editNotes, setEditNotes] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // --- Data Loading ---
    const loadPhotos = async () => {
        if (!clientId) return;
        setIsLoading(true);
        const data = await api.getClientPhotos(clientId);
        setPhotos(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        loadPhotos();
    }, [clientId]);

    // --- File Handling ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let file: File | undefined;
        if ('files' in e.target && e.target.files) file = e.target.files[0];
        else if ('dataTransfer' in e) {
            e.preventDefault();
            file = e.dataTransfer.files[0];
        }

        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setPendingFile(file);
        setIsUploading(true);
    };

    const finalizeUpload = async () => {
        if (!pendingFile) return;
        setIsLoading(true);
        try {
            const clientName = client?.full_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'client';
            const fileExt = pendingFile.name.split('.').pop();
            const fileName = `${clientName}/${clientId}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await api.uploadClientPhoto(fileName, pendingFile);
            if (uploadError) throw new Error("Failed to upload image");

            const publicUrl = api.getPublicUrl(fileName);
            if (!publicUrl) throw new Error("Could not get public URL");

            await api.addClientPhoto({
                client_id: Number(clientId),
                photo_url: publicUrl,
                date: uploadDetails.date,
                type: uploadDetails.type,
                notes: uploadDetails.notes
            });

            await loadPhotos();

            // Reset
            setPendingFile(null);
            setIsUploading(false);
            setUploadDetails({ date: new Date().toISOString().split('T')[0], type: 'check-in', notes: '' });

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload photo.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Comparison Logic ---
    const toggleComparisonSelection = (id: number) => {
        if (selectedPhotos.includes(id)) {
            setSelectedPhotos(prev => prev.filter(p => p !== id));
        } else {
            if (selectedPhotos.length < 2) {
                setSelectedPhotos(prev => [...prev, id]);
            }
        }
    };

    const handleSliderChange = (e: React.MouseEvent | React.TouchEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const position = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(100, Math.max(0, position)));
    };

    // --- Lightbox Logic ---
    const expandedPhotoObj = photos.find(p => p.id === expandedPhotoId);

    const handleSaveNotes = async () => {
        if (!expandedPhotoObj?.id) return;
        await api.updateClientPhoto(expandedPhotoObj.id, { notes: editNotes });
        // Update local state without reload
        setPhotos(prev => prev.map(p => p.id === expandedPhotoObj.id ? { ...p, notes: editNotes } : p));
        setIsEditingNotes(false);
    };

    useEffect(() => {
        if (expandedPhotoObj) {
            setEditNotes(expandedPhotoObj.notes || "");
            setIsEditingNotes(false);
        }
    }, [expandedPhotoId]);


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Transformation Gallery
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Track physical progress over time</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setIsComparisonMode(!isComparisonMode);
                            setSelectedPhotos([]);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-medium border duration-300",
                            isComparisonMode
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        {isComparisonMode ? 'Exit Comparison' : 'Compare'}
                    </button>

                    {/* Deep Ambient Upload Button */}
                    <button
                        onClick={() => setIsUploading(true)}
                        className="group relative px-6 py-2.5 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] border border-white/10"
                    >
                        <div className="absolute inset-0 bg-slate-950" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 opacity-90 group-hover:opacity-100 transition-opacity" />
                        {/* Subtle Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                        <div className="relative flex items-center gap-2 text-slate-200 font-medium group-hover:text-white">
                            <Plus className="w-4 h-4" />
                            Upload New
                        </div>
                    </button>
                </div>
            </div>

            {/* Enhanced Comparison View - Side-by-Side - Portal to Body */}
            {isComparisonMode && selectedPhotos.length === 2 && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500 p-8 md:p-12 items-center"
                    onClick={() => {
                        setIsComparisonMode(false);
                        setSelectedPhotos([]);
                    }}
                >
                    {/* Global Ambient Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

                    <button className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[100] group">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>

                    <div
                        className="w-full max-w-[90vw] h-[85vh] flex flex-col md:flex-row gap-8 items-center justify-center p-4 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Before Photo */}
                        <div className="flex-1 relative h-full w-full flex flex-col items-center justify-center group/before">
                            {/* Individual Ambient Glow */}
                            <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full opacity-40 group-hover/before:opacity-80 transition-opacity duration-700" />

                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                {/* Centered Badge */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 shadow-xl">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                                    <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">Before</span>
                                </div>

                                <img
                                    src={photos.find(p => p.id === selectedPhotos[0])?.photo_url}
                                    className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl rounded-2xl border border-white/5 transition-transform duration-500 group-hover/before:scale-[1.02]"
                                    alt="Before"
                                />

                                <div className="mt-6 flex flex-col items-center">
                                    <p className="text-white text-xl font-light tracking-wide">
                                        {new Date(photos.find(p => p.id === selectedPhotos[0])!.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mt-2">Starting Point</p>
                                </div>
                            </div>
                        </div>

                        {/* Divider Line */}
                        <div className="h-2/3 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

                        {/* After Photo */}
                        <div className="flex-1 relative h-full w-full flex flex-col items-center justify-center group/after">
                            {/* Individual Ambient Glow */}
                            <div className="absolute inset-0 bg-purple-500/10 blur-[50px] rounded-full opacity-40 group-hover/after:opacity-80 transition-opacity duration-700" />

                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                {/* Centered Badge */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 shadow-xl">
                                    <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">After</span>
                                    <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
                                </div>

                                <img
                                    src={photos.find(p => p.id === selectedPhotos[1])?.photo_url}
                                    className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl rounded-2xl border border-white/5 transition-transform duration-500 group-hover/after:scale-[1.02]"
                                    alt="After"
                                />

                                <div className="mt-6 flex flex-col items-center">
                                    <p className="text-white text-xl font-light tracking-wide">
                                        {new Date(photos.find(p => p.id === selectedPhotos[1])!.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mt-2">Current Progress</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Comparison Placeholder */}
            {isComparisonMode && selectedPhotos.length < 2 && (
                <div className="p-8 rounded-xl border border-dashed border-blue-500/20 bg-blue-500/5 text-center animate-pulse">
                    <p className="text-blue-200 font-medium">Select {2 - selectedPhotos.length} more photo{2 - selectedPhotos.length > 1 ? 's' : ''} to compare</p>
                </div>
            )}


            {/* Upload Modal */}
            {isUploading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <GlassCard className="w-full max-w-lg p-0 overflow-hidden relative border-white/10 shadow-2xl">
                        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent">
                            <button
                                onClick={() => { setIsUploading(false); setPendingFile(null); }}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h4 className="text-xl font-bold text-white">
                                {pendingFile ? 'Add Details' : 'Upload Photo'}
                            </h4>
                        </div>

                        <div className="p-6 pt-0">
                            {!pendingFile ? (
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileSelect}
                                    className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center gap-4 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group cursor-pointer relative bg-black/20"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-pink-500/10 flex items-center justify-center transition-colors">
                                        <Download className="w-8 h-8 text-slate-400 group-hover:text-pink-500 transition-colors" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-medium">Click to upload or drag and drop</p>
                                        <p className="text-sm text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="aspect-video w-full bg-black/40 rounded-lg overflow-hidden flex items-center justify-center border border-white/10 relative">
                                        <img src={URL.createObjectURL(pendingFile)} className="w-full h-full object-contain opacity-50" />
                                        <p className="absolute text-white font-medium drop-shadow-md truncate px-4 max-w-full">{pendingFile.name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Date</label>
                                            <input
                                                type="date"
                                                value={uploadDetails.date}
                                                onChange={(e) => setUploadDetails({ ...uploadDetails, date: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50 transition-colors placeholder:text-slate-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Type</label>
                                            <select
                                                value={uploadDetails.type}
                                                onChange={(e) => setUploadDetails({ ...uploadDetails, type: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
                                            >
                                                <option value="check-in">Check In</option>
                                                <option value="progress">Progress</option>
                                                <option value="start">Starting Point</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Notes</label>
                                        <textarea
                                            value={uploadDetails.notes}
                                            onChange={(e) => setUploadDetails({ ...uploadDetails, notes: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50 h-24 resize-none"
                                            placeholder="Example: Weight 72kg, felt stronger on squats..."
                                        />
                                    </div>

                                    <button
                                        onClick={finalizeUpload}
                                        disabled={isLoading}
                                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            'Save Photo'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Enhanced Lightbox - Floating Split Layout - Portal to Body */}
            {expandedPhotoObj && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 p-4 md:p-8"
                    onClick={() => setExpandedPhotoId(null)}
                >
                    <button className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-[100] group">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>

                    <div
                        className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl h-full gap-8 md:gap-12"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Floating Image Section - No Card, Just Visuals */}
                        <div className="flex-1 relative flex items-center justify-center h-full max-h-[85vh] group/image">
                            {/* Ambient Lighting - Continuous Movement */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl animate-pulse" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse delay-700" />

                            <img
                                src={expandedPhotoObj.photo_url}
                                alt="Expanded"
                                className="relative max-w-full max-h-full object-contain z-10 drop-shadow-2xl transition-transform duration-700 ease-out rounded-2xl"
                            />
                        </div>

                        {/* Detached Details Card */}
                        <div className="w-full md:w-[320px] h-auto bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden shrink-0 max-h-[60vh] md:max-h-auto transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-black/50 hover:border-white/20 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] group/card">
                            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                <h4 className="text-xl font-light text-white mb-1 group-hover/card:text-white transition-colors duration-300">Photo Details</h4>
                                <p className="text-white/40 text-xs">Captured Moment</p>
                            </div>

                            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">
                                        <Calendar className="w-3 h-3" /> Date
                                    </div>
                                    <p className="text-white text-sm font-light tracking-wide">{new Date(expandedPhotoObj.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] group">
                                        <div className="flex items-center gap-2"><FileText className="w-3 h-3" /> Notes</div>
                                        {!isEditingNotes && (
                                            <button
                                                onClick={() => setIsEditingNotes(true)}
                                                className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] bg-white/5 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 className="w-3 h-3" /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {isEditingNotes ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                            <textarea
                                                value={editNotes}
                                                onChange={(e) => setEditNotes(e.target.value)}
                                                className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white/90 focus:outline-none focus:border-white/60 min-h-[150px] text-base font-light leading-relaxed resize-none placeholder:text-white/20 transition-all"
                                                placeholder="Write your thoughts..."
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveNotes}
                                                    className="px-4 py-1.5 bg-white text-black rounded-full text-[10px] font-bold hover:bg-white/90 transition-all uppercase tracking-wider"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => { setIsEditingNotes(false); setEditNotes(expandedPhotoObj.notes || ""); }}
                                                    className="px-4 py-1.5 bg-transparent border border-white/10 text-white rounded-full text-[10px] font-bold hover:bg-white/5 transition-all uppercase tracking-wider"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative group/notes">
                                            {expandedPhotoObj.notes ? (
                                                <p className="text-white/80 text-base font-light leading-relaxed whitespace-pre-wrap">
                                                    {expandedPhotoObj.notes}
                                                </p>
                                            ) : (
                                                <p className="text-white/20 text-base font-light italic">No notes added...</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <GlassCard className="p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Inline Add Card */}
                    <div
                        onClick={() => setIsUploading(true)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileSelect}
                        className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group flex flex-col items-center justify-center gap-4 cursor-pointer relative bg-white/[0.02]"
                    >
                        <div className="p-5 rounded-full bg-white/5 group-hover:bg-pink-500/10 group-hover:text-pink-500 text-slate-500 transition-colors shadow-lg shadow-black/20">
                            <Plus className="w-8 h-8" />
                        </div>
                        <div className="text-center px-4">
                            <span className="block text-sm font-bold text-slate-400 group-hover:text-pink-500 transition-colors">Add Photo</span>
                            <span className="text-xs text-slate-600 mt-1 block">Drag & Drop</span>
                        </div>
                    </div>

                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            onClick={() => {
                                if (isComparisonMode) {
                                    toggleComparisonSelection(photo.id!);
                                } else {
                                    setExpandedPhotoId(photo.id!);
                                }
                            }}
                            className={cn(
                                "group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border transition-all cursor-pointer shadow-xl",
                                isComparisonMode && selectedPhotos.includes(photo.id!)
                                    ? "border-blue-500 ring-4 ring-blue-500/20 scale-[0.98]"
                                    : "border-white/5 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50"
                            )}
                        >
                            <img
                                src={photo.photo_url}
                                alt={`Check-in ${photo.date}`}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                            <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white font-bold text-sm tracking-wide">{new Date(photo.date).toLocaleDateString()}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-black bg-white/90 px-2 py-0.5 rounded-full backdrop-blur-md">
                                        {photo.type || 'Photo'}
                                    </span>
                                </div>
                            </div>

                            {isComparisonMode ? (
                                <div className={cn(
                                    "absolute top-3 right-3 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-black/40 backdrop-blur-md",
                                    selectedPhotos.includes(photo.id!)
                                        ? "bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        : "border-white/30 text-transparent"
                                )}>
                                    <div className={cn("w-3 h-3 rounded-full bg-current transition-all", selectedPhotos.includes(photo.id!) ? "scale-100" : "scale-0")} />
                                </div>
                            ) : (
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0">
                                    <div className="p-2.5 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 shadow-lg">
                                        <Maximize2 className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}

