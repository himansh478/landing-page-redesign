'use client';

import React, { useState } from 'react';
import { Camera, Send, MapPin, MessageCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { Em } from '@/components/editorial/Showcase';
import { btnPrimary, fieldClass, fieldsetLegendClass, labelClass } from '@/components/editorial/styles';

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
        back={{ href: '/', label: 'Back to Studio' }}
        note="Project Deployment"
        title={['Fill to', 'Find.']}
        lede={
          <>
            Provide your production requirements and we&apos;ll connect you with the <Em>elite talent</Em> your brand deserves.
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-14 sm:mt-20 max-w-4xl bg-paper border border-ink/15 rounded-[4px] overflow-hidden shadow-[0_40px_80px_-50px_rgb(var(--ink-rgb)/0.5)]"
      >
        <div className="h-1 bg-coral" aria-hidden="true" />
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="on-ink absolute inset-0 z-20 bg-ink/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-10"
              role="status"
            >
              <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center mb-8">
                <ShieldCheck className="w-8 h-8 text-ink" aria-hidden="true" />
              </div>
              <h2 className="font-display text-3xl font-extrabold text-ivory tracking-[-0.03em] mb-4">Request Received.</h2>
              <p className="text-ivory/70 max-w-sm mb-10">
                Your production brief has been successfully archived. Our team will review and contact you shortly.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="h-12 px-8 rounded-md border border-ivory/25 text-ivory font-semibold transition-colors hover:bg-ivory hover:text-ink"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
          {/* Identity Section */}
          <fieldset>
            <legend className={fieldsetLegendClass}>
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Core Identity
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ff-name" className={labelClass}>Full Name *</label>
                <input id="ff-name" type="text" name="name" value={formData.name} required onChange={handleChange} className={fieldClass} placeholder="Elite Client Name" />
              </div>
              <div>
                <label htmlFor="ff-gmail" className={labelClass}>Gmail Address *</label>
                <input id="ff-gmail" type="email" name="gmail" value={formData.gmail} required onChange={handleChange} className={fieldClass} placeholder="client@studio.com" />
              </div>
            </div>
          </fieldset>

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <fieldset className="space-y-4">
              <legend className={fieldsetLegendClass}>
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Connectivity
              </legend>
              <div>
                <label htmlFor="ff-whatsapp" className={labelClass}>WhatsApp Number *</label>
                <input id="ff-whatsapp" type="tel" name="whatsappNumber" value={formData.whatsappNumber} required onChange={handleChange} className={fieldClass} placeholder="+91 00000 00000" />
              </div>
              <div>
                <label htmlFor="ff-insta" className={labelClass}>ImageIcon ID</label>
                <input id="ff-insta" type="text" name="instaId" value={formData.instaId} onChange={handleChange} className={fieldClass} placeholder="@brand_handle" />
              </div>
            </fieldset>
            <fieldset className="space-y-4">
              <legend className={fieldsetLegendClass}>
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                Geography
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ff-state" className={labelClass}>State *</label>
                  <input id="ff-state" type="text" name="state" value={formData.state} required onChange={handleChange} className={fieldClass} placeholder="State" />
                </div>
                <div>
                  <label htmlFor="ff-district" className={labelClass}>District *</label>
                  <input id="ff-district" type="text" name="district" value={formData.district} required onChange={handleChange} className={fieldClass} placeholder="District" />
                </div>
              </div>
              <div>
                <label htmlFor="ff-venue" className={labelClass}>Exact Venue *</label>
                <input id="ff-venue" type="text" name="exactLocation" value={formData.exactLocation} required onChange={handleChange} className={fieldClass} placeholder="Production Location Details" />
              </div>
            </fieldset>
          </div>

          {/* Project Brief */}
          <fieldset className="space-y-4">
            <legend className={fieldsetLegendClass}>
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              Technical Brief
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ff-type" className={labelClass}> your Work Type *</label>
                <input id="ff-type" type="text" name="workType" value={formData.workType} required onChange={handleChange} className={fieldClass} placeholder="e.g. Ad Film" />
              </div>
              <div>
                <label htmlFor="ff-duration" className={labelClass}>Duration and time  *</label>
                <input id="ff-duration" type="text" name="workDuration" value={formData.workDuration} required onChange={handleChange} className={fieldClass} placeholder="e.g. 2 Days" />
              </div>
              <div>
                <label htmlFor="ff-budget" className={labelClass}>Budget (₹) *</label>
                <input id="ff-budget" type="number" name="price" value={formData.price} required onChange={handleChange} className={fieldClass} placeholder="Your Allocation" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ff-gadgets" className={labelClass}>required Gadgets *</label>
                <input id="ff-gadgets" type="text" name="deviceType" value={formData.deviceType} required onChange={handleChange} className={fieldClass} placeholder="e.g. RED, Arri, Drone" />
              </div>
              <div>
                <label htmlFor="ff-reference" className={labelClass}>video Reference Link *</label>
                <input id="ff-reference" type="url" name="referenceVideo" value={formData.referenceVideo} required onChange={handleChange} className={fieldClass} placeholder="YouTube/Drive Reference" />
              </div>
            </div>
          </fieldset>

          <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Archiving...</>
            ) : (
              <><Send className="w-5 h-5 transition-transform duration-500 ease-reveal group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /> Deploy Request</>
            )}
          </button>
        </form>
      </motion.div>
    </PageShell>
  );
}
