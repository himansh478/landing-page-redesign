import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InnerCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InnerCircleModal({ isOpen, onClose }: InnerCircleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    achievement: '',
    topSkill: '',
    state: '',
    district: '',
    location: '',
    whatsappNumber: '',
    gmail: '',
    portfolioLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Transform form data to match backend field names
    const submitData = {
      name: formData.name,
      age: parseInt(formData.age),
      achievement: formData.achievement,
      top_skill: formData.topSkill,
      state: formData.state,
      district: formData.district,
      location: formData.location,
      whatsapp_number: formData.whatsappNumber,
      gmail: formData.gmail,
      portfolio_link: formData.portfolioLink
    };

    // Send data to backend API
    const apiUrl = `${import.meta.env.VITE_API_URL}/inner-circle-applications/`;
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        return response.json();
      })
      .then(data => {
        console.log('Form submitted successfully:', data);
        alert('Application submitted successfully! We\'ll be in touch soon.');
        onClose();
        setFormData({
          name: '',
          age: '',
          achievement: '',
          topSkill: '',
          state: '',
          district: '',
          location: '',
          whatsappNumber: '',
          gmail: '',
          portfolioLink: ''
        });
      })
      .catch(err => {
        console.error('Error submitting form:', err);
        setError('Failed to submit application. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl shadow-indigo-500/10"
            >
              {/* Header */}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-slate-700 font-bold mb-2">
                    Full Name <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-slate-700 font-bold mb-2">
                    Age <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="Enter your age"
                  />
                </div>

                {/* Achievement */}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                    placeholder="Tell us about your greatest achievement"
                  />
                </div>

                {/* Top Skill */}
                <div>
                  <label htmlFor="topSkill" className="block text-slate-700 font-bold mb-2">
                    Top Skill <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="topSkill"
                    name="topSkill"
                    value={formData.topSkill}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="e.g., Digital Marketing, Video Editing, Business Strategy"
                  />
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-slate-700 font-bold mb-2">
                    State <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="Enter your state"
                  />
                </div>

                {/* District */}
                <div>
                  <label htmlFor="district" className="block text-slate-700 font-bold mb-2">
                    District <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="Enter your district"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-slate-700 font-bold mb-2">
                    Location <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="Enter your city/town"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label htmlFor="whatsappNumber" className="block text-slate-700 font-bold mb-2">
                    WhatsApp Number <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="e.g., +91 9XXXXXXXXX"
                  />
                </div>

                {/* Gmail */}
                <div>
                  <label htmlFor="gmail" className="block text-slate-700 font-bold mb-2">
                    Gmail Address <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="gmail"
                    name="gmail"
                    value={formData.gmail}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="your.email@gmail.com"
                  />
                </div>

                {/* Portfolio Link */}
                <div>
                  <label htmlFor="portfolioLink" className="block text-slate-700 font-bold mb-2">
                    Portfolio Link <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="portfolioLink"
                    name="portfolioLink"
                    value={formData.portfolioLink}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                {/* Submit Button */}
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
