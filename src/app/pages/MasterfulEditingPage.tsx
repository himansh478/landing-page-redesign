import { motion } from 'motion/react';
import { Youtube, Film, Sparkles, Wand2, Heart, ArrowLeft, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { ServiceBookingForm } from '../components/ServiceBookingForm';

// portfolio route map for each editing service
const portfolioRoutes: Record<string, string> = {
  'Vlog Edit': '/vlog-edit-portfolio',
  'Documentary Edit': '/documentary-portfolio',
  'Reel Edit': '/reel-portfolio',
  'AI Edit': '/ai-edit-portfolio',
  'Wedding Edit': '/wedding-portfolio',
};

const editingServices = [
  {
    id: 1,
    title: 'Vlog Edit',
    icon: <Youtube className="w-8 h-8" />,
    description: 'Professional vlog editing, transitions, and dynamic pacing',
    features: ['Jump cuts & transitions', 'Color correction', 'Background music', 'Text overlays & graphics'],
    image: '/images/vlog-image.png',
    price: '300 to 1000',
    gradient: 'from-red-600 to-orange-600',
  },
  {
    id: 2,
    title: 'Documentary Edit',
    icon: <Film className="w-8 h-8" />,
    description: 'documentary editing with professional grade',
    features: ['Pacing & Dynamic Visuals', 'Motion Graphics', 'B-roll integration', 'Subtitle integration'],
    image: '/images/documentry%20image.png',
    price: '300 to 2000',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 3,
    title: 'Reel Edit',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Viral Insta reels with trending effects and music',
    features: ['Trending transitions', 'Viral effects & filters', 'Beat-synced editing'],
    image: '/images/reel%20edit.png',
    price: '50 to 2000',
    gradient: 'from-pink-600 to-rose-600',
  },
  {
    id: 4,
    title: 'AI Edit',
    icon: <Wand2 className="w-8 h-8" />,
    description: 'AI-powered editing with smart cuts',
    features: ['AI auto-captions', 'Voice enhancement', 'Smart scene detection', 'AI-generated B-roll', 'AI Characters & Avatars', 'AI Visuals and Graphics'],
    image: '/images/Ai%20edit.png',
    price: '600 to 5000',
    gradient: 'from-purple-600 to-violet-600',
  },
  {
    id: 6,
    title: 'Wedding Edit',
    icon: <Heart className="w-8 h-8" />,
    description: 'Beautiful wedding film editing with emotional storytelling and highlights',
    features: ['Cinematic highlights reel', 'Full ceremony edit', 'Romantic color grading', 'Audio from vows & speeches', 'Multiple format delivery'],
    image: '/images/wedding%20edit.png',
    price: '500 to 5000',
    gradient: 'from-rose-600 to-pink-600',
  },
];

export function MasterfulEditingPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const handleServiceClick = (title: string) => {
    setSelectedService(title);
    setIsModalOpen(true);
  };

  const handleViewSample = (title: string) => {
    navigate(portfolioRoutes[title] || '/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* sticky header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group">
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* hero */}
      <section className="py-20 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05)_0%,transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Masterful <span className="text-gradient">Editing</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
              Transform raw footage into captivating stories. Specialized editing services crafted for every cinematic need.
            </p>
          </motion.div>
        </div>
      </section>

      {/* services grid */}
      <section className="py-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {editingServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all shadow-2xl shadow-slate-200/50"
              >
                <div className="relative h-64 overflow-hidden p-2">
                  <div className="w-full h-full overflow-hidden rounded-[32px]">
                    <img src={service.image} alt={service.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] m-2" />

                  <div className="absolute top-6 right-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl transform group-hover:scale-110 transition-transform">
                    <div className={`bg-gradient-to-br ${service.gradient} bg-clip-text text-transparent`}>
                      {service.icon}
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-slate-900 font-black shadow-lg">
                    {service.price}
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 text-lg font-light mb-6 line-clamp-2">{service.description}</p>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                        <Check className="w-5 h-5 text-indigo-500" strokeWidth={3} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => handleViewSample(service.title)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-slate-50 text-slate-600 px-4 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-100 flex items-center justify-center gap-2"
                    >
                      Samples
                    </motion.button>
                    <motion.button
                      onClick={() => handleServiceClick(service.title)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-slate-900 text-white px-4 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-200"
                    >
                      Book Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* bottom cta */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
              Don't See What <span className="text-purple-400">You Need?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 font-light leading-relaxed">
              Every project is unique. Let's discuss your custom editing requirements and bring your vision to life.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-purple-500/40 transition-all hover:bg-purple-500 active:scale-95 uppercase tracking-widest text-sm"
            >
              Get Custom Quote
            </motion.button>
          </motion.div>
        </div>
      </section>

      <ServiceBookingForm isOpen={isModalOpen} onOpenChange={setIsModalOpen} selectedService={selectedService} />
    </div>
  );
}
