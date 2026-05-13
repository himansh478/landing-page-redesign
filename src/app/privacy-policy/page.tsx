'use client';

import { motion } from 'motion/react';
import { Shield, Lock, Eye, Server, Mail, ExternalLink, Zap } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Shield className="w-3 h-3" />
              Compliance Framework
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-bold mb-10 tracking-tighter leading-none"
            >
              Privacy <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Protocol.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-light italic text-slate-500 uppercase tracking-widest"
            >
              Last updated: April 5, 2026
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-16"
          >
            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Zap className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. Core Integration</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed text-lg">
                Welcome to <span className="text-slate-900 font-medium">Cwaya.</span> We value your privacy and are committed to protecting your personal data. This privacy protocol informs you how we look after your personal data when you visit our neural interface and tells you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Lock className="w-5 h-5 text-purple-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. Neural Data Collection</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed mb-10">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Identity Matrix', text: 'Includes first name, last name, username or unique identifiers.' },
                  { title: 'Contact Vector', text: 'Includes verified email addresses and cryptographic contact nodes.' },
                  { title: 'Technical Signature', text: 'Includes IP address, browser architecture, and geospatial data.' },
                  { title: 'Interaction Logs', text: 'Includes information about how you navigate our creative environment.' },
                ].map((item) => (
                  <div key={item.title} className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Eye className="w-5 h-5 text-amber-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. Cookies & Cognitive Analytics</h2>
              </div>
              <div className="p-10 rounded-[40px] bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Google AdSense Integration</span>
                </div>
                <p className="text-slate-600 font-light leading-relaxed mb-8">
                  Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the advertising cookie enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
                </p>
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Configure Ad Settings <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Server className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. Data Encryption</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed">
                We have put in place enterprise-grade security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. Access to your data is restricted to elite personnel with a strict need-to-know basis.
              </p>
            </section>

            <section className="pt-16 border-t border-slate-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-12 rounded-[48px] bg-white border border-slate-200 shadow-md">
                <div>
                  <h2 className="text-3xl font-bold mb-4 tracking-tighter text-slate-900">Inquiries.</h2>
                  <p className="text-slate-500 font-light max-w-sm">
                    For all matters regarding data privacy or protocol clarification, contact our lead privacy officer.
                  </p>
                </div>
                <a 
                  href="mailto:hello@socialshiva.com" 
                  className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                >
                  <Mail className="w-4 h-4" />
                  hello@socialshiva.com
                </a>
              </div>
            </section>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
