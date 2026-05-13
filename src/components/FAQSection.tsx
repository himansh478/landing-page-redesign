'use client';

import { motion } from 'motion/react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: "What is Cwaya's standard turnaround time?",
    a: "We deliver studio-grade edits in as little as 3-4 hours for urgent projects. Standard turnaround is typically 24-48 hours depending on the complexity."
  },
  {
    q: "Do you offer on-location shoots outside of Madhya Pradesh?",
    a: "Yes, we offer Pan-India travel. Our team regularly travels for high-end wedding, corporate, and commercial shoots across major cities in India."
  },
  {
    q: "How does the AI Photo Sharing system work?",
    a: "It's simple: Enter the event code, upload a selfie, and our AI instantly finds all your photos from the thousands taken at the event using advanced face recognition."
  },
  {
    q: "Can I get a custom package for my brand?",
    a: "Absolutely. While we have standard tiers, we specialize in building custom 'Investment Architectures' tailored specifically to your brand's growth needs."
  }
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-32 bg-slate-50 overflow-hidden border-t border-slate-200/60">
      <div className="container mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tighter leading-none text-slate-900">
            Common <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Inquiries</span>
          </h2>
          <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto">
            Everything you need to know about the Cwaya ecosystem and our production lifecycle.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className={`p-8 rounded-[32px] bg-white border transition-all duration-500 cursor-pointer shadow-sm hover:shadow-md ${
                  openIdx === idx ? 'border-indigo-200 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      openIdx === idx ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{faq.q}</h3>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-500 ${
                    openIdx === idx ? 'rotate-180 text-indigo-500' : ''
                  }`} />
                </div>
                
                <div className={`overflow-hidden transition-all duration-500 ${
                  openIdx === idx ? 'max-h-40 mt-8' : 'max-h-0'
                }`}>
                  <p className="text-slate-600 font-light leading-relaxed pl-[72px]">
                    {faq.a}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
