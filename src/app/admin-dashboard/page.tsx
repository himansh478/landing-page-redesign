'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Phone, IndianRupee, Link as LinkIcon, Briefcase, Activity, Lock, AlertTriangle, Mail, MessageCircle, ImageIcon, LogOut, CheckCircle2, Star } from 'lucide-react';
import { verifyAdminPassword, checkAdminAuth, logoutAdmin } from '@/app/actions/auth';
import { Partner } from '@/types';

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

function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function AdminAuthGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      const result = await verifyAdminPassword(password);
      if (result.success) {
        onAuthenticated();
      } else {
        setError(true);
        setPassword('');
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsVerifying(false);
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
            disabled={isVerifying}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [jobs, setJobs] = useState<ShootJob[]>([]);
  const [applications, setApplications] = useState<ShootApplication[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const authed = await checkAdminAuth();
      setIsAuthenticated(authed);
    };
    initAuth();
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: jobsData, error: jobsError } = await supabase
        .from('I_have_work')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (jobsError) throw jobsError;

      const { data: appsData, error: appsError } = await supabase
        .from('admin_dashboard')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (appsError) throw appsError;

      if (jobsData) setJobs(jobsData);
      if (appsData) setApplications(appsData);

      const { data: partnersData } = await supabase
        .from('partners')
        .select('*');
      
      if (partnersData) setPartners(partnersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getMatchedPartners = (job: ShootJob) => {
    if (!partners || partners.length === 0) return [];
    
    return partners.map(partner => {
      let score = 0;
      const matchingLogs: string[] = [];

      // Priority 1: Location (State -> District -> Location)
      if (partner.state.toLowerCase() === job.state.toLowerCase()) {
        score += 10;
        matchingLogs.push("State Match");
        if (partner.district.toLowerCase() === job.district.toLowerCase()) {
          score += 20;
          matchingLogs.push("District Match");
          if (partner.exact_location.toLowerCase().includes(job.exact_location.toLowerCase()) || 
              job.exact_location.toLowerCase().includes(partner.exact_location.toLowerCase())) {
            score += 40;
            matchingLogs.push("Exact Location Match");
          }
        }
      }

      // Priority 2: Work Type / Skills
      const workType = (job.work_type || "").toLowerCase();
      const skills = (partner.skills || "").toLowerCase();
      if (skills.includes(workType) || workType.includes(skills)) {
        score += 30;
        matchingLogs.push("Skill Match");
      }

      return { ...partner, score, matchingLogs };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 matches
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();

    const jobSubscription = supabase
      .channel('public:I_have_work_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'I_have_work' }, () => {
        fetchData();
      })
      .subscribe();

    const appSubscription = supabase
      .channel('public:admin_dashboard_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_dashboard' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(jobSubscription);
      supabase.removeChannel(appSubscription);
    };
  }, [isAuthenticated, fetchData]);

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);
    try {
      const { error } = await supabase
        .from('I_have_work')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return <AdminAuthGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dashboard</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                <Activity className="w-3 h-3" /> Live
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Viewing real-time updates for job postings and interested applicants
          </p>
        </div>

        {error && (
           <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
             {error}
           </div>
        )}

        {jobs.length === 0 && !loading && (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">No job postings yet</p>
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
                          <ImageIcon className="w-3 h-3" /> {job.insta_id}
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
                  {/* Smart Matching Section */}
                  <div className="mb-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Recommended Partners</h3>
                      <span className="text-xs text-slate-500 font-medium ml-2">(Auto-matched from database)</span>
                    </div>

                    {getMatchedPartners(job).length === 0 ? (
                      <p className="text-sm text-slate-400 italic px-2">No database partners match this location or skill yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getMatchedPartners(job).map(partner => (
                          <div key={partner.id} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900">{partner.name}</h4>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded">Top Match</span>
                                </div>
                                <p className="text-xs text-slate-500">{partner.experience} Exp | {partner.district}</p>
                              </div>
                              <a 
                                href={`https://wa.me/${partner.whatsapp.replace(/\D/g, '')}?text=Hello ${partner.name}, we have a ${job.work_type} job for you in ${job.district}. Are you interested?`}
                                target="_blank"
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all"
                                title="Contact via WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {partner.matchingLogs.map((log, i) => (
                                <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> {log}
                                </span>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-50">
                                <p className="text-[10px] text-slate-400 font-medium line-clamp-1"><span className="text-slate-600">Gear:</span> {partner.equipments}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manual Interested Applicants Section */}
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-bold text-slate-900">Interested Applicants</h3>
                  </div>
                  
                  {jobApps.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-4">No one has shown interest yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jobApps.map((app) => (
                        <div key={app.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-slate-800 font-medium">
                            <Phone className="w-4 h-4 text-green-600" />
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
