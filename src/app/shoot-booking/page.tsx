'use client';

import React, { useState } from 'react';
import { Camera, Send, ArrowLeft, ImageIcon, Mail, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
        } catch (error: any) {
            console.error("Error saving data:", error);
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900";

    return (
        <div className="min-h-screen bg-slate-50 py-24 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Fill to Find</h1>
                    <p className="text-slate-500">Provide shoot details to get the best creative partner</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Your Name *</label>
                            <input type="text" name="name" value={formData.name} required onChange={handleChange} className={inputClass} placeholder="Full Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Gmail Address *</label>
                            <input type="email" name="gmail" value={formData.gmail} required onChange={handleChange} className={inputClass} placeholder="example@gmail.com" />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp Number *
                            </label>
                            <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} required onChange={handleChange} className={inputClass} placeholder="10-digit number" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-pink-500" /> ImageIcon ID (Optional)
                            </label>
                            <input type="text" name="instaId" value={formData.instaId} onChange={handleChange} className={inputClass} placeholder="@username" />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">State *</label>
                            <input type="text" name="state" value={formData.state} required onChange={handleChange} className={inputClass} placeholder="e.g. MP" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">District *</label>
                            <input type="text" name="district" value={formData.district} required onChange={handleChange} className={inputClass} placeholder="e.g. Bhopal" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Exact Work Location *</label>
                        <textarea name="exactLocation" value={formData.exactLocation} rows={2} required onChange={handleChange} className={inputClass} placeholder="Building, Area, Landmark..." />
                    </div>

                    {/* Work Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Work Type *</label>
                            <input type="text" name="workType" value={formData.workType} required onChange={handleChange} className={inputClass} placeholder="e.g. Wedding, Commercial, Vlog" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Duration *</label>
                            <input type="text" name="workDuration" value={formData.workDuration} required onChange={handleChange} className={inputClass} placeholder="e.g. 5 Hours" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">I Pay (₹) *</label>
                            <input type="number" name="price" value={formData.price} required onChange={handleChange} className={inputClass} placeholder="Your Price" />
                        </div>
                    </div>

                    {/* Final Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Shoot Device *</label>
                            <input type="text" name="deviceType" value={formData.deviceType} required onChange={handleChange} className={inputClass} placeholder="e.g. Sony A7III, iPhone, Drone" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Reference Video Link *</label>
                            <input type="url" name="referenceVideo" value={formData.referenceVideo} required onChange={handleChange} className={inputClass} placeholder="YouTube/Drive Link" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                        ) : (
                            <><Send className="w-5 h-5" /> Find Creative Partner</>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
