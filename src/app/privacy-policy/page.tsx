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
              Official Policy
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
              Last updated: May 14, 2026
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
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. Introduction</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed text-lg">
                At <span className="text-slate-900 font-medium">Cwaya</span>, we are committed to protecting the privacy of our visitors. This Privacy Policy outlines the types of personal information we collect and how we use, disclose, and safeguard that information.
              </p>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Lock className="w-5 h-5 text-purple-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. Information Collection</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed mb-10">
                We collect information to provide better services to all our users. The information we collect includes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Personal Data', text: 'Name, email address, and contact details provided voluntarily by you.' },
                  { title: 'Usage Data', text: 'Browser type, IP address, pages visited, and time spent on our site.' },
                  { title: 'Cookies', text: 'Small data files used to enhance your browsing experience.' },
                  { title: 'Log Files', text: 'Standard data collected by hosting companies for analytics.' },
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
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. Google AdSense & Cookies</h2>
              </div>
              <div className="p-10 rounded-[40px] bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Advertising Disclosure</span>
                </div>
                <p className="text-slate-600 font-light leading-relaxed mb-8">
                  We use Google AdSense to serve ads. Google uses cookies to serve ads based on a user's prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.
                </p>
                <p className="text-slate-600 font-light leading-relaxed mb-8">
                  Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google Ad Settings</a>.
                </p>
                <a 
                  href="https://policies.google.com/technologies/ads" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Learn how Google uses data <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Shield className="w-5 h-5 text-blue-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. Children's Privacy</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed">
                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Cwaya does not knowingly collect any Personal Identifiable Information from children under the age of 13.
              </p>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Server className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">5. Data Security</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed">
                We use reasonable administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>
            </section>

            <section className="pt-16 border-t border-slate-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-12 rounded-[48px] bg-white border border-slate-200 shadow-md">
                <div>
                  <h2 className="text-3xl font-bold mb-4 tracking-tighter text-slate-900">Questions?</h2>
                  <p className="text-slate-500 font-light max-w-sm">
                    If you have any questions about this Privacy Policy, please contact us.
                  </p>
                </div>
                <a 
                  href="mailto:Sudhanshugour89@gmail.com" 
                  className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                >
                  <Mail className="w-4 h-4" />
                  Sudhanshugour89@gmail.com
                </a>
              </div>
            </section>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
