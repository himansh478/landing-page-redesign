import { motion } from 'motion/react';
import {
  Film,
  Camera,
  Share2,
  Users,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { InnerCircleModal } from './InnerCircleModal';
import { useNavigate } from 'react-router';

interface Service {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  gradient: string;
  darkGlow: string;
}

const services: Service[] = [
  {
    id: 1,
    title: 'All Type Editing',
    icon: <Film className="w-7 h-7" />,
    description: 'Reels, YouTube long-form, 2D/3D Animation, Color Grading',
    features: ['Viral Reels', 'YouTube Edits', '3D Animation', 'Color Grading'],
    gradient: 'from-purple-500 to-pink-500',
    darkGlow: 'rgba(168,85,247,0.15)',
  },
  {
    id: 2,
    title: 'Professional Shoots',
    icon: <Camera className="w-7 h-7" />,
    description: 'Ad Films, Product Photography, Podcasts, Events',
    features: ['Ad Films', 'Product Photos', 'Podcasts', 'Event Coverage'],
    gradient: 'from-blue-500 to-cyan-500',
    darkGlow: 'rgba(59,130,246,0.15)',
  },
  {
    id: 6,
    title: 'Social Media Management',
    icon: <Share2 className="w-7 h-7" />,
    description: 'Strategy, Posting Schedules, Engagement, Analytics',
    features: ['Content Strategy', 'Scheduling', 'Engagement', 'Analytics'],
    gradient: 'from-pink-500 to-rose-500',
    darkGlow: 'rgba(236,72,153,0.15)',
  },
  {
    id: 8,
    title: 'Become My Member',
    icon: <Users className="w-7 h-7" />,
    description: 'Membership portal for recurring clients and exclusive perks',
    features: ['Priority Support', 'Exclusive Deals', 'Monthly Credits', 'VIP Access'],
    gradient: 'from-green-500 to-emerald-500',
    darkGlow: 'rgba(16,185,129,0.15)',
  },
  {
    id: 10,
    title: 'Technical Solutions',
    icon: <Bot className="w-7 h-7" />,
    description: 'AI Chatbots, Web Development, Automation, CRM setup',
    features: ['AI Chatbots', 'Web Apps', 'Automation', 'CRM Setup'],
    gradient: 'from-violet-500 to-fuchsia-500',
    darkGlow: 'rgba(139,92,246,0.15)',
  },
];

export function ServiceHub() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleServiceClick = (serviceTitle: string) => {
    if (serviceTitle === 'Become My Member') {
      setIsModalOpen(true);
    } else if (serviceTitle === 'All Type Editing') {
      navigate('/masterful-editing');
    } else if (serviceTitle === 'Professional Shoots') {
      navigate('/professional-shoots');
    } else if (serviceTitle === 'Social Media Management') {
      navigate('/social-media-management');
    } else if (serviceTitle === 'Technical Solutions') {
      navigate('/technical-solutions');
    }
  };

  return (
    <section id="services" className="relative py-20 sm:py-28 bg-deep-space overflow-hidden">

      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[32rem] h-[32rem] bg-purple-300/20 dark:bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/5 w-[28rem] h-[28rem] bg-indigo-300/20 dark:bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14 sm:mb-20"
        >
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 mb-4">
            Our Services
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight"
            style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
          >
            Your Complete{' '}
            <span className="text-gradient">Creative Arsenal</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Choose your gateway to excellence. Each service is a doorway to unlimited creative potential.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => handleServiceClick(service.title)}
              className="group relative rounded-2xl p-6 sm:p-7 transition-all duration-300 cursor-pointer overflow-hidden
                bg-white/80 dark:bg-white/[0.04]
                border border-slate-200/80 dark:border-white/[0.08]
                shadow-sm hover:shadow-xl dark:hover:shadow-2xl
                hover:border-indigo-200 dark:hover:border-white/15
                backdrop-blur-sm"
            >
              {/* Gradient hover shine — light & dark */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 rounded-2xl`}
              />

              {/* Dark mode inner glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:block hidden"
                style={{ background: `radial-gradient(circle at 30% 30%, ${service.darkGlow}, transparent 70%)` }}
              />

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.gradient} text-white mb-5 relative z-10 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {service.icon}
              </div>

              {/* Title */}
              <h3
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10"
                style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 relative z-10 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 mb-5 relative z-10">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient} flex-shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold group-hover:gap-3 transition-all relative z-10">
                {service.title === 'Become My Member' ? 'Apply Now' : 'Explore More'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Inner Circle Modal */}
      <InnerCircleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}