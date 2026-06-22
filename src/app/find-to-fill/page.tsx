'use client';

import React, { useState } from 'react';
import { Camera, Send, ArrowLeft, ImageIcon, Mail, MapPin, MessageCircle, Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export default function FindToFillPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

      setIsSuccess(true);
      setFormData({
        name: '', gmail: '', whatsappNumber: '', instaId: '',
        state: '', district: '', exactLocation: '',
        workDuration: '', workType: '', referenceVideo: '',
        price: '', deviceType: ''
      });

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error("Error saving data:", error);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-6 py-4 bg-zinc-900/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-all mb-16 text-xs font-black uppercase tracking-[0.3em]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Back to Studio
          </Link>

          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Zap className="w-3 h-3" />
              Project Deployment
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter leading-none"
            >
              Fill to <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Find.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Provide your production requirements and we'll connect you with the <span className="text-slate-900 font-medium">elite talent</span> your brand deserves.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/30 backdrop-blur-3xl p-8 md:p-12 rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-10"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-8">
                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 tracking-tighter">Request Received.</h2>
                  <p className="text-slate-500 font-light max-w-sm mb-10">
                    Your production brief has been successfully archived. Our team will review and contact you shortly.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Identity Section */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Core Identity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input type="text" name="name" value={formData.name} required onChange={handleChange} className={inputClass} placeholder="Elite Client Name" />
                  </div>
                  <div>
                    <label className={labelClass}>Gmail Address *</label>
                    <input type="email" name="gmail" value={formData.gmail} required onChange={handleChange} className={inputClass} placeholder="client@studio.com" />
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Connectivity</h3>
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp Number *</label>
                    <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} required onChange={handleChange} className={inputClass} placeholder="+91 00000 00000" />
                  </div>
                  <div>
                    <label className={labelClass}>ImageIcon ID</label>
                    <input type="text" name="instaId" value={formData.instaId} onChange={handleChange} className={inputClass} placeholder="@brand_handle" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-rose-400" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Geography</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>State *</label>
                      <input type="text" name="state" value={formData.state} required onChange={handleChange} className={inputClass} placeholder="State" />
                    </div>
                    <div>
                      <label className={labelClass}>District *</label>
                      <input type="text" name="district" value={formData.district} required onChange={handleChange} className={inputClass} placeholder="District" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Exact Venue *</label>
                    <input type="text" name="exactLocation" value={formData.exactLocation} required onChange={handleChange} className={inputClass} placeholder="Production Location Details" />
                  </div>
                </div>
              </div>

              {/* Project Brief */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Technical Brief</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className={labelClass}> your Work Type *</label>
                    <input type="text" name="workType" value={formData.workType} required onChange={handleChange} className={inputClass} placeholder="e.g. Ad Film" />
                  </div>
                  <div>
                    <label className={labelClass}>Duration and time  *</label>
                    <input type="text" name="workDuration" value={formData.workDuration} required onChange={handleChange} className={inputClass} placeholder="e.g. 2 Days" />
                  </div>
                  <div>
                    <label className={labelClass}>Budget (₹) *</label>
                    <input type="number" name="price" value={formData.price} required onChange={handleChange} className={inputClass} placeholder="Your Allocation" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>required Gadgets *</label>
                    <input type="text" name="deviceType" value={formData.deviceType} required onChange={handleChange} className={inputClass} placeholder="e.g. RED, Arri, Drone" />
                  </div>
                  <div>
                    <label className={labelClass}>video Reference Link *</label>
                    <input type="url" name="referenceVideo" value={formData.referenceVideo} required onChange={handleChange} className={inputClass} placeholder="YouTube/Drive Reference" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group relative flex items-center justify-center gap-4 bg-slate-900 text-white font-black py-6 rounded-[32px] text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Archiving...</>
                ) : (
                  <><Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" /> Deploy Request</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
