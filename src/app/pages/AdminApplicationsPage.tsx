import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Users, Phone, IndianRupee, Link as LinkIcon, Briefcase, Activity } from 'lucide-react';

interface ShootJob {
  id: string;
  name: string;
  state: string;
  district: string;
  exact_location: string;
  work_duration: string;
  work_type: string;
  created_at: string;
}

interface ShootApplication {
  id: string;
  job_id: string;
  phone_number: string;
  equipments: string;
  charges: string;
  portfolio_link: string;
  created_at: string;
}

export function AdminApplicationsPage() {
  const [jobs, setJobs] = useState<ShootJob[]>([]);
  const [applications, setApplications] = useState<ShootApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('I_have_work')
          .select('*')
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Fetch Applications
        const { data: appsData, error: appsError } = await supabase
          .from('shoot_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (appsError) throw appsError;

        if (jobsData) setJobs(jobsData);
        if (appsData) setApplications(appsData);
      } catch (err: any) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();

    // REAL-TIME SUBSCRIPTIONS
    // Listen for new I_have_work jobs
    const jobSubscription = supabase
      .channel('public:I_have_work')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'I_have_work' }, payload => {
        setJobs(currentJobs => [payload.new as ShootJob, ...currentJobs]);
      })
      .subscribe();

    // Listen for new shoot_applications
    const appSubscription = supabase
      .channel('public:shoot_applications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shoot_applications' }, payload => {
        setApplications(currentApps => [payload.new as ShootApplication, ...currentApps]);
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(jobSubscription);
      supabase.removeChannel(appSubscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading applications...</p>
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
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Viewing real-time updates for "I_have_work" cards and interested applicants
          </p>
        </div>

        <div className="space-y-8">
          {jobs.map((job) => {
            const jobApps = applications.filter(app => app.job_id === job.id);

            return (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-100 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {job.work_type} at {job.district}, {job.state}
                    </h2>
                    <p className="text-sm text-slate-600">Posted by: {job.name || 'Anonymous'} | Location: {job.exact_location}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg font-bold">
                    <Users className="w-5 h-5" />
                    <span>{jobApps.length} Interested</span>
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
                            <a href={`https://wa.me/${app.phone_number}`} target="_blank" rel="noreferrer" className="hover:underline">{app.phone_number}</a>
                          </div>
                          
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span><span className="font-semibold">Equipments:</span> {app.equipments}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <IndianRupee className="w-4 h-4 text-slate-400" />
                            <span><span className="font-semibold">Charges:</span> ₹{app.charges}</span>
                          </div>

                          {app.portfolio_link && (
                            <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                              <LinkIcon className="w-4 h-4" />
                              <a href={app.portfolio_link} target="_blank" rel="noreferrer" className="hover:underline truncate">View Portfolio</a>
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
