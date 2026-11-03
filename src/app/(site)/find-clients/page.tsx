'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Clock, Video, Loader2, IndianRupee, Send, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { ModalShell } from '@/components/editorial/ModalShell';
import { Em } from '@/components/editorial/Showcase';
import { btnPrimary, fieldClass, labelClass, tagClass } from '@/components/editorial/styles';

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
  // Kept for parity with the original; the message isn't shown anywhere yet.
  const [, setError] = useState<string | null>(null);

  // Modal states
  const [selectedJob, setSelectedJob] = useState<ShootJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [appFormData, setAppFormData] = useState({
    phone: '',
    equipments: '',
    portfolio: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('I_have_work')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setJobs(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : (err as { message?: string })?.message ?? null);
      } finally {
        setLoading(false);
      }
    };

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
    } catch (err: unknown) {
      alert("Error submitting application: " + (err instanceof Error ? err.message : (err as { message?: string })?.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageShell>
        <PageIntro
          label="Creative Marketplace"
          title={['Find', 'Work.']}
          lede={
            <>
              Elite opportunities for cinematographers, editors, and technical artists.
              Deploy your skills on <Em>premium projects</Em> across the globe.
            </>
          }
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32" role="status">
            <Loader2 className="w-8 h-8 text-editorial animate-spin mb-5" aria-hidden="true" />
            <p className="slate text-ink/55">Scanning Pipeline...</p>
          </div>
        ) : (
          <ul className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => {
              const isCompleted = job.status === 'completed';
              return (
                <motion.li
                  key={job.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: (idx % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative flex flex-col p-6 sm:p-7 rounded-[4px] border transition-shadow duration-500 ${
                    isCompleted
                      ? 'opacity-60 bg-sand/40 border-ink/10'
                      : 'bg-paper border-ink/15 hover:shadow-[0_30px_60px_-35px_rgb(var(--ink-rgb)/0.55)]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-6">
                    <span className={tagClass}>{job.work_type}</span>
                    {isCompleted && (
                      <span className="slate !text-[10px] px-2 py-1 rounded-[3px] border border-destructive/40 text-destructive">
                        Closed
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl font-extrabold text-ink tracking-[-0.03em] leading-tight mb-5 transition-colors group-hover:text-editorial">
                    {job.district}, {job.state}
                  </h3>

                  <dl className="mb-8 flex-grow border-t border-ink/15 text-sm text-ink/75">
                    <div className="py-2.5 border-b border-ink/10">
                      <dt className="sr-only">Location</dt>
                      <dd className="flex items-center gap-3 min-w-0">
                        <MapPin className="w-4 h-4 text-ink/45 flex-shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1">{job.exact_location}</span>
                      </dd>
                    </div>
                    <div className="py-2.5 border-b border-ink/10">
                      <dt className="sr-only">Duration</dt>
                      <dd className="flex items-center gap-3 min-w-0">
                        <Clock className="w-4 h-4 text-ink/45 flex-shrink-0" aria-hidden="true" />
                        <span>{job.work_duration}</span>
                      </dd>
                    </div>
                    <div className="py-2.5 border-b border-ink/10">
                      <dt className="sr-only">Gear</dt>
                      <dd className="flex items-center gap-3 min-w-0">
                        <Video className="w-4 h-4 text-ink/45 flex-shrink-0" aria-hidden="true" />
                        <span>Gear: {job.device_type}</span>
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="slate text-ink/50 mb-1 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" aria-hidden="true" />
                        Payout
                      </div>
                      <div className="font-display text-3xl font-extrabold text-ink tracking-[-0.04em] tabular leading-none">
                        ₹{Math.round(job.price * 0.9)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      disabled={isCompleted}
                      className={`h-11 px-5 rounded-md text-sm font-semibold transition-colors duration-300 ${
                        isCompleted
                          ? 'bg-ink/5 text-ink/40 cursor-not-allowed'
                          : 'bg-editorial text-ivory hover:bg-ink'
                      }`}
                    >
                      {isCompleted ? 'Filled' : "Interest"}
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </PageShell>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            role="status"
            className="on-ink fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] sm:w-auto px-5 py-3.5 rounded-md bg-ink text-ivory slate flex items-center gap-3 shadow-[0_20px_40px_-20px_rgb(var(--ink-rgb)/0.6)]"
          >
            <ShieldCheck className="w-4 h-4 text-coral flex-shrink-0" aria-hidden="true" />
            Interest Submitted Successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interest Modal */}
      <AnimatePresence>
        {selectedJob && (
          <ModalShell onClose={() => setSelectedJob(null)} labelledBy="interest-title" className="max-w-xl" zClass="z-50">
            <div className="p-6 sm:p-8 pr-16 border-b border-ink/15">
              <p className="slate text-editorial mb-2">Project Application</p>
              <h2 id="interest-title" className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em]">Interest Brief</h2>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 sm:p-8 space-y-5">
              <div>
                <label htmlFor="fc-phone" className={labelClass}>WhatsApp Connectivity</label>
                <input
                  id="fc-phone"
                  type="tel" required
                  className={fieldClass}
                  placeholder="+91 00000 00000"
                  value={appFormData.phone}
                  onChange={(e) => setAppFormData({...appFormData, phone: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="fc-equipment" className={labelClass}>Equipment Arsenal</label>
                <input
                  id="fc-equipment"
                  type="text" required
                  className={fieldClass}
                  placeholder="e.g. Sony A7SIII, Gimbal, DJI Mini 4"
                  value={appFormData.equipments}
                  onChange={(e) => setAppFormData({...appFormData, equipments: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="fc-portfolio" className={labelClass}>Visual Portfolio Link</label>
                <input
                  id="fc-portfolio"
                  type="url" required
                  className={fieldClass}
                  placeholder="Behance, IG or Drive link"
                  value={appFormData.portfolio}
                  onChange={(e) => setAppFormData({...appFormData, portfolio: e.target.value})}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Transmitting...</>
                ) : (
                  <><Send className="w-4 h-4 transition-transform duration-500 ease-reveal group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" /> Deploy Application</>
                )}
              </button>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}
