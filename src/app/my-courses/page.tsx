'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, ArrowUpRight } from 'lucide-react';
import type { Course } from '@/types';

export default function MyCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/my-courses');
        return;
      }

      const { data } = await supabase
        .from('course_purchases')
        .select('course_id, courses(id, slug, title, description, cover_image_url, price, published, created_at)')
        .eq('status', 'SUCCESS');

      type Row = { courses: Course | Course[] | null };
      const rows = (data || []) as unknown as Row[];
      const list = rows
        .map((p) => (Array.isArray(p.courses) ? p.courses[0] : p.courses))
        .filter((c): c is Course => !!c);
      setCourses(list);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-editorial" aria-label="Loading your courses" />
      </div>
    );
  }

  return (
    <div className="grain relative min-h-screen bg-ivory pt-28 sm:pt-32 pb-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4 pb-5 mb-10 border-b border-ink/15">
          <p className="slate slate-mark text-editorial">Your library</p>
          <p className="slate text-ink/50 tabular">{courses.length} {courses.length === 1 ? 'course' : 'courses'}</p>
        </div>

        <h1 className="font-display font-extrabold text-ink tracking-[-0.04em] !leading-[0.95] [font-size:clamp(2.75rem,1rem+5vw,6rem)] mb-14">
          My courses
        </h1>

        {courses.length === 0 ? (
          <div className="border-y border-ink/15 py-16 text-center">
            <p className="text-ink/65 mb-5">You haven&apos;t bought any courses yet.</p>
            <Link href="/courses" className="pencil-link font-semibold text-ink">
              Browse courses
            </Link>
          </div>
        ) : (
          <ul className="border-t border-ink/20">
            {courses.map((course, i) => (
              <li key={course.id} className="border-b border-ink/20">
                <Link href={`/my-courses/${course.slug}`} className="group grid grid-cols-12 gap-4 items-center py-6">
                  <span className="col-span-2 sm:col-span-1 slate text-ink/45 tabular">{String(i + 1).padStart(2, '0')}</span>
                  <div className="col-span-3 sm:col-span-2 aspect-video rounded-[3px] overflow-hidden bg-editorial">
                    {course.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.cover_image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h2 className="col-span-5 sm:col-span-7 font-display text-xl sm:text-2xl font-bold text-ink tracking-[-0.02em] transition-colors group-hover:text-editorial">
                    {course.title}
                  </h2>
                  <span className="col-span-2 justify-self-end slate text-ink/60 flex items-center gap-1.5">
                    <span className="hidden sm:inline">Watch</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 ease-reveal group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
