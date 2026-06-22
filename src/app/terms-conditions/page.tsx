'use client';

import { motion } from 'motion/react';
import { FileText, Scale, AlertCircle, ShieldCheck, Mail, Zap, Terminal, Lock } from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <FileText className="w-3 h-3" />
              Service Governance
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-bold mb-10 tracking-tighter leading-none"
            >
              Terms & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Conditions.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-light italic text-slate-500 uppercase tracking-widest"
            >
              Last Updated: May 14, 2026
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
                  <ShieldCheck className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">1. Acceptance of Terms</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed text-lg">
                By accessing and using <span className="text-slate-900 font-medium">Cwaya</span>, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Lock className="w-5 h-5 text-purple-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">2. User Conduct</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed mb-10">
                You are responsible for your own communications and are responsible for the consequences of their posting. You agree to use the site only for lawful purposes. You are prohibited from:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Posting any copyrighted material unless you own it.',
                  'Using the site for any fraudulent or illegal activity.',
                  'Attempting to interfere with the network security.',
                  'Using any automated system to access the site.',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm group-hover:border-slate-300 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-600 text-sm font-light">{text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <AlertCircle className="w-5 h-5 text-rose-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">3. Disclaimer</h2>
              </div>
              <div className="p-10 rounded-[40px] bg-rose-50 border border-rose-100">
                <p className="text-slate-600 font-light leading-relaxed">
                  The materials on Cwaya's website are provided on an <span className="text-rose-600 font-medium">'as is'</span> basis. Cwaya makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </div>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Scale className="w-5 h-5 text-amber-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">4. Governing Law</h2>
              </div>
              <p className="text-slate-600 font-light leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of <span className="text-slate-900 font-medium">India</span> and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>

            <section className="pt-16 border-t border-slate-200 text-center">
              <div className="inline-flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-6 tracking-tighter text-slate-900">Questions?</h2>
                <a 
                  href="mailto:Sudhanshugour89@gmail.com" 
                  className="flex items-center gap-4 px-12 py-6 rounded-[32px] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
              </div>
            </section>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
