'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Bot, Code, Zap, MessageSquare, X, Check, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TechnicalBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: {
    title: string;
    icon: React.ReactNode;
  } | null;
}

const fieldClass = "w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[24px] text-white placeholder-zinc-500 focus:border-indigo-500 focus:bg-white/10 focus:outline-none transition-all duration-300 text-sm";
const labelClass = "block text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] mb-3 ml-2";

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-white/10 rounded-[48px] max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl relative"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] -mr-48 -mt-48 pointer-events-none" />

            {/* Header */}
            <div className="p-10 flex items-center justify-between border-b border-white/5 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {selectedService?.icon || <Code className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter uppercase leading-none mb-2">Initiate <br /> <span className="text-indigo-500">Project.</span></h2>
                  <p className="text-zinc-500 text-sm font-light tracking-widest uppercase">Protocol: {selectedService?.title || 'Custom Development'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto max-h-[calc(95vh-160px)] relative z-10">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-10">
                    <Check className="w-12 h-12 text-emerald-500" strokeWidth={3} />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Transmission Successful</h3>
                  <p className="text-zinc-500 text-lg font-light max-w-md leading-relaxed">
                    Our technical lead will contact you via <span className="text-white font-medium">WhatsApp</span> to discuss the architecture of your project.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <label className={labelClass}>Lead Identity</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" className={fieldClass} />
                    </div>
                    <div className="group">
                      <label className={labelClass}>WhatsApp Node</label>
                      <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={fieldClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <label className={labelClass}>Deployment Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="City, State" className={fieldClass} />
                    </div>
                    <div className="group">
                      <label className={labelClass}>System Module</label>
                      <select name="serviceType" value={formData.serviceType || selectedService?.title} onChange={handleChange} required className={fieldClass + " appearance-none"}>
                        <option value="Website Design">Website Design</option>
                        <option value="Automation">Workflow Automation</option>
                        <option value="AI Bot">Intelligent AI Bot</option>
                        <option value="Insta Auto Reply">DM Automation</option>
                      </select>
                    </div>
                  </div>

                  <div className="group">
                    <label className={labelClass}>Architecture Requirements</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required
                      placeholder="Define your project objectives, tech stack preferences, and core functionalities..." rows={4} className={fieldClass + " resize-none"} />
                  </div>

                  {/* Honeypot */}
                  <div style={{ display: 'none' }}>
                    <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-white text-black py-7 px-8 rounded-[24px] font-black uppercase tracking-[0.3em] text-sm transition-all disabled:opacity-50 shadow-2xl flex items-center justify-center gap-4 hover:bg-indigo-500 hover:text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      'Book Now'
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
