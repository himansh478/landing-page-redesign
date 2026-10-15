'use client';

import { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Loader2, Lock, AlertTriangle, Plus, Trash2, Upload, ImageIcon,
  Film, ArrowLeft, Eye, EyeOff, X,
} from 'lucide-react';
import { checkAdminAuth, verifyAdminPassword } from '@/app/actions/auth';
import {
  listAllCoursesAdmin, createCourse, setCoursePublished, deleteCourse,
  listLessonsAdmin, addLesson, setLessonStatus, deleteLesson,
} from '@/app/actions/courses';
import type { Course, Lesson } from '@/types';

function AdminGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(false);
    const result = await verifyAdminPassword(password);
    if (result.success) onAuth();
    else setError(true);
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-sm shadow-sm space-y-4">
        <Lock className="w-8 h-8 text-indigo-600 mx-auto" />
        <h1 className="text-xl font-black text-center text-slate-900">Admin Access</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {error && (
          <p className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Incorrect password
          </p>
        )}
        <button disabled={verifying} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
          {verifying && <Loader2 className="w-4 h-4 animate-spin" />} Enter
        </button>
      </form>
    </div>
  );
}

// Thumbnails use the project's existing public preset. Course videos use a
// SEPARATE preset that must have "Access Mode: Authenticated" set in the
// Cloudinary dashboard — that setting is what actually keeps the video
// private; nothing in this client-side code can enforce it.
function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'video',
  preset: string,
  onProgress: (pct: number) => void
): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return new Promise((resolve, reject) => {
    if (!cloudName || !preset) return reject(new Error('Cloudinary env vars missing.'));
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Cloudinary upload failed: ' + xhr.responseText)));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.open('POST', url, true);
    xhr.send(formData);
  });
}

// Course videos: the server signs the request (and bakes in type:
// "authenticated") via /api/admin/courses/sign-upload, so this never
// depends on how an upload preset happens to be configured.
async function uploadVideoSigned(
  courseId: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<{ public_id: string }> {
  const signRes = await fetch('/api/admin/courses/sign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId }),
  });
  const signData = await signRes.json();
  if (!signData.success) throw new Error(signData.error || 'Could not sign the upload.');

  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${signData.cloudName}/video/upload`;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.apiKey);
    formData.append('timestamp', String(signData.timestamp));
    formData.append('signature', signData.signature);
    formData.append('folder', signData.folder);
    formData.append('type', signData.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Cloudinary upload failed: ' + xhr.responseText)));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.open('POST', url, true);
    xhr.send(formData);
  });
}

function CourseForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ slug: '', title: '', description: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    const result = await createCourse({
      slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
    });
    setSaving(false);
    if (!result.success) {
      setErr(result.error || 'Failed to create course.');
      return;
    }
    setForm({ slug: '', title: '', description: '', price: '' });
    onCreated();
  };

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
      <h3 className="font-bold text-slate-900">New Course</h3>
      <input
        required
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      <input
        required
        placeholder="URL slug (e.g. advanced-color-grading)"
        value={form.slug}
        onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
        rows={2}
      />
      <input
        required
        type="number"
        min="0"
        placeholder="Price in INR"
        value={form.price}
        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      {err && <p className="text-red-500 text-xs">{err}</p>}
      <button disabled={saving} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create Course
      </button>
    </form>
  );
}

function LessonUploadForm({ course, nextOrder, onAdded }: { course: Course; nextOrder: number; onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // Cloudinary's Free plan caps video uploads at 100MB/file

  const submit = async () => {
    if (!title || !videoFile) {
      setErr('Title and video file are required.');
      return;
    }
    if (videoFile.size > MAX_VIDEO_BYTES) {
      setErr(
        `This file is ${(videoFile.size / (1024 * 1024)).toFixed(0)}MB — Cloudinary's free plan caps videos at 100MB. ` +
        `Split this lesson into shorter parts, or compress it (lower bitrate/resolution) and try again.`
      );
      return;
    }
    setUploading(true);
    setErr(null);

    try {
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (thumbPreset) {
          setStage('Uploading thumbnail...');
          const res = await uploadToCloudinary(thumbnailFile, 'image', thumbPreset, (pct) => setProgress(Math.round(pct * 0.1)));
          thumbnailUrl = res.secure_url;
        }
      }

      setStage('Uploading video to Cloudinary (private)...');
      const videoRes = await uploadVideoSigned(course.id, videoFile, (pct) => setProgress(10 + Math.round(pct * 0.85)));

      setStage('Saving lesson...');
      setProgress(98);
      const result = await addLesson({
        course_id: course.id,
        title,
        description,
        order_index: nextOrder,
        thumbnail_url: thumbnailUrl || undefined,
        video_key: videoRes.public_id,
        is_free_preview: isFreePreview,
      });
      if (!result.success) throw new Error(result.error || 'Failed to save lesson.');

      setProgress(100);
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      setIsFreePreview(false);
      onAdded();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setStage('');
      setProgress(0);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add Lesson
      </h4>
      <input
        placeholder="Lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
      />

      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} />
        Make this a free public preview
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400">
          <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          <Film className="w-6 h-6 text-slate-400 mx-auto mb-1" />
          <p className="text-xs text-slate-500 break-all">{videoFile ? videoFile.name : 'Video file (max 100MB — split long lessons into parts)'}</p>
        </label>
        <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
          <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
          <p className="text-xs text-slate-500 break-all">{thumbnailFile ? thumbnailFile.name : 'Thumbnail (optional)'}</p>
        </label>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {err && <p className="text-red-500 text-xs">{err}</p>}

      <button
        onClick={submit}
        disabled={uploading || !title || !videoFile}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload Lesson
      </button>
    </div>
  );
}

