import { motion } from 'motion/react';
import { 
  Heart,
  Smartphone,
  Megaphone,
  Briefcase,
  Zap,
  Cross,
  TrendingUp,
  Film,
  ArrowLeft,
  Check,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { ServiceBookingForm } from '../components/ServiceBookingForm';
import { ViewSamplesModal } from '../components/ViewSamplesModal';

interface ShootService {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  image: string;
  price: string;
  gradient: string;
}

const shootServices: ShootService[] = [
  {
    id: 1,
    title: 'Wedding Shoot',
    icon: <Heart className="w-8 h-8" />,
    description: 'Complete wedding coverage with cinematic storytelling',
    features: [
      'Bridal shots & portraits',
      'Ceremony coverage',
      'Candid moments',
      'Reception highlights',
      'Drone footage',
      'Same-day teaser video'
    ],
    image: '/images/wedding%20edit.png',
    price: '5000 to 20000',
    gradient: 'from-rose-600 to-pink-600'
  },
  {
    id: 2,
    title: 'Insta & YouTube Video Shoot',
    icon: <Smartphone className="w-8 h-8" />,
    description: 'High-quality content creation for social platforms',
    features: [
      'Instagram Reels shoots',
      'YouTube video production',
      'B-roll footage',
      'Multi-camera setup',
      'Green screen sessions',
      'Professional lighting '
    ],
    image: '/images/reel%20edit.png',
    price: '2000 to 10000',
    gradient: 'from-pink-600 to-rose-600'
  },
  {
    id: 3,
    title: 'Commercial Shoot',
    icon: <Megaphone className="w-8 h-8" />,
    description: 'Professional adand products',
    features: [
      '30-60 second ads',
      'Product showcasing',
      'Studio & location shoots',
    ],
    image: '/images/Ai%20edit.png',
    price: '1000 to 20000',
    gradient: 'from-orange-600 to-yellow-600'
  },
  {
    id: 4,
    title: 'Corporate Event Shoot',
    icon: <Briefcase className="w-8 h-8" />,
    description: 'Professional coverage of corporate events and conferences',
    features: [
      'Multi-camera coverage',
      'Speaker & presentation footage',
      'Crowd interactions',
      'Venue setup videos',
      'Highlight reel creation',
      'Quick turnaround editing'
    ],
    image: '/images/documentry%20image.png',
    price: '5000 to 30000',
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    id: 5,
    title: 'Marketing Shoot',
    icon: <Zap className="w-8 h-8" />,
    description: 'Strategic marketing video production for campaigns',
    features: [
      'Tutorial content',
      'Explainer videos',
      'Multi-format delivery'
    ],
    image: '/images/vlog-image.png',
    price: '1000 to 10000',
    gradient: 'from-purple-600 to-violet-600'
  },
  {
    id: 6,
    title: 'Religious Shoot',
    icon: <Cross className="w-8 h-8" />,
    description: 'Respectful coverage of religious ceremonies and events',
    features: [
      'Pooja & ritual coverage',
      'Prayer sessions',
      'Devotional content',
      'Sermon recordings',
      'Sacred moment capture',
      'Culturally sensitive editing'
    ],
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWxpZ2lvdXN8ZW58MXx8fHwxNzcwNTYyMjA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '1000 to 10000',
    gradient: 'from-amber-600 to-orange-600'
  },
  {
    id: 7,
    title: 'Political Shoot',
    icon: <TrendingUp className="w-8 h-8" />,
    description: 'Campaign and political event video production',
    features: [
      'Rally coverage',
      'Candidate interviews',
      'Campaign messaging',
      'Crowd reactions',
      'Political ads',
      'Documentary style editing'
    ],
    image: 'https://images.unsplash.com/photo-1540575467063-178f50002e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljc3xlbnwxfHx8fDE3NzA1NjIyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '2000 to 20000',
    gradient: 'from-red-600 to-orange-600'
  },
  {
    id: 8,
    title: 'Cinematic Shoot',
    icon: <Film className="w-8 h-8" />,
    description: 'High-end cinematic production with Hollywood-style quality',
    features: [
      '4K/8K resolution',
      'Drone cinematography',
      'Color graded footage',
      'Professional sound recording',
      'Visual effects ready',
      'Cinema camera equipment'
    ],
    image: '/images/documentry%20image.png',
    price: '3000 to 30000',
    gradient: 'from-purple-600 to-pink-600'
  }
];

export function ProfessionalShootPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState(false);
  const [selectedShootType, setSelectedShootType] = useState('');

  const handleShootClick = (shootTitle: string) => {
    setSelectedService(shootTitle);
    setIsModalOpen(true);
  };

  const handleViewSamples = (shootTitle: string) => {
    if (shootTitle === 'Corporate Event Shoot') {
      navigate('/corporate-shoot-portfolio');
    } else if (shootTitle === 'Wedding Shoot') {
      navigate('/wedding-portfolio');
    } else if (shootTitle === 'Insta & YouTube Video Shoot') {
      navigate('/social-video-portfolio');
    } else if (shootTitle === 'Commercial Shoot') {
      navigate('/commercial-portfolio');
    } else if (shootTitle === 'Marketing Shoot') {
      navigate('/marketing-portfolio');
    } else if (shootTitle === 'Religious Shoot') {
      navigate('/religious-portfolio');
    } else if (shootTitle === 'Political Shoot') {
      navigate('/political-portfolio');
    } else if (shootTitle === 'Cinematic Shoot') {
      navigate('/cinematic-portfolio');
    } else {
      setSelectedShootType(shootTitle);
      setIsSamplesModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05)_0%,transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Professional <span className="text-gradient">Shoots</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
              Capture your story with cinematic perfection. From intimate moments to grand events, we deliver professional cinematography.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shoots Grid */}
      <section className="py-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {shootServices.map((shoot, index) => (
              <motion.div
                key={shoot.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-[40px] overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all shadow-2xl shadow-slate-200/50"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden p-2">
                  <div className="w-full h-full overflow-hidden rounded-[32px]">
                    <img 
                      src={shoot.image} 
                      alt={shoot.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] m-2" />
                  
                  {/* Icon overlay */}
                  <div className={`absolute top-6 right-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl transform group-hover:scale-110 transition-transform`}>
                    <div className={`bg-gradient-to-br ${shoot.gradient} bg-clip-text text-transparent`}>
                      {shoot.icon}
                    </div>
                  </div>

                  {/* Price tag */}
                  <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-slate-900 font-black shadow-lg">
                    ₹{shoot.price}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                    {shoot.title}
                  </h3>
                  <p className="text-slate-500 text-lg font-light mb-6 line-clamp-2">
                    {shoot.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {shoot.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                        <Check className="w-5 h-5 text-indigo-500" strokeWidth={3} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => handleViewSamples(shoot.title)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-slate-50 text-slate-600 px-4 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-100 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Samples
                    </motion.button>
                    <motion.button
                      onClick={() => handleShootClick(shoot.title)}
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

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
              Need a <span className="text-indigo-400">Custom</span> Shoot?
            </h2>
            <p className="text-xl text-slate-400 mb-12 font-light leading-relaxed">
              We specialize in creating unique visual content tailored to your specific requirements.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-indigo-500/40 transition-all hover:bg-indigo-500 active:scale-95 uppercase tracking-widest text-sm"
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Booking Form Modal */}
      <ServiceBookingForm 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen}
        selectedService={selectedService}
      />

      {/* View Samples Modal */}
      <ViewSamplesModal
        isOpen={isSamplesModalOpen}
        onOpenChange={setIsSamplesModalOpen}
        shootType={selectedShootType}
        samples={[]}
      />
    </div>
  );
}
