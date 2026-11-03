'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from './ui/dialog';
import { createBooking } from '@/app/actions/bookings';
import { Check, Loader2, User, Video, CreditCard, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { btnArrow, btnPrimary, fieldClass, fieldsetLegendClass, labelClass, selectClass, textareaClass } from './editorial/styles';

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
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync the chosen service when the dialog opens, and clear the success
  // state when it closes (adjusting state on prop change, not in an effect).
  const [prev, setPrev] = useState({ isOpen, selectedService });
  if (prev.isOpen !== isOpen || prev.selectedService !== selectedService) {
    setPrev({ isOpen, selectedService });
    if (isOpen && selectedService) {
      setFormData(p => ({ ...p, editingOption: selectedService }));
    }
    if (!isOpen) {
      setIsSuccess(false);
    }
  }

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
    } catch (err: unknown) {
      setSubmitError((err instanceof Error && err.message) || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden rounded-md">
        <div className="h-1 bg-coral" aria-hidden="true" />
        <div className="max-h-[88vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="mb-8 text-left pr-10">
            <p className="slate text-editorial mb-2">Cwaya · Booking</p>
            <DialogTitle className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] leading-[1.05]">
              Book Your <span className="text-editorial">Experience</span>
            </DialogTitle>
            <DialogDescription className="text-ink/65 text-base sm:text-lg pt-1">
              Let&apos;s bring your vision to life. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="py-16 text-center border-t border-ink/15" role="status">
              <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-ink" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-ink mb-2">Booking Received!</h3>
              <p className="text-ink/65">We&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-9">
              {/* Personal Info Section */}
              <fieldset>
                <legend className={fieldsetLegendClass}>
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  01 — Contact Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sb-name" className={labelClass}>Full Name</label>
                    <input id="sb-name" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className={fieldClass} required />
                  </div>
                  <div>
                    <label htmlFor="sb-email" className={labelClass}>Email Address</label>
                    <input id="sb-email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className={fieldClass} required />
                  </div>
                  <div>
                    <label htmlFor="sb-whatsapp" className={labelClass}>WhatsApp Number</label>
                    <input id="sb-whatsapp" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="+91 00000 00000" className={fieldClass} required />
                  </div>
                  <div>
                    <label htmlFor="sb-location" className={labelClass}>Location</label>
                    <input id="sb-location" list="locations" name="location" value={formData.location} onChange={handleInputChange} placeholder="Your City" className={fieldClass} required />
                    <datalist id="locations">
                      {locationOptions.map(l => <option key={l} value={l} />)}
                    </datalist>
                  </div>
                </div>
              </fieldset>

              {/* Service Details Section */}
              <fieldset className="space-y-4">
                <legend className={fieldsetLegendClass}>
                  <Video className="w-3.5 h-3.5" aria-hidden="true" />
                  02 — Service Details
                </legend>
                <div>
                  <label htmlFor="sb-service" className={labelClass}>Select Service Type</label>
                  <select id="sb-service" name="editingOption" value={formData.editingOption} onChange={handleInputChange} className={selectClass} required>
                    <option value="">Choose a service</option>
                    <optgroup label="Professional Shoots">
                      {shootTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </optgroup>
                    <optgroup label="Creative Editing">
                      {editingServices.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </optgroup>
                  </select>
                </div>
                {!isShootBooking && (
                  <div>
                    <label htmlFor="sb-title" className={labelClass}>Project Title</label>
                    <input id="sb-title" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} placeholder="e.g., Summer Campaign 2026" className={fieldClass} />
                  </div>
                )}
                <div>
                  <label htmlFor="sb-description" className={labelClass}>Requirements / Event Details</label>
                  <textarea id="sb-description" name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Tell us more about your vision..." className={textareaClass} />
                </div>
              </fieldset>

              {/* Budget & Timeline Section */}
              <fieldset className="space-y-4">
                <legend className={fieldsetLegendClass}>
                  <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                  03 — Logistics
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sb-budget" className={labelClass}>Budget Range</label>
                    <select id="sb-budget" name="budget" value={formData.budget} onChange={handleInputChange} className={selectClass} required>
                      <option value="">Select budget</option>
                      {['₹0-500', '₹500-1000', '₹1000-2500', '₹2500-5000', '₹5000+'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sb-timeline" className={labelClass}>Timeline</label>
                    <select id="sb-timeline" name="timeline" value={formData.timeline} onChange={handleInputChange} className={selectClass} required>
                      <option value="">Select timeline</option>
                      {['Urgent (24-48h)', 'ASAP (3-7 days)', '1-2 weeks', 'Flexible'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="sb-reference" className={labelClass}>
                    <LinkIcon className="w-3 h-3" aria-hidden="true" /> Reference Link (Optional)
                  </label>
                  <input id="sb-reference" type="url" name="referenceVideoLink" value={formData.referenceVideoLink} onChange={handleInputChange} placeholder="YouTube/Drive link" className={fieldClass} />
                </div>
              </fieldset>

              {/* Honeypot */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input name="website_url" value={formData.website_url} onChange={handleInputChange} tabIndex={-1} autoComplete="off" />
              </div>

              <div className="pt-2 space-y-3">
                {submitError && <p role="alert" className="text-destructive text-sm">{submitError}</p>}

                <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" aria-label="Submitting" />
                  ) : (
                    <>
                      Confirm Booking
                      <ArrowRight className={btnArrow} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
