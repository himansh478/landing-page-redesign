'use client';

import { useEffect, useState, use as usePromise } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCourseBySlug, getPublicLessons } from '@/app/actions/courses';
import { Loader2, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import type { Course, Lesson } from '@/types';

export default function WatchCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = usePromise(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/my-courses/${slug}`);
        return;
      }

      const courseData = await getCourseBySlug(slug);
      if (!courseData) {
        setError('Course not found.');
        setLoading(false);
        return;
      }

      const { data: purchase } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('course_id', courseData.id)
        .eq('status', 'SUCCESS')
        .maybeSingle();

      if (!purchase) {
        router.push(`/courses/${slug}`);
        return;
      }

      const lessonData = await getPublicLessons(courseData.id);
      setCourse(courseData);
      setLessons(lessonData);
      setOwned(true);
      setLoading(false);
      if (lessonData.length > 0) setActiveLessonId(lessonData[0].id);
    };
    load();
  }, [slug, router]);

  useEffect(() => {
    const loadVideo = async () => {
      if (!activeLessonId) return;
      setVideoLoading(true);
      setVideoUrl(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/courses/playback-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ lessonId: activeLessonId }),
        });
        const data = await res.json();
        if (data.success) setVideoUrl(data.url);
        else setError(data.error || 'Could not load this video.');
      } finally {
        setVideoLoading(false);
      }
    };
    loadVideo();
  }, [activeLessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error && !owned) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/my-courses" className="text-sm text-slate-400 hover:text-white mb-6 inline-block">
          &larr; My Courses
        </Link>
        <h1 className="text-2xl font-black mb-6">{course?.title}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              {videoLoading ? (
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              ) : videoUrl ? (
                <video key={videoUrl} src={videoUrl} controls controlsList="nodownload" className="w-full h-full" autoPlay />
              ) : (
                <p className="text-slate-500 text-sm px-6 text-center">{error || 'Select a lesson to begin.'}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {lessons.map((lesson, i) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                  activeLessonId === lesson.id ? 'bg-indigo-600' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <PlayCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {i + 1}. {lesson.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
