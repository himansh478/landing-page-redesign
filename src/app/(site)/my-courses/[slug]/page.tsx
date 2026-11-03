'use client';

import { useEffect, useState, use as usePromise } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCourseBySlug, getPublicLessons } from '@/app/actions/courses';
import { Loader2, PlayCircle, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <Loader2 className="w-7 h-7 animate-spin text-coral" aria-label="Loading course" />
      </div>
    );
  }

  if (error && !owned) {
    return <div className="on-ink min-h-screen flex items-center justify-center bg-ink px-4 text-center">{error}</div>;
  }

  const activeIndex = lessons.findIndex((l) => l.id === activeLessonId);

  // The "screening room": dark so the video is the brightest thing on screen.
  return (
    <div className="on-ink min-h-screen bg-ink text-ivory pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-4 pb-5 mb-8 border-b border-ivory/10">
          <Link href="/my-courses" className="pencil-link slate text-ivory/70 inline-flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            My courses
          </Link>
          {activeIndex >= 0 && (
            <p className="slate text-coral tabular">
              Lesson {String(activeIndex + 1).padStart(2, '0')} / {String(lessons.length).padStart(2, '0')}
            </p>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] mb-8">{course?.title}</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="relative aspect-video bg-black rounded-[4px] overflow-hidden flex items-center justify-center ring-1 ring-ivory/10">
              {videoLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-coral" aria-label="Loading video" />
              ) : videoUrl ? (
                <video key={videoUrl} src={videoUrl} controls controlsList="nodownload" className="w-full h-full" autoPlay />
              ) : (
                <p className="text-ivory/60 text-sm px-6 text-center">{error || 'Select a lesson to begin.'}</p>
              )}
            </div>
            {activeIndex >= 0 && (
              <div className="mt-5">
                <h2 className="font-display text-xl font-bold">{lessons[activeIndex].title}</h2>
                {lessons[activeIndex].description && (
                  <p className="text-ivory/70 mt-2 leading-relaxed">{lessons[activeIndex].description}</p>
                )}
              </div>
            )}
          </div>

          <nav className="lg:col-span-4" aria-label="Lessons">
            <p className="slate text-ivory/45 mb-3">Reel log</p>
            <ol className="border-t border-ivory/10">
              {lessons.map((lesson, i) => {
                const isActive = activeLessonId === lesson.id;
                return (
                  <li key={lesson.id} className="border-b border-ivory/10">
                    <button
                      onClick={() => setActiveLessonId(lesson.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative w-full text-left py-4 pl-4 pr-3 flex items-center gap-3 transition-colors ${
                        isActive ? 'bg-ivory/[0.06] text-ivory' : 'text-ivory/70 hover:text-ivory hover:bg-ivory/[0.03]'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors ${isActive ? 'bg-coral' : 'bg-transparent'}`}
                      />
                      <span className="slate text-ivory/45 w-7 flex-shrink-0 tabular">{String(i + 1).padStart(2, '0')}</span>
                      <span className="flex-1 !text-sm font-medium">{lesson.title}</span>
                      <PlayCircle className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-coral' : 'text-ivory/40'}`} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}
