import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { createTechnicalBooking } from '@/app/actions/technical-bookings';
import { ModalShell } from './editorial/ModalShell';
import { btnArrow, btnPrimary, fieldClass, labelClass, selectClass, textareaClass } from './editorial/styles';

interface TechnicalService {
  id: number;
  title: string;
  gradient: string;
}

interface TechnicalSolutionFormProps {
  service: TechnicalService;
  onClose: () => void;
}

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

  // Sync service title when service prop changes (adjusted during render, not in an effect)
  const [prevService, setPrevService] = useState(service);
  if (prevService !== service) {
    setPrevService(service);
    setFormData(prev => ({ ...prev, serviceType: service.title }));
  }

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

    setIsLoading(true);

    try {
      const result = await createTechnicalBooking({
        ...formData,
        turnstileToken: 'bypass',
      });

      if (!result.success) {
        throw new Error(result.error || 'Something went wrong.');
      }

      setIsLoading(false);
      setIsSubmitted(true);

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
    } catch (err: unknown) {
      console.error('Supabase technical booking error:', err);
      alert((err instanceof Error && err.message) || 'Failed to submit booking. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <ModalShell onClose={onClose} labelledBy="tech-solution-title" className="max-w-2xl" zClass="z-[60]">
        <div className="p-6 sm:p-8 pr-16 border-b border-ink/15">
          <p className="slate text-editorial mb-2">Cwaya · Digital Architecture</p>
          <h2 id="tech-solution-title" className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em]">Book {service.title}</h2>
          <p className="text-ink/65 text-sm mt-1">Fill in your details to get started</p>
        </div>

        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
              role="status"
            >
              <div className="w-16 h-16 rounded-full bg-coral flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-ink" aria-hidden="true" />
              </div>
              <h3 className="font-display text-3xl font-extrabold text-ink mb-3 tracking-[-0.03em]">Booking Confirmed!</h3>
              <p className="text-ink/65 text-center max-w-sm">
                Thank you for booking {service.title}. We&apos;ll contact you shortly on your WhatsApp number.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="ts-name" className={labelClass}>Full Name *</label>
                  <input id="ts-name" type="text" name="name" value={formData.name} onChange={handleChange}
                    required placeholder="Enter your full name" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="ts-whatsapp" className={labelClass}>WhatsApp Number *</label>
                  <input id="ts-whatsapp" type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange}
                    required placeholder="Enter your WhatsApp number" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="ts-location" className={labelClass}>Location *</label>
                  <input id="ts-location" type="text" name="location" value={formData.location} onChange={handleChange}
                    required placeholder="Enter your city/location" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="ts-service" className={labelClass}>Service Type *</label>
                  <select id="ts-service" name="serviceType" value={formData.serviceType} onChange={handleChange}
                    required className={selectClass}>
                    <option value="Website Design">Website Design</option>
                    <option value="Automation">Automation</option>
                    <option value="AI Bot">AI Bot</option>
                    <option value="Insta Auto Reply">Insta Auto Reply</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ts-description" className={labelClass}>Project Description *</label>
                <textarea id="ts-description" name="description" value={formData.description} onChange={handleChange}
                  required placeholder="Describe your project requirements in detail"
                  rows={4} className={textareaClass} />
              </div>

              {/* Honeypot field (hidden from humans) */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} tabIndex={-1} autoComplete="off" />
              </div>

              <button disabled={isLoading} type="submit" className={`${btnPrimary} w-full`}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight className={btnArrow} aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="text-ink/55 text-sm text-center">
                We&apos;ll contact you shortly to confirm your booking details.
              </p>
            </form>
          )}
        </div>
      </ModalShell>
    </AnimatePresence>
  );
}
