'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import {
  Loader2, AlertTriangle, Plus, Trash2, Upload, ImageIcon,
  Film, ArrowLeft, Eye, EyeOff, X, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { checkAdminAuth } from '@/app/actions/auth';
import { AdminGate } from '@/components/admin/AdminGate';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';
import { listPromptsAdmin, createPrompt, setPromptPublished, deletePrompt } from '@/app/actions/prompts';
import type { PromptItem, PromptKind } from '@/types/prompts';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // Cloudinary Free plan: 10MB per image
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // Cloudinary Free plan: 100MB per video

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none';

// Cloudinary renders a frame of a video when asked for the .jpg of it.
const posterFor = (videoUrl: string) => videoUrl.replace(/\.[a-z0-9]+$/i, '.jpg');

function PromptForm({ onCreated }: { onCreated: () => void }) {
  const [kind, setKind] = useState<PromptKind>('photo');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [uploads, setUploads] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mediaType: 'image' | 'video' = kind === 'photo' ? 'image' : 'video';

  const reset = () => {
    setTitle('');
    setPrompt('');
    setUploads('');
    setFile(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setDone(false);
    if (!title.trim() || !prompt.trim() || !file) {
      setErr('Title, prompt and the result file are required.');
      return;
    }
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (mediaType === 'image' && !isImage) return setErr('Photo prompts need an image file (JPG, PNG or WEBP).');
    if (mediaType === 'video' && !isVideo) return setErr('Video prompts need a video file (MP4, MOV or WEBM).');
    const max = mediaType === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size > max) return setErr(`File is too large: max ${max / 1024 / 1024}MB on the Cloudinary free plan.`);

    setUploading(true);
    try {
      const res = await uploadToCloudinary(file, mediaType, setProgress, 'prompts');
      const saved = await createPrompt({
        kind,
        title,
        prompt,
        uploads: uploads.split('\n'),
        mediaType,
        mediaUrl: res.secure_url,
        mediaPublicId: res.public_id,
        posterUrl: mediaType === 'video' ? posterFor(res.secure_url) : undefined,
        width: res.width,
        height: res.height,
      });
      if (!saved.success) throw new Error(saved.error || 'Could not save the prompt.');
      setDone(true);
      reset();
      onCreated();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
        {(['photo', 'video'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setFile(null);
              if (fileRef.current) fileRef.current.value = '';
            }}
            className={`py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              kind === k ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {k === 'photo' ? <ImageIcon className="w-4 h-4" /> : <Film className="w-4 h-4" />}
            {k === 'photo' ? 'Photo prompt' : 'Video prompt'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="p-title">Title *</label>
        <input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. REBEL — Cinematic Character Poster" className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="p-file">
          Result {mediaType === 'image' ? 'image' : 'video'} * <span className="normal-case font-medium text-slate-400">(max {mediaType === 'image' ? '10' : '100'}MB)</span>
        </label>
        <input
          id="p-file"
          ref={fileRef}
          type="file"
          accept={mediaType === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/quicktime,video/webm'}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="p-uploads">
          Upload with the prompt <span className="normal-case font-medium text-slate-400">(optional, one per line)</span>
        </label>
        <textarea
          id="p-uploads"
          rows={2}
          value={uploads}
          onChange={(e) => setUploads(e.target.value)}
          placeholder={'Your own photo (identity reference)\nThe reference poster (style reference)'}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="p-prompt">Prompt text *</label>
        <textarea
          id="p-prompt"
          rows={10}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste the full prompt here…"
          className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
        />
      </div>

      {err && (
        <p className="text-red-600 text-sm flex items-start gap-1.5">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {err}
        </p>
      )}
      {done && (
        <p className="text-emerald-700 text-sm flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Prompt uploaded and live on the site.
        </p>
      )}

      {uploading && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Uploading {mediaType}…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Upload {kind === 'photo' ? 'photo' : 'video'} prompt
      </button>
    </form>
  );
}

function PromptRow({ item, onChanged }: { item: PromptItem; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-4 items-center">
      <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900">
        {item.media.type === 'video' ? (
          <video src={item.media.src} poster={item.media.poster} muted playsInline preload="metadata" className="w-full h-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.media.src} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${item.kind === 'photo' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
            {item.kind}
          </span>
          {!item.published && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">Hidden</span>}
        </div>
        <p className="font-bold text-slate-900 truncate">{item.title}</p>
        <p className="text-xs text-slate-500 truncate">{item.prompt}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <a
          href={item.kind === 'photo' ? '/photo-prompts' : '/video-prompts'}
          target="_blank"
          rel="noopener noreferrer"
          title="Open page"
          className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => setPromptPublished(item.id, item.kind, !item.published))}
          title={item.published ? 'Hide from site' : 'Show on site'}
          className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center disabled:opacity-50"
        >
          {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (confirm(`Delete "${item.title}"? This removes it from the site.`)) run(() => deletePrompt(item.id, item.kind));
          }}
          title="Delete"
          className="w-9 h-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </li>
  );
}

export default function AdminPromptsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [items, setItems] = useState<PromptItem[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [filter, setFilter] = useState<'all' | PromptKind>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listPromptsAdmin();
    setItems(res.items);
    setListError(res.error ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAdminAuth().then((ok) => {
      setAuthed(ok);
      if (ok) load();
    });
  }, [load]);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!authed) {
    return (
      <AdminGate
        onAuth={() => {
          setAuthed(true);
          load();
        }}
      />
    );
  }

  const shown = filter === 'all' ? items : items.filter((i) => i.kind === filter);
  const missingTable = listError && /prompts|relation|schema cache/i.test(listError);

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <NextLink href="/admin-dashboard" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </NextLink>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="text-3xl font-black text-slate-900">Prompt Manager</h1>
          <button onClick={() => setShowForm((s) => !s)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Close form' : 'New Prompt'}
          </button>
        </div>

        {missingTable && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
            <p className="font-bold mb-1">One-time setup needed</p>
            <p>
              The <code className="font-mono">prompts</code> table doesn&apos;t exist in Supabase yet. Open Supabase → SQL Editor → New query, paste the contents of{' '}
              <code className="font-mono">src/scripts/prompts-schema.sql</code> and click Run. Then reload this page.
            </p>
          </div>
        )}
        {listError && !missingTable && (
          <p className="mb-6 text-red-600 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> {listError}
          </p>
        )}

        {showForm && (
          <div className="mb-10">
            <PromptForm onCreated={load} />
          </div>
        )}

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-lg font-black text-slate-900">Uploaded prompts ({items.length})</h2>
          <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl">
            {(['all', 'photo', 'video'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${filter === f ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mt-10" />
        ) : shown.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No prompts uploaded yet.</p>
        ) : (
          <ul className="space-y-3">
            {shown.map((item) => (
              <PromptRow key={item.id} item={item} onChanged={load} />
            ))}
          </ul>
        )}

        <p className="text-xs text-slate-400 mt-8">
          The REBEL poster prompt is built into the site and always shows on the Photo prompts page; it isn&apos;t listed here.
        </p>
      </div>
    </div>
  );
}
