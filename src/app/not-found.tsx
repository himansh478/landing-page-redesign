'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Ghost } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-500/30 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-slate-300/20 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative inline-block"
        >
          <h1 className="text-[12rem] md:text-[20rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-500 to-transparent opacity-10">
            404
          </h1>
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Ghost className="w-32 h-32 md:w-48 md:h-48 text-red-500/40 blur-sm" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="-mt-12 md:-mt-24"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-6">Error Code: Page_Null_Reference</div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
            Dimension <span className="text-slate-500 italic">Not Found.</span>
          </h2>

          <p className="text-lg md:text-xl text-slate-500 font-light max-w-md mx-auto mb-12 leading-relaxed">
            The neural path you are seeking has been <span className="text-slate-900 font-medium">de-indexed</span> or relocated to a secure sector.
          </p>

          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-3xl text-xl font-black shadow-xl hover:shadow-2xl hover:bg-red-500 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
            Return to Core
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
