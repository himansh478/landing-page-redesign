import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

interface InnerCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// shared input class for all fields
const fieldClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium";

const defaultForm = {
  name: '', age: '', achievement: '', topSkill: '',
  state: '', district: '', location: '',
  whatsappNumber: '', gmail: '', portfolioLink: '',
  website_url: '' // honeypot
};

export function InnerCircleModal({ isOpen, onClose }: InnerCircleModalProps) {
  const [formData, setFormData] = useState({ ...defaultForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.website_url) {
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the CAPTCHA check.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: formData.name,
      age: parseInt(formData.age),
      achievement: formData.achievement,
      top_skill: formData.topSkill,
      state: formData.state,
      district: formData.district,
      location: formData.location,
      whatsapp_number: formData.whatsappNumber,
      gmail: formData.gmail,
      portfolio_link: formData.portfolioLink,
    };

    const { error: dbError } = await supabase
      .from('inner_circle_applications')
      .insert([payload]);

    setLoading(false);

    if (dbError) {
      setError('Failed to submit application. Please try again.');
      return;
    }

    onClose();
    setFormData({ ...defaultForm });
    setTurnstileToken(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // field config to reduce repetition
  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
    { id: 'age', label: 'Age', type: 'number', placeholder: 'Enter your age', min: '10', max: '60' },
    { id: 'topSkill', label: 'Top Skill', type: 'text', placeholder: 'e.g., Digital Marketing, Video Editing, Business Strategy' },
    { id: 'state', label: 'State', type: 'text', placeholder: 'Enter your state' },
    { id: 'district', label: 'District', type: 'text', placeholder: 'Enter your district' },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'Enter your city/town' },
    { id: 'whatsappNumber', label: 'WhatsApp Number', type: 'tel', placeholder: 'e.g., +91 9XXXXXXXXX' },
    { id: 'gmail', label: 'Gmail Address', type: 'email', placeholder: 'your.email@gmail.com' },
    { id: 'portfolioLink', label: 'Portfolio Link', type: 'url', placeholder: 'https://yourportfolio.com' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl shadow-indigo-500/10"
            >
              {/* header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 p-8 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    Join the <span className="text-gradient">Inner Circle</span>
                  </h2>
                  <p className="text-slate-500 font-light">
                    Unlock exclusive benefits and priority access
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* regular text/email/tel/url fields */}
                {fields.map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="block text-slate-700 font-bold mb-2">
                      {f.label} <span className="text-indigo-500">*</span>
                    </label>
                    <input
                      type={f.type}
                      id={f.id}
                      name={f.id}
                      value={(formData as any)[f.id]}
                      onChange={handleChange}
                      required
                      placeholder={f.placeholder}
                      className={fieldClass}
                      {...(f.min ? { min: f.min } : {})}
                      {...(f.max ? { max: f.max } : {})}
                    />
                  </div>
                ))}

                {/* achievement textarea - separate because it's multi-line */}
                <div>
                  <label htmlFor="achievement" className="block text-slate-700 font-bold mb-2">
                    Your Top Achievement <span className="text-indigo-500">*</span>
                  </label>
                  <textarea
                    id="achievement"
                    name="achievement"
                    value={formData.achievement}
                    onChange={handleChange}
                    required
                    rows={3}
                    className={fieldClass + " resize-none"}
                    placeholder="Tell us about your greatest achievement"
                  />
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

                <div className="pt-4">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </motion.button>
                </div>

                <p className="text-center text-slate-400 text-sm font-light">
                  By submitting, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
