'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import {
  Loader2, AlertTriangle, ArrowLeft, CheckCircle2, Send, Package, Plus, Eye, EyeOff, Save, Film, ExternalLink,
} from 'lucide-react';
import { checkAdminAuth } from '@/app/actions/auth';
import {
  getTelegramAdminData, savePackageLinks, saveClipLinks, setClipActive, createTelegramClip,
  type TelegramAdminData, type AdminTelegramClip,
} from '@/app/actions/telegram-admin';
import { AdminGate } from '@/components/admin/AdminGate';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

const CATEGORIES = ['Wedding', 'Cinematic', 'Commercial', 'Corporate', 'Drone', 'Reel'];
const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none';
const labelClass = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';
const LINKS_PLACEHOLDER = 'https://t.me/c/3930487618/4\nhttps://t.me/c/3930487618/5';

function Notice({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={`text-sm flex items-start gap-1.5 ${ok ? 'text-emerald-700' : 'text-red-600'}`}>
      {ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
      {text}
    </p>
  );
}

function PackageEditor({ pkg, onSaved }: { pkg: TelegramAdminData['packages'][number]; onSaved: () => void }) {
  const [value, setValue] = useState(pkg.links.join('\n'));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const res = await savePackageLinks(pkg.packageType, value);
    setBusy(false);
    setMsg(res.success ? { ok: true, text: `Saved: ${res.count} file(s) in ${pkg.packageType}.` } : { ok: false, text: res.error || 'Save failed.' });
    if (res.success) onSaved();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-black text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-600" /> {pkg.packageType} pack <span className="text-slate-400 font-bold">₹{pkg.price}</span>
        </p>
        <span className="text-xs font-bold text-slate-500">{pkg.links.length} file(s)</span>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={LINKS_PLACEHOLDER}
        aria-label={`${pkg.packageType} pack Telegram links`}
        className={`${inputClass} font-mono text-xs resize-y`}
      />
      {msg && <Notice {...msg} />}
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save {pkg.packageType}
      </button>
    </div>
  );
}

function AddClipForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wedding');
  const [isFree, setIsFree] = useState(true);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState('');
  const [links, setLinks] = useState('');
  const [thumb, setThumb] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (thumb && !thumb.type.startsWith('image/')) return setMsg({ ok: false, text: 'Thumbnail must be an image.' });
    if (thumb && thumb.size > 10 * 1024 * 1024) return setMsg({ ok: false, text: 'Thumbnail is too large (max 10MB).' });

    setBusy(true);
    try {
      let thumbnailUrl: string | undefined;
      if (thumb) thumbnailUrl = (await uploadToCloudinary(thumb, 'image', setProgress, 'raw-clips/thumbnails')).secure_url;
      const res = await createTelegramClip({ title, category, description, duration, tags, isFree, thumbnailUrl, links });
      if (!res.success) throw new Error(res.error || 'Could not add the clip.');
      setMsg({ ok: true, text: `Added "${title}" with ${res.count} Telegram file(s). It's live on /raw-clips.` });
      setTitle('');
      setDescription('');
      setDuration('');
      setTags('');
      setLinks('');
      setThumb(null);
      setProgress(0);
      if (thumbRef.current) thumbRef.current.value = '';
      onCreated();
    } catch (err: unknown) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not add the clip.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="tc-title">Title *</label>
          <input id="tc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Golden Hour Wedding — Raw 4K" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="tc-category">Category *</label>
          <select id="tc-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
        {[true, false].map((free) => (
          <button
            key={String(free)}
            type="button"
            onClick={() => setIsFree(free)}
            className={`py-2.5 rounded-lg text-sm font-bold ${isFree === free ? 'bg-indigo-600 text-white shadow' : 'text-slate-600'}`}
          >
            {free ? 'Free clip' : 'Paid clip'}
          </button>
        ))}
      </div>

      <div>
        <label className={labelClass} htmlFor="tc-links">Telegram message link(s) * <span className="normal-case font-medium text-slate-400">(one per line)</span></label>
        <textarea id="tc-links" rows={3} value={links} onChange={(e) => setLinks(e.target.value)} placeholder={LINKS_PLACEHOLDER} className={`${inputClass} font-mono text-xs resize-y`} />
      </div>

      <div>
        <label className={labelClass} htmlFor="tc-thumb">Thumbnail image <span className="normal-case font-medium text-slate-400">(recommended, max 10MB)</span></label>
        <input
          id="tc-thumb"
          ref={thumbRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setThumb(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold"
        />
        {busy && thumb && <p className="text-xs text-slate-500 mt-1">Uploading thumbnail… {progress}%</p>}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className={labelClass} htmlFor="tc-duration">Duration</label>
          <input id="tc-duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="00:34" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="tc-tags">Tags <span className="normal-case font-medium text-slate-400">(comma separated)</span></label>
          <input id="tc-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="wedding, golden hour, outdoor" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="tc-desc">Description</label>
        <textarea id="tc-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-y`} />
      </div>

      {msg && <Notice {...msg} />}

      <button type="submit" disabled={busy} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add clip
      </button>
    </form>
  );
}

