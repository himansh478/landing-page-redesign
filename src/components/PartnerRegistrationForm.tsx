'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { supabase } from '@/lib/supabase';
import { Check, Loader2, User, Camera, MapPin, Instagram, Mail, Briefcase, Wrench, Smartphone } from 'lucide-react';

const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all";

export function PartnerRegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    insta_id: '',
    gmail: '',
    state: '',
    district: '',
    exact_location: '',
    skills: '',
    equipments: '',
    experience: '',
    website_url: '', // honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.website_url) return;
    if (!turnstileToken) {
      setSubmitError('Please complete the security check.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase.from('partners').insert([{
        name: formData.name,
        whatsapp: formData.whatsapp,
        insta_id: formData.insta_id,
        gmail: formData.gmail,
        state: formData.state,
        district: formData.district,
        exact_location: formData.exact_location,
        skills: formData.skills,
        equipments: formData.equipments,
        experience: formData.experience,
      }]);

      if (error) throw error;

      setIsSuccess(true);
      setFormData({
        name: '', whatsapp: '', insta_id: '', gmail: '', state: '', district: '',
        exact_location: '', skills: '', equipments: '', experience: '',
        website_url: '',
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-20 text-center bg-zinc-900/50 border border-white/10 rounded-[32px] p-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold mb-2 text-white">Application Received!</h3>
        <p className="text-zinc-400 text-lg">Thank you for joining our partner network. We'll review your details and get in touch soon.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-500 hover:text-white transition-all"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-sm">
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-white mb-2">
          Partner <span className="text-purple-500">Registration</span>
        </h2>
        <p className="text-zinc-400 text-lg">
          Join our professional network and start getting high-quality shoot leads.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm mb-4">
            <User className="w-4 h-4 text-purple-500" />
            Contact Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1">Full Name</label>
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1 flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> WhatsApp Number
              </label>
              <input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="+91 00000 00000" className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1 flex items-center gap-2">
                <Instagram className="w-3 h-3" /> Instagram ID
              </label>
              <input name="insta_id" value={formData.insta_id} onChange={handleInputChange} placeholder="@your_id" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1 flex items-center gap-2">
                <Mail className="w-3 h-3" /> Gmail Address
              </label>
              <input type="email" name="gmail" value={formData.gmail} onChange={handleInputChange} placeholder="your.name@gmail.com" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm mb-4">
            <MapPin className="w-4 h-4 text-purple-500" />
            Service Area
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1">State</label>
              <input name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g. Madhya Pradesh" className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1">District</label>
              <input name="district" value={formData.district} onChange={handleInputChange} placeholder="e.g. Indore" className={inputClass} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 ml-1">Exact Location / Address</label>
            <input name="exact_location" value={formData.exact_location} onChange={handleInputChange} placeholder="Your specific area or studio address" className={inputClass} required />
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm mb-4">
            <Briefcase className="w-4 h-4 text-purple-500" />
            Skills & Experience
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1 flex items-center gap-2">
                <Wrench className="w-3 h-3" /> Your Skills
              </label>
              <input name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. Cinematic Shoot, Video Editing" className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 ml-1">Years of Experience</label>
              <input name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 3 Years" className={inputClass} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 ml-1 flex items-center gap-2">
              <Camera className="w-3 h-3" /> Equipments You Own
            </label>
            <textarea name="equipments" value={formData.equipments} onChange={handleInputChange} rows={3} placeholder="List your camera, lenses, gimbal, etc." className={inputClass + " resize-none"} required />
          </div>
        </div>

        {/* Honeypot */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input name="website_url" value={formData.website_url} onChange={handleInputChange} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col items-center gap-6 pt-4">
          <Turnstile 
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
            onSuccess={(token) => setTurnstileToken(token)}
          />

          {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full group relative overflow-hidden bg-white text-black py-5 rounded-2xl font-bold text-lg transition-all hover:bg-purple-500 hover:text-white disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register as Partner'}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
