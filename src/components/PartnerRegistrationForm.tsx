'use client';

import { useState } from 'react';
import { registerPartner } from '@/app/actions/partners';
import { Check, Loader2, User, Camera, MapPin, Instagram, Mail, Briefcase, Wrench, Smartphone, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { btnArrow, btnGhost, btnPrimary, fieldClass, fieldsetLegendClass, labelClass, textareaClass } from './editorial/styles';

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
    portfolio_link: '',
    website_url: '', // honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await registerPartner({
        ...formData,
        turnstileToken: 'bypass',
      });

      if (!result.success) {
        throw new Error(result.error || 'Something went wrong.');
      }

      setIsSuccess(true);
      setFormData({
        name: '', whatsapp: '', insta_id: '', gmail: '', state: '', district: '',
        exact_location: '', skills: '', equipments: '', experience: '',
        portfolio_link: '',
        website_url: '',
      });
    } catch (err: unknown) {
      setSubmitError((err instanceof Error && err.message) || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-paper border border-ink/15 rounded-[4px] overflow-hidden" role="status">
        <div className="h-1 bg-coral" aria-hidden="true" />
        <div className="py-16 px-6 sm:px-10 text-center">
          <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-ink" aria-hidden="true" />
          </div>
          <h3 className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em] mb-3">Application Received!</h3>
          <p className="text-ink/65 text-lg max-w-md mx-auto">Thank you for joining our partner network. We&apos;ll review your details and get in touch soon.</p>
          <button type="button" onClick={() => setIsSuccess(false)} className={`${btnGhost} mt-8`}>
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-ink/15 rounded-[4px] overflow-hidden shadow-[0_40px_80px_-50px_rgb(var(--ink-rgb)/0.5)]">
      <div className="h-1 bg-coral" aria-hidden="true" />
      <div className="p-6 sm:p-10">
        <div className="mb-10">
          <p className="slate text-editorial mb-3">Cwaya · Partner network</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-[-0.03em] mb-2">
            Partner <span className="text-editorial">Registration</span>
          </h2>
          <p className="text-ink/65 text-lg">
            Join our professional network and start getting high-quality shoot leads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Personal Info Section */}
          <fieldset>
            <legend className={fieldsetLegendClass}>
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              01 — Contact Information
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pr-name" className={labelClass}>Full Name</label>
                <input id="pr-name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" className={fieldClass} required />
              </div>
              <div>
                <label htmlFor="pr-whatsapp" className={labelClass}>
                  <Smartphone className="w-3 h-3" aria-hidden="true" /> WhatsApp Number
                </label>
                <input id="pr-whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="+91 00000 00000" className={fieldClass} required />
              </div>
              <div>
                <label htmlFor="pr-insta" className={labelClass}>
                  <Instagram className="w-3 h-3" aria-hidden="true" /> Instagram ID
                </label>
                <input id="pr-insta" name="insta_id" value={formData.insta_id} onChange={handleInputChange} placeholder="@your_id" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="pr-gmail" className={labelClass}>
                  <Mail className="w-3 h-3" aria-hidden="true" /> Gmail Address
                </label>
                <input id="pr-gmail" type="email" name="gmail" value={formData.gmail} onChange={handleInputChange} placeholder="your.name@gmail.com" className={fieldClass} />
              </div>
            </div>
          </fieldset>

          {/* Location Section */}
          <fieldset className="space-y-4">
            <legend className={fieldsetLegendClass}>
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              02 — Service Area
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pr-state" className={labelClass}>State</label>
                <input id="pr-state" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g. Madhya Pradesh" className={fieldClass} required />
              </div>
              <div>
                <label htmlFor="pr-district" className={labelClass}>District</label>
                <input id="pr-district" name="district" value={formData.district} onChange={handleInputChange} placeholder="e.g. Indore" className={fieldClass} required />
              </div>
            </div>
            <div>
              <label htmlFor="pr-location" className={labelClass}>Exact Location / Address</label>
              <input id="pr-location" name="exact_location" value={formData.exact_location} onChange={handleInputChange} placeholder="Your specific area or studio address" className={fieldClass} required />
            </div>
          </fieldset>

          {/* Professional Details Section */}
          <fieldset className="space-y-4">
            <legend className={fieldsetLegendClass}>
              <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
              03 — Skills &amp; Experience
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pr-skills" className={labelClass}>
                  <Wrench className="w-3 h-3" aria-hidden="true" /> Your Skills
                </label>
                <input id="pr-skills" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. Cinematic Shoot, Video Editing" className={fieldClass} required />
              </div>
              <div>
                <label htmlFor="pr-experience" className={labelClass}>Years of Experience</label>
                <input id="pr-experience" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 3 Years" className={fieldClass} required />
              </div>
            </div>
            <div>
              <label htmlFor="pr-equipments" className={labelClass}>
                <Camera className="w-3 h-3" aria-hidden="true" /> Equipments You Own
              </label>
              <textarea id="pr-equipments" name="equipments" value={formData.equipments} onChange={handleInputChange} rows={3} placeholder="List your camera, lenses, gimbal, etc." className={textareaClass} required />
            </div>
            <div>
              <label htmlFor="pr-portfolio" className={labelClass}>
                <LinkIcon className="w-3 h-3" aria-hidden="true" /> Portfolio Link (Website / Drive / PDF)
              </label>
              <input id="pr-portfolio" name="portfolio_link" value={formData.portfolio_link} onChange={handleInputChange} placeholder="https://..." className={fieldClass} />
            </div>
          </fieldset>

          {/* Honeypot */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input name="website_url" value={formData.website_url} onChange={handleInputChange} tabIndex={-1} autoComplete="off" />
          </div>

          <div className="space-y-3">
            {submitError && <p role="alert" className="text-destructive text-sm">{submitError}</p>}

            <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-label="Submitting" />
              ) : (
                <>
                  Register as Partner
                  <ArrowRight className={btnArrow} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
