import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Users, Phone, IndianRupee, Link as LinkIcon, Briefcase, Activity, Lock, AlertTriangle, Mail, MessageCircle, Instagram } from 'lucide-react';

// --- Interfaces aligned with full DB schema ---

interface ShootJob {
  id: string;
  name: string;
  gmail: string;
  whatsapp_number: string;
  insta_id?: string;
  state: string;
  district: string;
  exact_location: string;
  work_duration: string;
  work_type: string;
  reference_video?: string;
  device_type?: string;
  price?: number;
  status?: string;
  created_at: string;
}

interface ShootApplication {
  id: string;
  job_id: string;
  phone_number: string;
  equipments: string;
  charges?: string;
  portfolio_link: string;
  created_at: string;
}

// --- Helpers ---

/** Sanitize phone number for wa.me links (digits only) */
function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Only allow safe URL protocols for portfolio links */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// --- Auth Gate Component ---

function AdminAuthGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Simple client-side gate — replace with Supabase Auth for production
  const ADMIN_PASSWORD = 'admin@2026';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      onAuthenticated();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Admin Access</h1>
          <p className="text-slate-500 text-sm mt-1">Enter password to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Incorrect password
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Main Component ---

export function AdminApplicationsPage() {
  // All useState calls grouped at top (#11 fix)
  const [jobs, setJobs] = useState<ShootJob[]>([]);
  const [applications, setApplications] = useState<ShootApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('admin_authenticated') === 'true'
  );

  // #1 Critical fix: fetchData in component scope so handleStatusUpdate can call it
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch Jobs (with limit for pagination — #10 fix)
      const { data: jobsData, error: jobsError } = await supabase
        .from('I_have_work')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (jobsError) throw jobsError;

      // Fetch Applications (with limit — #10 fix)
      const { data: appsData, error: appsError } = await supabase
        .from('admin_dashboard')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (appsError) throw appsError;

      if (jobsData) setJobs(jobsData);
      if (appsData) setApplications(appsData);
    } catch (err: unknown) {  // #9 fix: unknown instead of any
      const message = err instanceof Error ? err.message : 'Failed to load data';
      console.error("Error fetching data:", err);
      setError(message);  // #7 fix: set error state for UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();

    // REAL-TIME SUBSCRIPTIONS
    const jobSubscription = supabase
      .channel('public:I_have_work')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'I_have_work' }, () => {
        fetchData();
      })
      .subscribe();

    // #4 fix: Listen for ALL events on admin_dashboard, not just INSERT
    const appSubscription = supabase
      .channel('public:admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_dashboard' }, () => {
        fetchData();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(jobSubscription);
      supabase.removeChannel(appSubscription);
    };
  }, [isAuthenticated, fetchData]);

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);

    // Optimistic Update
    setJobs(currentJobs =>
      currentJobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    try {
      const { error } = await supabase
        .from('I_have_work')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) {
        console.error("Supabase Update Error:", error);
        alert("Database Error: " + error.message);
        fetchData(); // #1 fix: now accessible from component scope
      }
    } catch (err: unknown) {  // #9 fix
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error("System Error:", err);
      alert("System Error: " + message);
      fetchData(); // #1 fix: now accessible
    } finally {
      setUpdatingId(null);
    }
  };

  // #2 fix: Auth gate
  if (!isAuthenticated) {
    return <AdminAuthGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading applications...</p>
      </div>
    );
  }

  // #7 fix: Error state UI
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Data</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); fetchData(); }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dashboard</span>
            </h1>
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
          {/* #6 fix: Removed internal table name from UI */}
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Viewing real-time updates for job postings and interested applicants
          </p>
        </div>

        {/* #5 fix: Empty state */}
        {jobs.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">No job postings yet</p>
            <p className="text-slate-400 text-sm mt-1">New postings will appear here in real-time</p>
          </div>
        )}

        <div className="space-y-8">
          {jobs.map((job) => {
            const jobApps = applications.filter(app => app.job_id === job.id);
            const isCompleted = job.status === 'completed';

            return (
              <div key={job.id} className={`bg-white rounded-2xl shadow-sm border ${isCompleted ? 'border-slate-200 opacity-75' : 'border-slate-200'} overflow-hidden transition-all`}>
                <div className={`p-6 ${isCompleted ? 'bg-slate-50' : 'bg-slate-100'} border-b border-slate-200 flex justify-between items-center flex-wrap gap-4`}>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">
                        {job.work_type} at {job.district}, {job.state}
                      </h2>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded uppercase">Completed</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">Posted by: {job.name || 'Anonymous'} | Location: {job.exact_location}</p>

                    {/* #3 fix: Show additional poster info from DB */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      {job.whatsapp_number && (
                        <a href={`https://wa.me/${sanitizePhone(job.whatsapp_number)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-green-600 transition-colors">
                          <MessageCircle className="w-3 h-3" /> {job.whatsapp_number}
                        </a>
                      )}
                      {job.gmail && (
                        <a href={`mailto:${job.gmail}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                          <Mail className="w-3 h-3" /> {job.gmail}
                        </a>
                      )}
                      {job.insta_id && (
                        <span className="flex items-center gap-1">
                          <Instagram className="w-3 h-3" /> {job.insta_id}
                        </span>
                      )}
                      {job.price != null && (
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <IndianRupee className="w-3 h-3" /> ₹{job.price}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg font-bold">
                      <Users className="w-5 h-5" />
                      <span>{jobApps.length} Interested</span>
                    </div>

                    {!isCompleted ? (
                      <button 
                        onClick={() => handleStatusUpdate(job.id, 'completed')}
                        disabled={updatingId === job.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                      >
                        {updatingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {updatingId === job.id ? 'Updating...' : 'Mark as Done'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(job.id, 'open')}
                        disabled={updatingId === job.id}
                        className="px-4 py-2 border-2 border-slate-300 text-slate-500 hover:bg-slate-100 disabled:opacity-50 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                      >
                        {updatingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {updatingId === job.id ? 'Updating...' : 'Re-open'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {jobApps.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-4">No one has shown interest yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobApps.map((app) => (
                        <div key={app.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-slate-800 font-medium">
                            <Phone className="w-4 h-4 text-green-600" />
                            {/* #12 fix: sanitize phone number for wa.me */}
                            <a href={`https://wa.me/${sanitizePhone(app.phone_number)}`} target="_blank" rel="noreferrer" className="hover:underline">{app.phone_number}</a>
                          </div>
                          
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span><span className="font-semibold">Equipments:</span> {app.equipments}</span>
                          </div>

                          {app.charges && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <IndianRupee className="w-4 h-4 text-slate-400" />
                              <span><span className="font-semibold">Charges:</span> ₹{app.charges}</span>
                            </div>
                          )}

                          {/* #8 fix: Validate URL protocol before rendering as link */}
                          {app.portfolio_link && (
                            <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                              <LinkIcon className="w-4 h-4" />
                              {isSafeUrl(app.portfolio_link) ? (
                                <a href={app.portfolio_link} target="_blank" rel="noreferrer noopener" className="hover:underline truncate">View Portfolio</a>
                              ) : (
                                <span className="text-slate-400 truncate">{app.portfolio_link}</span>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 text-right mt-2">
                            Applied: {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
