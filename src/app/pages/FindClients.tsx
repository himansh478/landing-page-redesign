import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Clock, Video, MonitorPlay, ExternalLink, Loader2, X, Phone, Briefcase, IndianRupee, Globe, Send } from 'lucide-react';
import { Link } from 'react-router';

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
  created_at: string;
}

export function FindClients() {
  const [jobs, setJobs] = useState<ShootJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<ShootJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appFormData, setAppFormData] = useState({
    phone: '',
    equipments: '',
    charges: '',
    portfolio: ''
  });

  useEffect(() => {
    async function fetchJobs() {
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
    }
    fetchJobs();
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
          charges: appFormData.charges,
          portfolio_link: appFormData.portfolio
        }]);

      if (error) throw error;

      alert("Your interest has been submitted! The client will contact you soon. ✅");
      setSelectedJob(null); // Close modal
      setAppFormData({ phone: '', equipments: '', charges: '', portfolio: '' }); // Clear form
    } catch (err: any) {
      alert("Error submitting application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Clients</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Browse requirements and click "I'm Interested" to apply.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading opportunities...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col">
              <div className="p-6 flex-grow">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase mb-3">
                  {job.work_type}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{job.district}, {job.state}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{job.exact_location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duration: {job.work_duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Video className="w-4 h-4 text-slate-400" />
                    <span>Req. Device: {job.device_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl mt-3 border border-green-100">
                    <IndianRupee className="w-4 h-4" />
                    <span>I Pay: ₹{job.price}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedJob(job)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  I'm Interested
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interest Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Application Form</h2>
                  <p className="text-sm text-slate-500">Applying for {selectedJob.work_type} in {selectedJob.district}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-indigo-500" /> WhatsApp / Phone Number
                    </label>
                    <input 
                      type="tel" required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Your contact number"
                      value={appFormData.phone}
                      onChange={(e) => setAppFormData({...appFormData, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" /> Equipments You Have
                    </label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g. Sony A7III, Gimbal, 24-70mm"
                      value={appFormData.equipments}
                      onChange={(e) => setAppFormData({...appFormData, equipments: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-indigo-500" /> Your Charges (₹)
                      </label>
                      <input 
                        type="text" required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="e.g. 5000"
                        value={appFormData.charges}
                        onChange={(e) => setAppFormData({...appFormData, charges: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-500" /> Portfolio Link
                      </label>
                      <input 
                        type="url" required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Behance, IG or Drive link"
                        value={appFormData.portfolio}
                        onChange={(e) => setAppFormData({...appFormData, portfolio: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Submit Interest</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
