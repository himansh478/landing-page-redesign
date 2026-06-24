'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Phone, IndianRupee, Link as LinkIcon, Briefcase, Activity, Lock, AlertTriangle, Mail, MessageCircle, ImageIcon, LogOut, CheckCircle2, Star, Download, ShieldCheck, Film, Upload, Trash2, Plus, X } from 'lucide-react';
import { verifyAdminPassword, checkAdminAuth, logoutAdmin } from '@/app/actions/auth';
import { getAllClips } from '@/app/actions/clips';
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

interface PurchaseLog {
  id: string;
  created_at: string;
  order_id: string;
  payment_id?: string;
  amount: number;
  package_type: string;
  status: string;
  download_url?: string;
}

interface RawClip {
  id: string;
  title: string;
  category: string;
  description?: string;
  thumbnail_url?: string;
  free_drive_url?: string;
  paid_drive_url?: string;
  r2_video_key?: string;
  r2_thumbnail_key?: string;
  duration?: string;
  tags?: string;
  is_free: boolean;
  is_active: boolean;
  download_count?: number;
  created_at: string;
}

const CLIP_CATEGORIES = ['Wedding', 'Cinematic', 'Commercial', 'Corporate', 'Drone', 'Reel'];

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
  const [purchases, setPurchases] = useState<PurchaseLog[]>([]);
  const [clips, setClips] = useState<RawClip[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'purchases' | 'clips'>('jobs');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clip upload state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [clipForm, setClipForm] = useState({
    title: '',
    category: 'Wedding',
    description: '',
    duration: '',
    tags: '',
    is_free: false,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

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

      // Fetch raw clips purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('raw_clips_purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!purchasesError && purchasesData) {
        setPurchases(purchasesData);
      }

      // Fetch raw clips
      const clipsData = await getAllClips();
      if (clipsData) setClips(clipsData);
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

    const purchasesSubscription = supabase
      .channel('public:raw_clips_purchases_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raw_clips_purchases' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(jobSubscription);
      supabase.removeChannel(appSubscription);
      supabase.removeChannel(purchasesSubscription);
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
        
        {/* Header */}
        <div className="text-center mb-8">
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
          <p className="text-md text-slate-600 max-w-2xl mx-auto">
            Manage your shoot job matches and raw clips sales in real time.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-200/60 p-1 rounded-2xl flex gap-1 border border-slate-300/30">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-300/40'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Shoot Jobs & Matches ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'purchases'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-300/40'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              Raw Clips Sales ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('clips')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'clips'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-300/40'
              }`}
            >
              <Film className="w-4 h-4" />
              Manage Clips ({clips.filter(c => c.is_active).length})
            </button>
          </div>
        </div>

        {error && (
           <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
             {error}
           </div>
        )}

        {/* Tab: Shoot Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-8">
            {jobs.length === 0 && !loading && (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 text-lg font-medium">No job postings yet</p>
              </div>
            )}

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
        )}

        {/* Tab: Raw Clips Sales */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                Raw Clips Sales Log
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Total Orders: {purchases.length}
              </span>
            </div>

            {purchases.length === 0 ? (
              <div className="text-center py-20">
                <IndianRupee className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 text-lg font-medium">No sales recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                      <th className="pb-4 font-semibold">Date</th>
                      <th className="pb-4 font-semibold">Order ID / Payment ID</th>
                      <th className="pb-4 font-semibold">Package Type</th>
                      <th className="pb-4 font-semibold">Amount</th>
                      <th className="pb-4 font-semibold">Status</th>
                      <th className="pb-4 font-semibold">Generated Download URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => {
                      const isSuccess = purchase.status === 'SUCCESS';
                      const isPending = purchase.status === 'PENDING';
                      
                      return (
                        <tr key={purchase.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-800 whitespace-nowrap">
                            {new Date(purchase.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 font-mono text-xs text-slate-500">
                            <div>Order: {purchase.order_id}</div>
                            {purchase.payment_id && <div className="text-[10px] text-green-600">Payment: {purchase.payment_id}</div>}
                          </td>
                          <td className="py-4 font-semibold text-slate-900">
                            {purchase.package_type} Package
                          </td>
                          <td className="py-4 font-extrabold text-slate-800">
                            ₹{purchase.amount}
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 text-xs font-black rounded-full tracking-wider ${
                              isSuccess 
                                ? 'bg-green-100 text-green-700' 
                                : isPending 
                                  ? 'bg-yellow-100 text-yellow-700 animate-pulse' 
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {purchase.status}
                            </span>
                          </td>
                          <td className="py-4 max-w-[200px]">
                            {purchase.download_url ? (
                              <a 
                                href={purchase.download_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline truncate"
                                title="Download Clip"
                              >
                                <Download className="w-3.5 h-3.5" /> Download URL
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-xs">No link generated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Manage Clips */}
        {activeTab === 'clips' && (
          <div className="space-y-6">

            {/* Upload Button / Form Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-600" />
                Manage Raw Clips
              </h2>
              <button
                onClick={() => { setShowUploadForm(!showUploadForm); setUploadError(null); setUploadSuccess(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  showUploadForm
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                }`}
              >
                {showUploadForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showUploadForm ? 'Cancel' : 'Upload New Clip'}
              </button>
            </div>

            {/* Upload Form */}
            {showUploadForm && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  Upload New Clip to Cloudinary
                </h3>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Clip successfully upload ho gaya!
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={clipForm.title}
                      onChange={e => setClipForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Golden Hour Wedding — 4K RAW"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={clipForm.category}
                      onChange={e => setClipForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    >
                      {CLIP_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={clipForm.duration}
                      onChange={e => setClipForm(p => ({ ...p, duration: e.target.value }))}
                      placeholder="02:30"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tags</label>
                    <input
                      type="text"
                      value={clipForm.tags}
                      onChange={e => setClipForm(p => ({ ...p, tags: e.target.value }))}
                      placeholder="wedding, golden hour, outdoor"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={clipForm.description}
                    onChange={e => setClipForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Bhopal mein ek stunning golden hour wedding ceremony ke raw clips."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm resize-none"
                  />
                </div>

                {/* Free/Paid Toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-700">Pricing:</label>
                  <button
                    type="button"
                    onClick={() => setClipForm(p => ({ ...p, is_free: true }))}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      clipForm.is_free
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ✨ Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setClipForm(p => ({ ...p, is_free: false }))}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      !clipForm.is_free
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🔒 Paid
                  </button>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video Upload */}
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('video/')) setVideoFile(file);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-indigo-50/30"
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setVideoFile(file);
                      }}
                    />
                    <Film className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    {videoFile ? (
                      <div>
                        <p className="text-sm font-bold text-indigo-600 truncate">{videoFile.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-slate-600">Video File Upload *</p>
                        <p className="text-xs text-slate-400 mt-1">MP4, MOV, AVI, WebM — Max 500MB</p>
                        <p className="text-xs text-slate-400">Click or drag & drop</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Upload */}
                  <div
                    onClick={() => thumbInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) setThumbnailFile(file);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-purple-50/30"
                  >
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setThumbnailFile(file);
                      }}
                    />
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    {thumbnailFile ? (
                      <div>
                        <p className="text-sm font-bold text-purple-600 truncate">{thumbnailFile.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{(thumbnailFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-slate-600">Thumbnail Image *</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — Max 5MB</p>
                        <p className="text-xs text-slate-400">Click or drag & drop</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Uploading to Cloudinary...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  disabled={isUploading || !clipForm.title || !videoFile || !thumbnailFile}
                  onClick={async () => {
                    setIsUploading(true);
                    setUploadError(null);
                    setUploadSuccess(false);
                    setUploadProgress(5);

                    try {
                      const timestamp = Date.now();
                      const cleanTitle = clipForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                      
                      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                      
                      if (!cloudName || !uploadPreset) {
                        throw new Error('Cloudinary configuration missing in environment variables.');
                      }

                      const uploadToCloudinary = (file: File, resourceType: 'video' | 'image', onProgress: (pct: number) => void): Promise<any> => {
                        return new Promise((resolve, reject) => {
                          const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
                          const xhr = new XMLHttpRequest();
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('upload_preset', uploadPreset);
                          
                          xhr.upload.onprogress = (e) => {
                            if (e.lengthComputable) {
                              onProgress(Math.round((e.loaded / e.total) * 100));
                            }
                          };
                          
                          xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                              resolve(JSON.parse(xhr.responseText));
                            } else {
                              reject(new Error('Cloudinary upload failed: ' + xhr.responseText));
                            }
                          };
                          xhr.onerror = () => reject(new Error('Network error'));
                          
                          xhr.open('POST', url, true);
                          xhr.send(formData);
                        });
                      };

                      // 1. Upload Thumbnail to Cloudinary (takes 0% to 10% progress)
                      let thumbnailKey = ''; // this will now hold Cloudinary public_id
                      if (thumbnailFile) {
                        const thumbRes = await uploadToCloudinary(thumbnailFile, 'image', (pct) => setUploadProgress(Math.round(pct * 0.1)));
                        thumbnailKey = thumbRes.public_id;
                      }
                      
                      setUploadProgress(10);
                      
                      // 2. Upload Video to Cloudinary (takes 10% to 90% progress)
                      let videoKey = ''; // this will now hold Cloudinary public_id
                      if (videoFile) {
                        const videoRes = await uploadToCloudinary(videoFile, 'video', (pct) => setUploadProgress(10 + Math.round(pct * 0.8)));
                        videoKey = videoRes.public_id;
                      }
                      
                      setUploadProgress(90);

                      // 3. Save entry in Supabase database
                      const res = await fetch('/api/upload-clip', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: clipForm.title,
                          category: clipForm.category,
                          description: clipForm.description,
                          duration: clipForm.duration,
                          tags: clipForm.tags,
                          isFree: clipForm.is_free,
                          videoKey,
                          thumbnailKey,
                        }),
                      });

                      const result = await res.json();

                      if (!res.ok) {
                        throw new Error(result.error || 'Database save failed');
                      }

                      setUploadProgress(100);
                      setUploadSuccess(true);

                      // Reset form
                      setClipForm({ title: '', category: 'Wedding', description: '', duration: '', tags: '', is_free: false });
                      setVideoFile(null);
                      setThumbnailFile(null);
                      if (videoInputRef.current) videoInputRef.current.value = '';
                      if (thumbInputRef.current) thumbInputRef.current.value = '';

                      // Refresh clips list
                      fetchData();

                      setTimeout(() => {
                        setShowUploadForm(false);
                        setUploadSuccess(false);
                      }, 2000);
                    } catch (err: unknown) {
                      const message = err instanceof Error ? err.message : 'Upload failed';
                      setUploadError(message);
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                >
                  {isUploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-5 h-5" /> Upload Clip</>
                  )}
                </button>
              </div>
            )}

            {/* Existing Clips Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-500" />
                All Clips ({clips.filter(c => c.is_active).length} active)
              </h3>

              {clips.filter(c => c.is_active).length === 0 ? (
                <div className="text-center py-16">
                  <Film className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg font-medium">No clips uploaded yet</p>
                  <p className="text-slate-400 text-sm mt-1">Click &quot;Upload New Clip&quot; to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clips.filter(c => c.is_active).map(clip => (
                    <div key={clip.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-slate-200 relative overflow-hidden">
                        {clip.thumbnail_url ? (
                          <img
                            src={clip.thumbnail_url}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-10 h-10 text-slate-400" />
                          </div>
                        )}
                        {/* Badge */}
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                          clip.is_free
                            ? 'bg-green-500 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {clip.is_free ? 'FREE' : 'PAID'}
                        </span>
                        {clip.duration && (
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {clip.duration}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{clip.category}</p>
                        <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">{clip.title}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[10px] text-slate-400">
                            {new Date(clip.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Download className="w-3 h-3" /> {clip.download_count || 0}
                            </span>
                            <button
                              onClick={async () => {
                                if (!confirm('Kya aap yeh clip delete karna chahte hain?')) return;
                                const { error: delError } = await supabase
                                  .from('raw_clips')
                                  .update({ is_active: false })
                                  .eq('id', clip.id);
                                if (!delError) fetchData();
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete clip"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