function ClipRow({ clip, onChanged }: { clip: AdminTelegramClip; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(clip.links.join('\n'));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    const res = await saveClipLinks(clip.id, value);
    setBusy(false);
    setMsg(res.success ? { ok: true, text: `Saved ${res.count} file(s).` } : { ok: false, text: res.error || 'Save failed.' });
    if (res.success) onChanged();
  };

  const toggle = async () => {
    setBusy(true);
    const res = await setClipActive(clip.id, !clip.is_active);
    setBusy(false);
    if (!res.success) setMsg({ ok: false, text: res.error || 'Failed.' });
    else onChanged();
  };

  return (
    <li className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex gap-3 items-center">
        <div className="w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
          {clip.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={clip.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Film className="w-5 h-5 text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${clip.is_free ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {clip.is_free ? 'Free' : 'Paid'}
            </span>
            {!clip.is_active && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">Hidden</span>}
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${clip.links.length ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-600'}`}>
              {clip.links.length ? `${clip.links.length} on Telegram` : 'Not on Telegram'}
            </span>
          </div>
          <p className="font-bold text-slate-900 truncate">{clip.title}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button type="button" onClick={() => setOpen((o) => !o)} className="px-3 h-9 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold">
            {open ? 'Close' : 'Links'}
          </button>
          <button
            type="button"
            onClick={toggle}
            disabled={busy}
            title={clip.is_active ? 'Hide from site' : 'Show on site'}
            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center disabled:opacity-50"
          >
            {clip.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          <textarea rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder={LINKS_PLACEHOLDER} aria-label={`Telegram links for ${clip.title}`} className={`${inputClass} font-mono text-xs resize-y`} />
          <button type="button" onClick={save} disabled={busy} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save links
          </button>
        </div>
      )}
      {msg && <div className="mt-2"><Notice {...msg} /></div>}
    </li>
  );
}

export default function AdminTelegramPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<TelegramAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setData(await getTelegramAdminData());
    setLoading(false);
    // Remount editors so they pick up freshly saved values
    setVersion((v) => v + 1);
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

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <NextLink href="/admin-dashboard" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </NextLink>

        <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
          <Send className="w-7 h-7 text-indigo-600" /> Telegram Files
        </h1>
        <p className="text-slate-500 mb-8">Raw clips are stored in your private Telegram channel; the bot sends them to buyers.</p>

        {loading && !data ? (
          <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mt-10" />
        ) : data ? (
          <div className="space-y-10">
            {/* Status */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border text-sm ${data.configured ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <p className="font-bold mb-1">{data.configured ? 'Bot connected' : 'Bot not configured'}</p>
                {data.configured ? (
                  <a href={`https://t.me/${data.botUsername}`} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                    @{data.botUsername} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p>Add TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME and TELEGRAM_STORAGE_CHAT_ID to .env.local.</p>
                )}
              </div>
              <div className="p-4 rounded-2xl border bg-white border-slate-200 text-sm text-slate-600">
                <p className="font-bold text-slate-900 mb-1">How to add a file</p>
                <p>Upload it to <b>Cwaya Storage</b> as a file → right-click → <b>Copy Message Link</b> → paste it below.</p>
              </div>
            </div>

            {data.setupError ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
                <p className="font-bold mb-1">One-time database setup needed</p>
                <p>
                  The raw clips tables don&apos;t exist in Supabase yet. Open Supabase → SQL Editor → New query, paste the contents of{' '}
                  <code className="font-mono">src/scripts/raw-clips-schema.sql</code> and click Run. Then reload this page.
                </p>
                <p className="mt-2 text-xs text-amber-700/80">Details: {data.setupError}</p>
              </div>
            ) : (
              <>
                <section>
                  <h2 className="text-lg font-black text-slate-900 mb-3">Paid packages</h2>
                  <p className="text-sm text-slate-500 mb-4">Files the bot sends after someone buys a pack.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.packages.map((p) => (
                      <PackageEditor key={`${p.packageType}-${version}`} pkg={p} onSaved={load} />
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-black text-slate-900 mb-3">Add a clip from Telegram</h2>
                  <AddClipForm onCreated={load} />
                </section>

                <section>
                  <h2 className="text-lg font-black text-slate-900 mb-3">All clips ({data.clips.length})</h2>
                  {data.clips.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">No clips yet. Add your first one above.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.clips.map((c) => (
                        <ClipRow key={`${c.id}-${version}`} clip={c} onChanged={load} />
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
