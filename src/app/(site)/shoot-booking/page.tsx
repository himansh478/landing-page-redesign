'use client';

import React, { useState } from 'react';
import { Send, ImageIcon, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { btnPrimary, fieldClass, fieldsetLegendClass, labelClass, textareaClass } from '@/components/editorial/styles';

export default function ShootBookingPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gmail: '',
        whatsappNumber: '',
        instaId: '',
        state: '',
        district: '',
        exactLocation: '',
        workDuration: '',
        workType: '',
        referenceVideo: '',
        price: '',
        deviceType: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('I_have_work')
                .insert([{
                    name: formData.name,
                    gmail: formData.gmail,
                    whatsapp_number: formData.whatsappNumber,
                    insta_id: formData.instaId,
                    state: formData.state,
                    district: formData.district,
                    exact_location: formData.exactLocation,
                    work_duration: formData.workDuration,
                    work_type: formData.workType,
                    reference_video: formData.referenceVideo,
                    price: parseFloat(formData.price),
                    device_type: formData.deviceType
                }]);

            if (error) throw error;

            alert("Success! Your booking request has been saved. ✅");
            // Clear form
            setFormData({
                name: '', gmail: '', whatsappNumber: '', instaId: '',
                state: '', district: '', exactLocation: '',
                workDuration: '', workType: '', referenceVideo: '',
                price: '', deviceType: ''
            });
        } catch (error: unknown) {
            console.error("Error saving data:", error);
            alert("Error: " + (error instanceof Error ? error.message : (error as { message?: string })?.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageShell>
            <PageIntro
                back={{ href: '/', label: 'Back to Home' }}
                title={['Fill to', 'Find']}
                lede="Provide shoot details to get the best creative partner"
            />

            <form
                onSubmit={handleSubmit}
                className="mt-14 sm:mt-20 max-w-3xl bg-paper border border-ink/15 rounded-[4px] overflow-hidden shadow-[0_40px_80px_-50px_rgb(var(--ink-rgb)/0.5)]"
            >
                <div className="h-1 bg-coral" aria-hidden="true" />
                <div className="p-6 sm:p-10 space-y-10">
                    <fieldset className="space-y-4">
                        <legend className={fieldsetLegendClass}>01 — Contact</legend>
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sk-name" className={labelClass}>Your Name *</label>
                                <input id="sk-name" type="text" name="name" value={formData.name} required onChange={handleChange} className={fieldClass} placeholder="Full Name" />
                            </div>
                            <div>
                                <label htmlFor="sk-gmail" className={labelClass}>Gmail Address *</label>
                                <input id="sk-gmail" type="email" name="gmail" value={formData.gmail} required onChange={handleChange} className={fieldClass} placeholder="example@gmail.com" />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sk-whatsapp" className={labelClass}>
                                    {/* WhatsApp keeps its own green */}
                                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" aria-hidden="true" /> WhatsApp Number *
                                </label>
                                <input id="sk-whatsapp" type="tel" name="whatsappNumber" value={formData.whatsappNumber} required onChange={handleChange} className={fieldClass} placeholder="10-digit number" />
                            </div>
                            <div>
                                <label htmlFor="sk-insta" className={labelClass}>
                                    <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" /> ImageIcon ID (Optional)
                                </label>
                                <input id="sk-insta" type="text" name="instaId" value={formData.instaId} onChange={handleChange} className={fieldClass} placeholder="@username" />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="space-y-4">
                        <legend className={fieldsetLegendClass}>02 — Location</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sk-state" className={labelClass}>State *</label>
                                <input id="sk-state" type="text" name="state" value={formData.state} required onChange={handleChange} className={fieldClass} placeholder="e.g. MP" />
                            </div>
                            <div>
                                <label htmlFor="sk-district" className={labelClass}>District *</label>
                                <input id="sk-district" type="text" name="district" value={formData.district} required onChange={handleChange} className={fieldClass} placeholder="e.g. Bhopal" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="sk-location" className={labelClass}>Exact Work Location *</label>
                            <textarea id="sk-location" name="exactLocation" value={formData.exactLocation} rows={2} required onChange={handleChange} className={textareaClass} placeholder="Building, Area, Landmark..." />
                        </div>
                    </fieldset>

                    <fieldset className="space-y-4">
                        <legend className={fieldsetLegendClass}>03 — Work Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="sk-type" className={labelClass}>Work Type *</label>
                                <input id="sk-type" type="text" name="workType" value={formData.workType} required onChange={handleChange} className={fieldClass} placeholder="e.g. Wedding, Commercial, Vlog" />
                            </div>
                            <div>
                                <label htmlFor="sk-duration" className={labelClass}>Duration *</label>
                                <input id="sk-duration" type="text" name="workDuration" value={formData.workDuration} required onChange={handleChange} className={fieldClass} placeholder="e.g. 5 Hours" />
                            </div>
                            <div>
                                <label htmlFor="sk-price" className={labelClass}>I Pay (₹) *</label>
                                <input id="sk-price" type="number" name="price" value={formData.price} required onChange={handleChange} className={fieldClass} placeholder="Your Price" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sk-device" className={labelClass}>Shoot Device *</label>
                                <input id="sk-device" type="text" name="deviceType" value={formData.deviceType} required onChange={handleChange} className={fieldClass} placeholder="e.g. Sony A7III, iPhone, Drone" />
                            </div>
                            <div>
                                <label htmlFor="sk-reference" className={labelClass}>Reference Video Link *</label>
                                <input id="sk-reference" type="url" name="referenceVideo" value={formData.referenceVideo} required onChange={handleChange} className={fieldClass} placeholder="YouTube/Drive Link" />
                            </div>
                        </div>
                    </fieldset>

                    <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Saving...</>
                        ) : (
                            <><Send className="w-5 h-5" aria-hidden="true" /> Find Creative Partner</>
                        )}
                    </button>
                </div>
            </form>
        </PageShell>
    );
}
