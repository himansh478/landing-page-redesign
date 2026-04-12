import { motion } from 'motion/react';
import { ArrowLeft, Film, Clapperboard, Crown, Mountain, Music, Camera, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface Theme {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  gradient: string;
  price: string;
}

const themes: Theme[] = [
  {
    id: 1,
    title: 'KGF Theme',
    icon: <Crown className="w-8 h-8" />,
    description: 'Dark, gritty, and powerful cinematography inspired by KGF aesthetics',
    features: ['Intense Color Grading', 'Dramatic Lighting', 'Epic Transitions', 'Powerful Music'],
    gradient: 'from-amber-600 to-orange-800',
    price: 'Starting at ₹25,000'
  },
  {
    id: 2,
    title: 'Pushparaj Theme',
    icon: <Film className="w-8 h-8" />,
    description: 'Bold and rustic style with mass appeal elements and earthy tones',
    features: ['Rustic Aesthetics', 'Mass Scenes', 'Bold Edits', 'Dynamic BGM'],
    gradient: 'from-red-600 to-rose-800',
    price: 'Starting at ₹25,000'
  },
  {
    id: 3,
    title: 'Trader Theme',
    icon: <Clapperboard className="w-8 h-8" />,
    description: 'Professional and sleek corporate/business style for the modern era',
    features: ['Corporate Look', 'Professional Edits', 'Clean Transitions', 'Business Tone'],
    gradient: 'from-blue-600 to-indigo-800',
    price: 'Starting at ₹20,000'
  },
  {
    id: 4,
    title: 'South Indian Theme',
    icon: <Music className="w-8 h-8" />,
    description: 'Vibrant colors and traditional South Indian cultural aesthetics',
    features: ['Vibrant Colors', 'Traditional Elements', 'Cultural Touch', 'Folk Music'],
    gradient: 'from-green-600 to-emerald-800',
    price: 'Starting at ₹22,000'
  },
  {
    id: 5,
    title: 'Rajasthan Theme',
    icon: <Mountain className="w-8 h-8" />,
    description: 'Royal heritage with rich cultural elements and desert warmth',
    features: ['Royal Aesthetics', 'Heritage Look', 'Warm Tones', 'Traditional Music'],
    gradient: 'from-orange-600 to-red-800',
    price: 'Starting at ₹22,000'
  },
  {
    id: 6,
    title: 'Western Theme',
    icon: <Camera className="w-8 h-8" />,
    description: 'Hollywood-style modern cinematography with global appeal',
    features: ['Cinematic Look', 'Modern Edits', 'Western Music', 'High Production'],
    gradient: 'from-purple-600 to-pink-800',
    price: 'Starting at ₹30,000'
  }
];

export function TheamBasedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group mb-12"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </motion.button>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Theme Based <span className="text-gradient">Edit & Shoot</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
              Choose your cinematic style. We craft your vision with theme-based shoots and edits 
              that capture the essence of your story with powerful aesthetics.
            </p>
          </motion.div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white border border-slate-100 rounded-[40px] p-10 flex flex-col shadow-2xl shadow-slate-200/50 hover:shadow-indigo-500/10 transition-all"
              >
                {/* Icon */}
                <div className={`inline-flex p-5 rounded-2xl bg-slate-50 text-slate-900 mb-8 relative z-10 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                  {theme.icon}
                </div>

                {/* Content */}
                <h3 className="text-3xl font-black text-slate-900 mb-4 relative z-10 uppercase tracking-tight">
                  {theme.title}
                </h3>
                
                <p className="text-slate-500 text-lg font-light mb-8 relative z-10 leading-relaxed">
                  {theme.description}
                </p>

                {/* Features */}
                <ul className="space-y-4 mb-10 relative z-10 flex-grow">
                  {theme.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="border-t border-slate-100 pt-8 mb-8 relative z-10">
                  <p className="text-indigo-600 font-black text-2xl tracking-tight">{theme.price}</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Custom packages available</p>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-200 group-hover:bg-indigo-600`}
                >
                  Book This Theme
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900 relative overflow-hidden rounded-[50px] p-16 text-center shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Need a <span className="text-indigo-400">Custom</span> Theme?
              </h2>
              <p className="text-slate-400 text-xl font-light mb-12 leading-relaxed">
                Have a unique vision? We create custom theme packages tailored to your specific requirements. 
                Let's discuss your project and bring your creative vision to life.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-indigo-500/40 transition-all hover:bg-indigo-500 active:scale-95 uppercase tracking-widest text-sm"
              >
                Discuss Custom Theme
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
