'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Clock, Video, Loader2, X, Phone, Briefcase, IndianRupee, Globe, Send, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShootJob {
  id: string;
  state: string;
  district: string;
  exact_location: string;
  work_duration: string;
  work_type: string;
  reference_video: string;
  device_type: string;
  price: number;
  status?: string;
  created_at: string;
}

export default function FindClientsPage() {
  const [jobs, setJobs] = useState<ShootJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<ShootJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appFormData, setAppFormData] = useState({
    phone: '',
    equipments: '',
    portfolio: ''
  });

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('I_have_work')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setJobs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // REAL-TIME: Listen for status updates and new jobs
    const channel = supabase
      .channel('public:I_have_work_find_clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'I_have_work' }, () => {
        fetchJobs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('admin_dashboard')
        .insert([{
          job_id: selectedJob.id,
          phone_number: appFormData.phone,
          equipments: appFormData.equipments,
          portfolio_link: appFormData.portfolio
        }]);

      if (error) throw error;

      setIsSuccess(true);
      setSelectedJob(null);
      setAppFormData({ phone: '', equipments: '', portfolio: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      alert("Error submitting application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <section className="relative pt-40 pb-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Zap className="w-3 h-3" />
              Creative Marketplace
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl lg:text-9xl font-bold mb-10 tracking-tighter leading-none"
            >
              Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400">Work.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Elite opportunities for cinematographers, editors, and technical artists. 
              Deploy your skills on <span className="text-slate-900 font-medium">premium projects</span> across the globe.
            </motion.p>
          </div>

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl"
              >
                <ShieldCheck className="w-5 h-5" />
                Interest Submitted Successfully
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Scanning Pipeline...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job, idx) => {
                const isCompleted = job.status === 'completed';
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group relative p-8 rounded-[40px] bg-white border transition-all duration-500 flex flex-col ${
                      isCompleted ? 'opacity-60 grayscale border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <span className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                        {job.work_type}
                      </span>
                      {isCompleted && (
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg border border-red-100">
                          Closed
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold mb-6 tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {job.district}, {job.state}
                    </h3>

                    <div className="space-y-4 mb-10 flex-grow">
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-light">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span className="line-clamp-1">{job.exact_location}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-light">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>{job.work_duration}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-light">
                        <Video className="w-4 h-4 text-indigo-500" />
                        <span>Gear: {job.device_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <IndianRupee className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payout</div>
                          <div className="text-sm font-bold text-emerald-600">₹{Math.round(job.price * 0.9)}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedJob(job)}
                        disabled={isCompleted}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          isCompleted 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-slate-900 text-white hover:bg-indigo-600'
                        }`}
                      >
                        {isCompleted ? 'Filled' : "Interest"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Interest Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[48px] border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Project Application</div>
                  <h2 className="text-3xl font-bold tracking-tighter text-slate-900">Interest Brief</h2>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                      WhatsApp Connectivity
                    </label>
                    <input 
                      type="tel" required
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all text-slate-900 shadow-sm placeholder:text-slate-400"
                      placeholder="+91 00000 00000"
                      value={appFormData.phone}
                      onChange={(e) => setAppFormData({...appFormData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                      Equipment Arsenal
                    </label>
                    <input 
                      type="text" required
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all text-slate-900 shadow-sm placeholder:text-slate-400"
                      placeholder="e.g. Sony A7SIII, Gimbal, DJI Mini 4"
                      value={appFormData.equipments}
                      onChange={(e) => setAppFormData({...appFormData, equipments: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                      Visual Portfolio Link
                    </label>
                    <input 
                      type="url" required
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all text-slate-900 shadow-sm placeholder:text-slate-400"
                      placeholder="Behance, IG or Drive link"
                      value={appFormData.portfolio}
                      onChange={(e) => setAppFormData({...appFormData, portfolio: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full group bg-slate-900 text-white font-black py-6 rounded-3xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-indigo-600 shadow-md hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</>
                  ) : (
                    <><Send className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" /> Deploy Application</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
