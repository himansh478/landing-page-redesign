import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

interface TechnicalService {
  id: number;
  title: string;
  gradient: string;
}

interface TechnicalSolutionFormProps {
  service: TechnicalService;
  onClose: () => void;
}

const fieldClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all";

export function TechnicalSolutionForm({ service, onClose }: TechnicalSolutionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    whatsappNumber: '',
    location: '',
    serviceType: service.title,
    description: '',
    message: '',
    website_url: '', // honeypot
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Sync service title when service prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, serviceType: service.title }));
  }, [service]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot check
    if (formData.website_url) {
      return;
    }

    if (!turnstileToken) {
      alert('Please complete the CAPTCHA check.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('technical_bookings').insert([{
        name: formData.name,
        whatsapp_number: formData.whatsappNumber,
        location: formData.location,
        service_type: formData.serviceType,
        description: formData.description,
        message: formData.message || null,
      }]);

      if (error) throw error;

      setIsLoading(false);
      setIsSubmitted(true);
      setTurnstileToken(null);
      
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          name: '',
          whatsappNumber: '',
          location: '',
          serviceType: service.title,
          description: '',
          message: '',
          website_url: '',
        });
      }, 3000);
    } catch (err: any) {
      console.error('Supabase technical booking error:', err);
      alert('Failed to submit booking. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-indigo-500/10"
        >
          {/* colored header */}
          <div className={`sticky top-0 bg-gradient-to-r ${service.gradient} p-8 flex items-center justify-between z-10`}>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Book {service.title}</h2>
              <p className="text-white/90 text-sm mt-1 font-light">Fill in your details to get started</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20`}
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Booking Confirmed!</h3>
                <p className="text-slate-500 text-center max-w-sm font-light">
                  Thank you for booking {service.title}. We'll contact you shortly on your WhatsApp number.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-900 font-bold mb-2">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      required placeholder="Enter your full name" className={fieldClass} />
                  </div>
                  <div>
                    <label className="block text-slate-900 font-bold mb-2">WhatsApp Number *</label>
                    <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange}
                      required placeholder="Enter your WhatsApp number" className={fieldClass} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-900 font-bold mb-2">Location *</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange}
                      required placeholder="Enter your city/location" className={fieldClass} />
                  </div>
                  <div>
                    <label className="block text-slate-900 font-bold mb-2">Service Type *</label>
                    <select name="serviceType" value={formData.serviceType} onChange={handleChange}
                      required className={fieldClass}>
                      <option value="Website Design">Website Design</option>
                      <option value="Automation">Automation</option>
                      <option value="AI Bot">AI Bot</option>
                      <option value="Insta Auto Reply">Insta Auto Reply</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-2">Project Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    required placeholder="Describe your project requirements in detail"
                    rows={4} className={fieldClass + " resize-none"} />
                </div>

                {/* Honeypot field (hidden from humans) */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                </div>

                {/* Cloudflare Turnstile CAPTCHA */}
                <div className="flex justify-center py-2">
                  <Turnstile 
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className={`w-full bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </motion.button>

                <p className="text-slate-400 text-sm text-center font-light">
                  We'll contact you shortly to confirm your booking details.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
