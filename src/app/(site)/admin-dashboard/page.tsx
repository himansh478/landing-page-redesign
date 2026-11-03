'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import NextLink from 'next/link';
import { Loader2, IndianRupee, Activity, Lock, AlertTriangle, ImageIcon, LogOut, CheckCircle2, Download, ShieldCheck, Film, Upload, Trash2, Plus, X, GraduationCap, Sparkles, Send } from 'lucide-react';
import { verifyAdminPassword, checkAdminAuth, logoutAdmin } from '@/app/actions/auth';
import { getAllClips, deleteClip } from '@/app/actions/clips';
import { listRawClipPurchasesAdmin } from '@/app/actions/telegram-admin';

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
    } catch {
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
  const [purchases, setPurchases] = useState<PurchaseLog[]>([]);
  const [clips, setClips] = useState<RawClip[]>([]);
  const [activeTab, setActiveTab] = useState<'purchases' | 'clips'>('purchases');
  const [loading, setLoading] = useState(true);
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
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
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
      // Fetch raw clips purchases (server-side: the table is locked to the browser)
      const purchasesData = await listRawClipPurchasesAdmin();
      setPurchases(purchasesData as PurchaseLog[]);

      // Fetch raw clips
      const clipsData = await getAllClips();
      if (clipsData) setClips(clipsData);
      setError(null);
    } catch (err: unknown) {
      setError((err instanceof Error && err.message) || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load after the effect body so no state is set synchronously inside it
    void Promise.resolve().then(fetchData);
  }, [isAuthenticated, fetchData]);

  if (!isAuthenticated) {
    return <AdminAuthGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (loading && purchases.length === 0 && clips.length === 0) {
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
            Manage raw clips sales, courses and prompts.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <NextLink
              href="/admin-dashboard/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              <GraduationCap className="w-4 h-4" /> Manage Courses
            </NextLink>
            <NextLink
              href="/admin-dashboard/prompts"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Manage Prompts
            </NextLink>
            <NextLink
              href="/admin-dashboard/telegram"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              <Send className="w-4 h-4" /> Telegram Files
            </NextLink>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-200/60 p-1 rounded-2xl flex gap-1 border border-slate-300/30">
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
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
                      if (files.length) setVideoFiles(prev => [...prev, ...files]);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-indigo-50/30"
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) setVideoFiles(prev => [...prev, ...files]);
                        if (e.target) e.target.value = '';
                      }}
                    />
                    <Film className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        {videoFiles.length > 0 ? 'Add More Videos' : 'Video File Upload *'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {videoFiles.length > 0 
                          ? `${videoFiles.length} videos selected (${(videoFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB)`
                          : 'MP4, MOV, AVI, WebM — Max 500MB (Select Multiple)'
                        }
                      </p>
                    </div>

                    {videoFiles.length > 0 && (
                      <div className="mt-4 space-y-2 text-left" onClick={e => e.stopPropagation()}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Selected Files:</p>
                        <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
                          {videoFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px]">
                              <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={file.name}>
                                {file.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-[10px]">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                                <button
                                  type="button"
                                  onClick={() => setVideoFiles(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1 hover:bg-slate-200 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
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
                  disabled={isUploading || !clipForm.title || videoFiles.length === 0 || !thumbnailFile}
                  onClick={async () => {
                    setIsUploading(true);
                    setUploadError(null);
                    setUploadSuccess(false);
                    setUploadProgress(5);

                    try {
                      
                      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                      
                      if (!cloudName || !uploadPreset) {
                        throw new Error('Cloudinary configuration missing in environment variables.');
                      }

                      const uploadToCloudinary = (file: File, resourceType: 'video' | 'image', onProgress: (pct: number) => void): Promise<{ public_id: string }> => {
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
                      
                      // 2. Upload Videos to Cloudinary (takes 10% to 90% progress)
                      const videoKeys: string[] = [];
                      const totalVideos = videoFiles.length;
                      for (let i = 0; i < totalVideos; i++) {
                        const file = videoFiles[i];
                        const videoRes = await uploadToCloudinary(file, 'video', (pct) => {
                          const startPct = 10 + (i * 80) / totalVideos;
                          const sharePct = 80 / totalVideos;
                          const currentPct = Math.round(startPct + (pct * sharePct) / 100);
                          setUploadProgress(currentPct);
                        });
                        videoKeys.push(videoRes.public_id);
                      }
                      
                      const videoKey = videoKeys.join(',');
                      
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
                      setVideoFiles([]);
                      setThumbnailFile(null);
                      setUploadProgress(0);
                      if (videoInputRef.current) videoInputRef.current.value = '';
                      if (thumbInputRef.current) thumbInputRef.current.value = '';

                      // Refresh clips list
                      fetchData();

                      setTimeout(() => {
                        setUploadSuccess(false);
                      }, 3000);
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
                                const res = await deleteClip(clip.id);
                                if (res.success) fetchData();
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
