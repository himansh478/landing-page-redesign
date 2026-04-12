import { motion } from 'motion/react';
import {
  Film,
  Camera,
  Share2,
  Gem,
  Users,
  Mail,
  Bot,
  ArrowRight,
  Video,
  Music,
  TrendingUp
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
}

const services: Service[] = [
  {
    id: 1,
    title: 'All Type Editing',
    icon: <Film className="w-8 h-8" />,
    description: 'Reels, YouTube long-form, 2D/3D Animation, Color Grading',
    features: ['Viral Reels', 'YouTube Edits', '3D Animation', 'Color Grading'],
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 2,
    title: 'Professional Shoots',
    icon: <Camera className="w-8 h-8" />,
    description: 'Ad Films, Product Photography, Podcasts, Events',
    features: ['Ad Films', 'Product Photos', 'Podcasts', 'Event Coverage'],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 6,
    title: 'Social Media Management',
    icon: <Share2 className="w-8 h-8" />,
    description: 'Strategy, Posting Schedules, Engagement, Analytics',
    features: ['Content Strategy', 'Scheduling', 'Engagement', 'Analytics'],
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 8,
    title: 'Become My Member',
    icon: <Users className="w-8 h-8" />,
    description: 'Membership portal for recurring clients and exclusive perks',
    features: ['Priority Support', 'Exclusive Deals', 'Monthly Credits', 'VIP Access'],
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 10,
    title: 'Technical Solutions',
    icon: <Bot className="w-8 h-8" />,
    description: 'AI Chatbots, Web Development, Automation, CRM setup',
    features: ['AI Chatbots', 'Web Apps', 'Automation', 'CRM Setup'],
    gradient: 'from-violet-500 to-fuchsia-500'
  }
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
    <section id="services" className="relative py-16 sm:py-24 bg-deep-space overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight px-2">
            Your Complete <span className="text-gradient">Creative Arsenal</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto font-light px-2">
            Choose your gateway to excellence. Each service is a doorway to unlimited creative potential.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 card-3d-wrap perspective-1000">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, translateZ: 30 }}
              onClick={() => handleServiceClick(service.title)}
              className="group relative bg-white/80 border border-slate-200 card-3d rounded-xl sm:rounded-2xl p-6 transition-all cursor-pointer shadow-sm hover:shadow-xl z-10"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl sm:rounded-2xl`} />

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className={`inline-flex p-3 sm:p-4 rounded-xl bg-gradient-to-br ${service.gradient} text-white mb-4 sm:mb-5 relative z-10 shadow-md`}
              >
                {service.icon}
              </motion.div>

              {/* Content */}
              <h3 className="text-xl sm:text-3xl font-bold text-slate-900 mb-3 relative z-10">
                {service.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-500 mb-3 sm:mb-4 relative z-10 font-light">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 relative z-10">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-light">
                    <motion.div
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${service.gradient} flex-shrink-0`}
                      whileHover={{ scale: 1.3 }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 text-slate-700 text-sm sm:text-base font-semibold group-hover:gap-3 transition-all relative z-10 bg-slate-100 hover:bg-indigo-50 px-3 py-2 rounded-lg"
              >
                {service.title === 'Become My Member' ? 'Apply Now' : 'Explore More'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>


      </div>

      {/* Inner Circle Modal */}
      <InnerCircleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}