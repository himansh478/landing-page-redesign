'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Code, Check, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ModalShell } from './editorial/ModalShell';
import { btnArrow, btnPrimary, fieldClass, labelClass, selectClass, textareaClass } from './editorial/styles';

interface TechnicalBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: {
    title: string;
    icon: React.ReactNode;
  } | null;
}

export function TechnicalBookingForm({ isOpen, onClose, selectedService }: TechnicalBookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    location: '',
    serviceType: selectedService?.title || '',
    description: '',
    message: '',
    website_url: '', // honeypot
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.website_url) return;

    setIsLoading(true);

    const { error } = await supabase.from('technical_bookings').insert([{
      name: formData.name,
      whatsapp_number: formData.whatsappNumber,
      location: formData.location,
      service_type: formData.serviceType || selectedService?.title,
      description: formData.description,
      message: formData.message,
    }]);

    setIsLoading(false);

    if (error) {
      console.error('Technical booking error:', error);
      alert('Failed to initiate protocol. Please check your connection.');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setFormData({ name: '', whatsappNumber: '', location: '', serviceType: '', description: '', message: '', website_url: '' });
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalShell onClose={onClose} labelledBy="tech-booking-title" className="max-w-3xl">
          {/* Header */}
          <div className="p-6 sm:p-8 pr-16 flex items-center gap-5 border-b border-ink/15">
            <div className="w-14 h-14 flex-shrink-0 rounded-md bg-editorial text-ivory flex items-center justify-center [&_svg]:w-7 [&_svg]:h-7">
              {selectedService?.icon || <Code className="w-7 h-7" aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <h2 id="tech-booking-title" className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em] leading-none mb-2">
                Initiate <span className="text-editorial">Project.</span>
              </h2>
              <p className="slate text-ink/55 truncate">Protocol: {selectedService?.title || 'Custom Development'}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
                role="status"
              >
                <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center mb-8">
                  <Check className="w-8 h-8 text-ink" strokeWidth={3} aria-hidden="true" />
                </div>
                <h3 className="font-display text-3xl font-extrabold text-ink mb-4 tracking-[-0.03em]">Transmission Successful</h3>
                <p className="text-ink/65 text-lg max-w-md leading-relaxed">
                  Our technical lead will contact you via <span className="text-ink font-semibold">WhatsApp</span> to discuss the architecture of your project.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="tb-name" className={labelClass}>Lead Identity</label>
                    <input id="tb-name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="tb-whatsapp" className={labelClass}>WhatsApp Node</label>
                    <input id="tb-whatsapp" type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="tb-location" className={labelClass}>Deployment Location</label>
                    <input id="tb-location" type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="City, State" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="tb-module" className={labelClass}>System Module</label>
                    <select id="tb-module" name="serviceType" value={formData.serviceType || selectedService?.title} onChange={handleChange} required className={selectClass}>
                      <option value="Website Design">Website Design</option>
                      <option value="Automation">Workflow Automation</option>
                      <option value="AI Bot">Intelligent AI Bot</option>
                      <option value="Insta Auto Reply">DM Automation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="tb-description" className={labelClass}>Architecture Requirements</label>
                  <textarea id="tb-description" name="description" value={formData.description} onChange={handleChange} required
                    placeholder="Define your project objectives, tech stack preferences, and core functionalities..." rows={4} className={textareaClass} />
                </div>

                {/* Honeypot */}
                <div style={{ display: 'none' }}>
                  <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} />
                </div>

                <button disabled={isLoading} type="submit" className={`${btnPrimary} w-full`}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Synchronizing...
                    </>
                  ) : (
                    <>
                      Book Now
                      <ArrowRight className={btnArrow} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </ModalShell>
      )}
    </AnimatePresence>
  );
}
