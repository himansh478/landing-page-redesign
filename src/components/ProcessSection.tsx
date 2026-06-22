'use client';

import { motion } from 'motion/react';
import { MessageSquare, Video, CheckCircle, Rocket } from 'lucide-react';

const steps = [
  {
    title: 'Discovery',
    desc: 'Connect via WhatsApp or Search to define your vision and goals.',
    icon: MessageSquare,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    title: 'Production',
    desc: 'Our elite team captures or edits your content with surgical precision.',
    icon: Video,
    color: 'from-purple-500 to-pink-600'
  },
  {
    title: 'Refinement',
    desc: 'Rapid iterations and neural grading to ensure absolute perfection.',
    icon: CheckCircle,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Deployment',
    desc: 'Receive your studio-grade masters and dominate your niche.',
    icon: Rocket,
    color: 'from-orange-500 to-red-600'
  }
];

export function ProcessSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter uppercase text-slate-900">The <span className="text-indigo-600">Execution</span> Cycle</h2>
          <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto">
            A streamlined architecture for transforming concepts into high-impact digital assets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative text-center group"
            >
              <div className={`w-20 h-20 rounded-[28px] bg-gradient-to-br ${step.color} p-[1px] mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-md`}>
                <div className="w-full h-full rounded-[27px] bg-white flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-slate-900" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight uppercase">{step.title}</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
