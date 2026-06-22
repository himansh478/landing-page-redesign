'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from './ui/dialog';
import { Turnstile } from '@marsidev/react-turnstile';
import { createBooking } from '@/app/actions/bookings';
import { Check, Loader2, User, Video, CreditCard, Link as LinkIcon, MapPin } from 'lucide-react';

interface ServiceBookingFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedService: string;
}

const shootTypes = [
  'Wedding Shoot',
  'Insta & YouTube Video Shoot',
  'Commercial Shoot',
  'Corporate Event Shoot',
  'Marketing Shoot',
  'Religious Shoot',
  'Political Shoot',
  'Cinematic Shoot',
];

const editingServices = [
  'Vlog Edit',
  'Documentary Edit',
  'Reel Edit',
  'AI Edit',
  'Custom Edit',
  'Wedding Edit',
  'Professional Shoot',
];

const locationOptions = [
  'Sehore', 'Bhopal', 'Indore', 'Gwalior', 'Ujjain', 'Jabalpur',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all";

export function ServiceBookingForm({ isOpen, onOpenChange, selectedService }: ServiceBookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    location: '',
    editingOption: selectedService || '',
    projectTitle: '',
    description: '',
    budget: '',
    timeline: '',
    referenceVideoLink: '',
    website_url: '', // honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && selectedService) {
      setFormData(prev => ({ ...prev, editingOption: selectedService }));
    }
    if (!isOpen) {
      setTurnstileToken(null);
      setIsSuccess(false);
    }
  }, [isOpen, selectedService]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isShootBooking = shootTypes.includes(formData.editingOption);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.website_url) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
       const result = await createBooking({
         ...formData,
         turnstileToken: 'bypass',
       });

      if (!result.success) {
        throw new Error(result.error || 'Something went wrong.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setFormData({
          name: '', email: '', whatsappNumber: '', location: '',
          editingOption: '',
          projectTitle: '', description: '', budget: '', timeline: '',
          referenceVideoLink: '',
          website_url: '',
        });
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border border-white/10 p-0 overflow-hidden rounded-[32px] shadow-2xl">
        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold text-white">
              Book Your <span className="text-purple-500">Experience</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-lg">
              Let's bring your vision to life. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Booking Received!</h3>
              <p className="text-zinc-400">We'll get back to you shortly.</p>
            </div>
          ) : (
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
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className={inputClass} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 ml-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className={inputClass} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 ml-1">WhatsApp Number</label>
                    <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="+91 00000 00000" className={inputClass} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 ml-1">Location</label>
                    <input list="locations" name="location" value={formData.location} onChange={handleInputChange} placeholder="Your City" className={inputClass} required />
                    <datalist id="locations">
                      {locationOptions.map(l => <option key={l} value={l} />)}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Service Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm mb-4">
                  <Video className="w-4 h-4 text-purple-500" />
                  Service Details
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 ml-1">Select Service Type</label>
                  <select name="editingOption" value={formData.editingOption} onChange={handleInputChange} className={inputClass} required>
                    <option value="" className="bg-zinc-950">Choose a service</option>
                    <optgroup label="Professional Shoots" className="bg-zinc-950 text-purple-400">
                      {shootTypes.map(opt => <option key={opt} value={opt} className="bg-zinc-950 text-white">{opt}</option>)}
                    </optgroup>
                    <optgroup label="Creative Editing" className="bg-zinc-950 text-purple-400">
                      {editingServices.map(opt => <option key={opt} value={opt} className="bg-zinc-950 text-white">{opt}</option>)}
                    </optgroup>
                  </select>
                </div>
                {!isShootBooking && (
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 ml-1">Project Title</label>
                    <input name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} placeholder="e.g., Summer Campaign 2026" className={inputClass} />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 ml-1">Requirements / Event Details</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Tell us more about your vision..." className={inputClass + " resize-none"} />
                </div>
              </div>

              {/* Budget & Timeline Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-sm mb-4">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  Logistics
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 ml-1">Budget Range</label>
                    <select name="budget" value={formData.budget} onChange={handleInputChange} className={inputClass} required>
                      <option value="" className="bg-zinc-950">Select budget</option>
                      {['₹0-500', '₹500-1000', '₹1000-2500', '₹2500-5000', '₹5000+'].map(b => (
                        <option key={b} value={b} className="bg-zinc-950">{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 ml-1">Timeline</label>
                    <select name="timeline" value={formData.timeline} onChange={handleInputChange} className={inputClass} required>
                      <option value="" className="bg-zinc-950">Select timeline</option>
                      {['Urgent (24-48h)', 'ASAP (3-7 days)', '1-2 weeks', 'Flexible'].map(t => (
                        <option key={t} value={t} className="bg-zinc-950">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 ml-1 flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Reference Link (Optional)
                  </label>
                  <input type="url" name="referenceVideoLink" value={formData.referenceVideoLink} onChange={handleInputChange} placeholder="YouTube/Drive link" className={inputClass} />
                </div>
              </div>

              {/* Honeypot */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input name="website_url" value={formData.website_url} onChange={handleInputChange} tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex flex-col items-center gap-6 pt-4">
                {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group relative overflow-hidden bg-white text-black py-5 rounded-2xl font-bold text-lg transition-all hover:bg-purple-500 hover:text-white disabled:opacity-50"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
