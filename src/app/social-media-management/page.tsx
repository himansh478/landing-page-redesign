'use client';

import { motion } from 'motion/react';
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function SocialMediaManagementPage() {
  const managementFeatures = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Content Strategy',
      description: 'Custom content calendars tailored to your brand voice and target audience for maximum impact.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Account Handling',
      description: 'Professional management of your ImageIcon, YouTube, and Users with regular high-quality posting.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Growth Strategy',
      description: 'Strategic planning to increase your engagement, reach, and follower loyalty through organic methods.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Deep analysis of your accounts to generate helpful insights and monthly performance reports.'
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-pink-100 selection:text-pink-900 text-slate-900">
      
      <main className="pt-32 pb-24 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-50/50 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/50 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 text-white mb-10 border border-slate-800">
                    <Share2 className="w-3 h-3 text-pink-400" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Digital Dominance</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-none">
                    Social <span className="text-pink-600">Management</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-medium uppercase tracking-widest leading-tight">
                    Elevate your digital presence with strategic content, engagement-focused management, and data-driven growth.
                </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
            {managementFeatures.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-[48px] p-12 border border-slate-100 hover:border-pink-200 transition-all hover:shadow-[0_40px_80px_-20px_rgba(236,72,153,0.1)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50/50 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="inline-flex p-5 rounded-2xl bg-slate-50 text-slate-900 mb-8 border border-slate-100 group-hover:bg-pink-600 group-hover:text-white transition-all duration-500 relative z-10">
                  {item.icon}
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter italic leading-none group-hover:text-pink-600 transition-colors relative z-10">
                    {item.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed uppercase tracking-widest text-sm relative z-10">
                    {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <button className="bg-slate-900 text-white px-16 py-8 rounded-[40px] text-2xl font-black shadow-2xl shadow-slate-200 transition-all hover:bg-pink-600 active:scale-95 uppercase tracking-widest italic">
              Start Growing Your Brand
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