function CourseCard({ course, onChanged }: { course: Course; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const loadLessons = useCallback(async () => {
    setLoadingLessons(true);
    const data = await listLessonsAdmin(course.id);
    setLessons(data);
    setLoadingLessons(false);
  }, [course.id]);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) loadLessons();
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">{course.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {course.published ? 'PUBLISHED' : 'DRAFT'}
            </span>
          </div>
          <p className="text-xs text-slate-500">/{course.slug} · ₹{course.price}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await setCoursePublished(course.id, !course.published);
              onChanged();
            }}
            title={course.published ? 'Unpublish' : 'Publish'}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            {course.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={async () => {
              if (confirm(`Delete "${course.title}" and all its lessons?`)) {
                await deleteCourse(course.id);
                onChanged();
              }
            }}
            title="Delete course"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={toggleOpen} className="text-xs font-bold text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg">
            {open ? 'Hide' : 'Manage Lessons'}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-5 pt-0 space-y-4 border-t border-slate-200">
          <LessonUploadForm course={course} nextOrder={lessons.length} onAdded={loadLessons} />

          {loadingLessons ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
          ) : lessons.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No lessons yet.</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 flex-wrap">
                    <span className="text-slate-400 w-5">{i + 1}.</span>
                    <span className="font-medium">{lesson.title}</span>
                    {lesson.is_free_preview && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">FREE PREVIEW</span>
                    )}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${lesson.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {lesson.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        await setLessonStatus(lesson.id, lesson.status === 'published' ? 'draft' : 'published');
                        loadLessons();
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600"
                      title="Toggle published"
                    >
                      {lesson.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Delete this lesson?')) {
                          await deleteLesson(lesson.id);
                          loadLessons();
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                      title="Delete"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminCoursesPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const data = await listAllCoursesAdmin();
    setCourses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAdminAuth().then((ok) => {
      setAuthed(ok);
      if (ok) loadCourses();
    });
  }, [loadCourses]);

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
          loadCourses();
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

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="text-3xl font-black text-slate-900">Course Manager</h1>
          <button onClick={() => setShowForm((s) => !s)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Course
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <CourseForm
              onCreated={() => {
                setShowForm(false);
                loadCourses();
              }}
            />
          </div>
        )}

        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mt-10" />
        ) : courses.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No courses yet. Create your first one above.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onChanged={loadCourses} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
