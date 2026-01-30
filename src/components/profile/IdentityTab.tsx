
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, Phone, MapPin, Instagram, Calendar, Briefcase, User, Heart, Activity } from "lucide-react";
import { Client, api } from "@/lib/api";
import { useState } from "react";
import { EditSaveButton } from "./shared/EditSaveButton";
import { InfoRow } from "./shared/InfoRow";
import { ProfileTextarea } from "./shared/ProfileTextarea";
import { ProfileInput } from "./shared/ProfileInput";
import { cn } from "@/lib/utils";
import { LifestyleTab } from "./LifestyleTab";
import { PhysiqueTab } from "./PhysiqueTab";

export function IdentityTab({ clientId, client }: { clientId: string, client?: Client }) {
    const [activeSubTab, setActiveSubTab] = useState<'general' | 'lifestyle' | 'physique'>('general');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        age: client?.age,
        location: client?.location,
        job_title: client?.job_title,
        instagram_username: client?.instagram_username,
        phone_number: client?.phone_number,
        email: client?.email,
        main_goal_text: client?.main_goal_text,
        final_strategy: client?.final_strategy,
        psych_struggles: client?.psych_struggles,
    });

    if (!client) return <div>Loading...</div>;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await api.updateClient(client.id, {
                age: Number(formData.age),
                location: formData.location,
                job_title: formData.job_title,
                instagram_username: formData.instagram_username,
                phone_number: formData.phone_number,
                email: formData.email,
                main_goal_text: formData.main_goal_text,
                final_strategy: formData.final_strategy,
                psych_struggles: formData.psych_struggles,
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update client:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const subTabs = [
        { id: 'general', label: 'General', icon: User },
        { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
        { id: 'physique', label: 'Physique', icon: Activity },
    ];

    return (
        <div className="space-y-6">
            {/* Sub-Navigation */}
            <div className="flex justify-center">
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300",
                                activeSubTab === tab.id
                                    ? "bg-white text-black shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-3 h-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Content */}
            <div className="min-h-[400px]">
                {activeSubTab === 'general' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Left Column: Key Stats */}
                        <div className="space-y-6">
                            <GlassCard className="space-y-4 p-6 relative group">
                                <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-2">
                                    <h3 className="text-lg font-semibold text-white">Basic Info</h3>
                                    <EditSaveButton
                                        isEditing={isEditing}
                                        isLoading={isLoading}
                                        onEdit={() => setIsEditing(true)}
                                        onSave={handleSave}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <InfoRow
                                        icon={Calendar} label="Age:"
                                        value={formData.age} isEditing={isEditing} onChange={(v) => handleChange('age', v)} type="number"
                                    />
                                    <InfoRow
                                        icon={MapPin}
                                        value={formData.location} isEditing={isEditing} onChange={(v) => handleChange('location', v)} placeholder="City, Country"
                                    />
                                    <InfoRow
                                        icon={Briefcase}
                                        value={formData.job_title} isEditing={isEditing} onChange={(v) => handleChange('job_title', v)} placeholder="Job Title"
                                    />
                                </div>
                            </GlassCard>

                            <GlassCard className="space-y-4 p-6">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3 mb-2">Contact & Socials</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-pink-500/10 text-pink-500 shrink-0">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            {isEditing ? (
                                                <ProfileInput
                                                    isEditing={true}
                                                    value={formData.instagram_username}
                                                    onChange={(e) => handleChange('instagram_username', e.target.value)}
                                                    placeholder="Username"
                                                />
                                            ) : formData.instagram_username ? (
                                                <a href={`https://instagram.com/${formData.instagram_username}`} target="_blank" className="text-muted-foreground hover:text-white transition-colors truncate block">
                                                    @{formData.instagram_username}
                                                </a>
                                            ) : (
                                                <span className="text-sm text-slate-500">No Instagram</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <ProfileInput
                                                isEditing={isEditing}
                                                value={formData.phone_number}
                                                onChange={(e) => handleChange('phone_number', e.target.value)}
                                                placeholder="+1 234 567 890"
                                                displayValue={formData.phone_number ? <span className="text-muted-foreground">{formData.phone_number}</span> : <span className="text-sm text-slate-500">No Phone</span>}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500 shrink-0">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            {isEditing ? (
                                                <ProfileInput
                                                    isEditing={true}
                                                    value={formData.email}
                                                    onChange={(e) => handleChange('email', e.target.value)}
                                                    placeholder="email@example.com"
                                                />
                                            ) : formData.email ? (
                                                <a href={`mailto:${formData.email}`} className="text-muted-foreground hover:text-white transition-colors truncate block">
                                                    {formData.email}
                                                </a>
                                            ) : (
                                                <span className="text-sm text-slate-500">No Email</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Right Column: Bio / Notes */}
                        <div className="lg:col-span-2">
                            <GlassCard className="h-full p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-3">Client Overview</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Main Goal</label>
                                        <ProfileTextarea
                                            isEditing={isEditing}
                                            value={formData.main_goal_text}
                                            onChange={(e) => handleChange('main_goal_text', e.target.value)}
                                            placeholder="Describe the main goal..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Strategy Summary</label>
                                        <ProfileInput
                                            isEditing={isEditing}
                                            value={formData.final_strategy}
                                            onChange={(e) => handleChange('final_strategy', e.target.value)}
                                            placeholder="e.g. Body Recomp, Fat Loss"
                                            className={isEditing ? "px-3 py-2" : ""}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Psychological Struggles</label>
                                        {isEditing ? (
                                            <ProfileTextarea
                                                isEditing={true}
                                                value={formData.psych_struggles}
                                                onChange={(e) => handleChange('psych_struggles', e.target.value)}
                                                placeholder="Any struggles?"
                                                className="min-h-[80px]"
                                            />
                                        ) : formData.psych_struggles && (
                                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                                <p className="text-yellow-200 text-sm flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                                    {formData.psych_struggles}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                )}

                {activeSubTab === 'lifestyle' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <LifestyleTab clientId={clientId} client={client} />
                    </div>
                )}

                {activeSubTab === 'physique' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PhysiqueTab clientId={clientId} client={client} />
                    </div>
                )}
            </div>
        </div>
    );
}
