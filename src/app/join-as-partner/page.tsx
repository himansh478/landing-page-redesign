'use client';

import { PartnerRegistrationForm } from '@/components/PartnerRegistrationForm';
import { motion } from 'motion/react';

export default function JoinAsPartnerPage() {
  return (
    <div className="pt-32 pb-20 px-4 min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 inline-block">
              For Photographers & Editors
            </span>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Grow Your Creative <span className="text-purple-500">Business</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              We connect the best creative talent with high-value clients. Join our network and get access to premium projects in your area.
            </p>
          </div>

          <PartnerRegistrationForm />
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-bold mb-2">Daily Leads</h3>
              <p className="text-zinc-400 text-sm">Get notified about shoots and editing projects every day.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-bold mb-2">Fair Pricing</h3>
              <p className="text-zinc-400 text-sm">We ensure you get paid what you deserve for your hard work.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-bold mb-2">Network</h3>
              <p className="text-zinc-400 text-sm">Collaborate with other professionals and grow together.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
