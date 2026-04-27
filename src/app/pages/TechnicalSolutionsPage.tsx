import { motion, AnimatePresence } from 'motion/react';
import { Bot, Code, Zap, MessageSquare, ArrowRight, X, Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

// service data
const technicalServices = [
  {
    id: 1,
    title: 'Website Design',
    icon: <Code className="w-8 h-8" />,
    description: 'Custom website design and development tailored to your brand',
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Modern UI/UX'],
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 2,
    title: 'Automation',
    icon: <Zap className="w-8 h-8" />,
    description: 'Automate your workflow and business processes',
    features: ['Process Automation', 'Time Saving', 'Error Reduction', 'Scalability'],
    gradient: 'from-yellow-600 to-orange-600',
  },
  {
    id: 3,
    title: 'AI Bot',
    icon: <Bot className="w-8 h-8" />,
    description: 'Intelligent chatbots powered by AI for customer support',
    features: ['24/7 Support', 'Smart Responses', 'Multi-language', 'Learning Enabled'],
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 4,
    title: 'Insta Auto Reply',
    icon: <MessageSquare className="w-8 h-8" />,
    description: 'Automated Instagram direct message responses',
    features: ['Instant Replies', 'Custom Messages', 'Lead Capture', 'Analytics'],
    gradient: 'from-pink-600 to-rose-600',
  },
];

const fieldClass = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all";

// inline booking form for tech services
function BookingForm({ service, onClose }: { service: typeof technicalServices[0]; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '', whatsappNumber: '', location: '',
    serviceType: service.title, description: '', message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.from('technical_bookings').insert([{
      name: formData.name,
      whatsapp_number: formData.whatsappNumber,
      location: formData.location,
      service_type: formData.serviceType,
      description: formData.description,
      message: formData.message,
    }]);

    setIsLoading(false);

    if (error) {
      console.error('Supabase technical booking error:', error);
      alert('Failed to submit booking. Please try again.');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setFormData({ name: '', whatsappNumber: '', location: '', serviceType: service.title, description: '', message: '' });
    }, 3000);
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
          className="bg-white rounded-[40px] border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* header */}
          <div className="sticky top-0 bg-slate-50 p-8 flex items-center justify-between z-10 border-b border-slate-100">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Book {service.title}</h2>
              <p className="text-slate-500 font-light mt-1 text-base">Fill in your details to get started with our technical team.</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isSubmitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }} className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <Check className="w-12 h-12 text-blue-600" strokeWidth={3} />
                </motion.div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Booking Confirmed!</h3>
                <p className="text-slate-500 text-center max-w-sm font-light text-lg">
                  Thank you for booking {service.title}. We'll contact you shortly on your WhatsApp number.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-slate-900 font-bold uppercase tracking-widest text-[10px]">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your Name" className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-900 font-bold uppercase tracking-widest text-[10px]">WhatsApp Number *</label>
                    <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={fieldClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-slate-900 font-bold uppercase tracking-widest text-[10px]">Location *</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="City, State" className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-900 font-bold uppercase tracking-widest text-[10px]">Service Type *</label>
                    <select name="serviceType" value={formData.serviceType} onChange={handleChange} required className={fieldClass + " appearance-none"}>
                      <option value="Website Design">Website Design</option>
                      <option value="Automation">Automation</option>
                      <option value="AI Bot">AI Bot</option>
                      <option value="Insta Auto Reply">Insta Auto Reply</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-900 font-bold uppercase tracking-widest text-[10px]">Project Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required
                    placeholder="Describe your project requirements in detail..." rows={4} className={fieldClass + " resize-none"} />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-900 font-bold uppercase tracking-widest text-[10px]">Additional Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange}
                    placeholder="Any specific questions for our team?" rows={2} className={fieldClass + " resize-none"} />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-slate-900 text-white py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-xl shadow-slate-200 hover:bg-blue-600"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TechnicalSolutionsPage() {
  const [selectedService, setSelectedService] = useState<typeof technicalServices[0] | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleBookNow = (service: typeof technicalServices[0]) => {
    setSelectedService(service);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* hero */}
      <div className="pt-20 pb-16 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05)_0%,transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Technical <span className="text-gradient">Solutions</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
              Empower your business with cutting-edge technology. From custom web development to intelligent automation.
            </p>
          </motion.div>
        </div>
      </div>

      {/* services grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technicalServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-[40px] p-8 border border-slate-100 hover:border-blue-200 transition-all shadow-2xl shadow-slate-200/50"
            >
              <div className="inline-flex p-4 rounded-2xl bg-slate-50 text-slate-900 mb-6 relative z-10 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                {service.icon}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10 uppercase tracking-tight">{service.title}</h3>
              <p className="text-slate-500 mb-6 text-base font-light relative z-10">{service.description}</p>

              <ul className="space-y-3 mb-8 relative z-10">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <Check className="w-4 h-4 text-blue-500" strokeWidth={3} />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBookNow(service)}
                className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all relative z-10 shadow-xl shadow-slate-200 group-hover:bg-blue-600 group-hover:shadow-blue-500/20"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* bottom cta */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
              Scale Your <span className="text-blue-400">Business</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 font-light leading-relaxed">
              We build intelligent systems that work for you. Let's discuss your technical requirements.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-blue-500/40 transition-all hover:bg-blue-500 active:scale-95 uppercase tracking-widest text-sm"
            >
              Contact Developer
            </motion.button>
          </motion.div>
        </div>
      </section>

      {showForm && selectedService && (
        <BookingForm service={selectedService} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
