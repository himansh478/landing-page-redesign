import { motion } from 'motion/react';
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function SocialMediaManagementPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-pink-600 mb-12 transition-all group font-bold"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight">
              Social Media <span className="text-gradient">Management</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">
              Elevate your digital presence with strategic content, engagement-focused management, and data-driven growth.
            </p>
          </motion.div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Content Writing',
                description: 'Custom content calendars tailored to your brand voice and audience.'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Account Handling',
                description: 'Professional management of your Instagram, YouTube, and Facebook accounts with regular posting.'
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Growth Strategy',
                description: 'Strategic planning to increase your engagement, reach, and follower loyalty.'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Advanced Analytics',
                description: 'Deep analysis of your accounts to generate helpful insights and performance reports.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-[40px] p-10 border border-slate-100 hover:border-pink-200 transition-all shadow-2xl shadow-slate-200/50 hover:shadow-pink-500/10"
              >
                <div className="inline-flex p-4 rounded-2xl bg-slate-50 text-pink-600 mb-6 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-lg font-light leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* cta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center pb-24"
          >
            <button className="bg-slate-900 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl shadow-slate-200 transition-all hover:bg-pink-600 active:scale-95 uppercase tracking-widest text-sm">
              Start Growing Your Brand
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
